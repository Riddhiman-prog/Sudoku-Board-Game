const boardElement = document.getElementById('sudoku-board');
let originalBoard = [];
let solutionBoard = [];
let seconds = 0;
let timerInterval;

// Event listeners
document.getElementById('new-game').addEventListener('click', generateNewBoard);
document.getElementById('check-btn').addEventListener('click', checkSolution);
document.getElementById('reset-leaderboard').addEventListener('click', resetLeaderboard);
document.getElementById('hint-btn').addEventListener('click', giveHint);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
document.getElementById('font-select').addEventListener('change', changeFont);
document.getElementById('font-size').addEventListener('input', changeFontSize);

// Difficulty dropdown
document.getElementById('difficulty').addEventListener('change', generateNewBoard);

function startTimer() {
  seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    document.getElementById("timer").innerText = `Time: ${minutes}:${secs}`;
  }, 1000);
}

function generateNewBoard() {
  clearInterval(timerInterval);
  startTimer();

  boardElement.innerHTML = '';

  const difficulty = document.getElementById('difficulty').value;
  const clues = difficulty === "easy" ? 45 : difficulty === "medium" ? 35 : 25;

  solutionBoard = generateFullSolution();
  originalBoard = removeCells(JSON.parse(JSON.stringify(solutionBoard)), clues);

  renderBoard(originalBoard);
}

function generateFullSolution() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveSudoku(board);
  return board;
}

function removeCells(board, clues) {
  let attempts = 81 - clues;
  while (attempts > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    if (board[row][col] !== 0) {
      board[row][col] = 0;
      attempts--;
    }
  }
  return board;
}

function renderBoard(puzzle) {
  boardElement.innerHTML = '';
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = document.createElement('input');
      cell.classList.add('cell');
      cell.setAttribute('maxlength', '1');
      cell.setAttribute('data-row', row);
      cell.setAttribute('data-col', col);

      const value = puzzle[row][col];
      if (value !== 0) {
        cell.value = value;
        cell.disabled = true;
        cell.classList.add('prefilled');
      }

      boardElement.appendChild(cell);
    }
  }
}
changeFont();  // to re-apply selected font
changeFontSize(); // to re-apply selected size



function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        let nums = shuffle([1,2,3,4,5,6,7,8,9]);
        for (let num of nums) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isSafe(board, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num || board[x][col] === num) return false;
  }

  const startRow = row - row % 3;
  const startCol = col - col % 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }

  return true;
}

function checkSolution() {
  const cells = document.querySelectorAll('.cell');
  let currentBoard = [];

  for (let i = 0; i < 9; i++) {
    currentBoard.push([]);
    for (let j = 0; j < 9; j++) {
      const index = i * 9 + j;
      const val = cells[index].value;
      currentBoard[i].push(Number(val) || 0);
    }
  }

  highlightInvalidCells(currentBoard);

  if (!isValidSudoku(currentBoard)) {
    alert("❌ Incorrect solution. Check highlighted errors.");
  } else {
    clearInterval(timerInterval);
    alert(`🎉 Congratulations! You solved the puzzle in ${formatTime(seconds)}.`);
    saveTimeToLeaderboard(seconds);
    displayLeaderboard();
  }
}

function highlightInvalidCells(board) {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => cell.style.backgroundColor = '');

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const value = board[i][j];
      if (value === 0) continue;

      board[i][j] = 0;
      if (!isSafe(board, i, j, value)) {
        const index = i * 9 + j;
        cells[index].style.backgroundColor = '#f8d7da';
      }
      board[i][j] = value;
    }
  }
}

function isValidSudoku(board) {
  const isValid = (arr) => {
    const nums = arr.filter(n => n !== 0);
    return new Set(nums).size === nums.length;
  };

  for (let i = 0; i < 9; i++) {
    const row = board[i];
    const col = board.map(r => r[i]);
    const box = [];

    const boxRow = Math.floor(i / 3) * 3;
    const boxCol = (i % 3) * 3;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        box.push(board[boxRow + r][boxCol + c]);
      }
    }

    if (!isValid(row) || !isValid(col) || !isValid(box)) return false;
  }

  return true;
}

function giveHint() {
  const cells = document.querySelectorAll('.cell');
  for (let i = 0; i < 81; i++) {
    const cell = cells[i];
    if (!cell.disabled && cell.value === '') {
      const row = parseInt(cell.getAttribute('data-row'));
      const col = parseInt(cell.getAttribute('data-col'));
      cell.value = solutionBoard[row][col];
      cell.classList.add('hinted');
      break;
    }
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
}

function changeFont() {
  const font = document.getElementById('font-select').value;
  const board = document.querySelectorAll('.cell');
  board.forEach(cell => {
    cell.style.fontFamily = font;
  });
}

function changeFontSize() {
  const size = document.getElementById('font-size').value;
  const board = document.querySelectorAll('.cell');
  board.forEach(cell => {
    cell.style.fontSize = `${size}px`;
  });
}



function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${secs}`;
}

function saveTimeToLeaderboard(seconds) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push(seconds);
  leaderboard.sort((a, b) => a - b);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function displayLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  list.innerHTML = '';

  leaderboard.forEach((sec, index) => {
    const time = formatTime(sec);
    const li = document.createElement('li');
    li.textContent = `#${index + 1}: ${time}`;
    list.appendChild(li);
  });
}

function resetLeaderboard() {
  const confirmReset = confirm("Are you sure you want to reset the leaderboard?");
  if (confirmReset) {
    localStorage.removeItem("leaderboard");
    displayLeaderboard();
    alert("Leaderboard has been reset! 🧹");
  }
}

// Init on load
window.onload = () => {
  generateNewBoard();
  displayLeaderboard();
};

// // 🌙 Dark Mode Toggle
// document.getElementById("toggle-dark").addEventListener("click", () => {
//   document.body.classList.toggle("dark-mode");
// });

// // 🔠 Font Size Control
// document.getElementById("font-size").addEventListener("change", (e) => {
//   const newSize = e.target.value + "px";
//   document.querySelectorAll(".cell").forEach(cell => {
//     cell.style.fontSize = newSize;
//   });
// });

