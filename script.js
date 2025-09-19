// Simple Tic-Tac-Toe with Minimax AI. Board index:
// 0 1 2
// 3 4 5
// 6 7 8

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const undoBtn = document.getElementById('undoBtn');
const firstSelect = document.getElementById('firstSelect');
const scoreEl = document.getElementById('score');

let board = Array(9).fill(null); // 'X' or 'O' or null
let human = 'X';
let ai = 'O';
let current = 'X';
let gameOver = false;
let history = [];
let scores = {human:0, ai:0, draw:0};

// create cells
for(let i=0;i<9;i++){
  const c = document.createElement('div');
  c.className = 'cell';
  c.dataset.index = i;
  c.setAttribute('role','button');
  c.setAttribute('aria-label', 'cell '+(i+1));
  c.addEventListener('click', onCellClick);
  boardEl.appendChild(c);
}

function render(){
  for(let i=0;i<9;i++){
    const el = boardEl.children[i];
    el.textContent = board[i] ? board[i] : '';
    el.classList.toggle('x', board[i]==='X');
    el.classList.toggle('o', board[i]==='O');
    el.style.pointerEvents = (board[i] || gameOver) ? 'none' : 'auto';
  }

  if(gameOver){
    const winner = checkWinner(board);
    if(winner === human){ statusEl.textContent = 'You win! 🎉'; }
    else if(winner === ai){ statusEl.textContent = 'AI wins. Try again.'; }
    else{ statusEl.textContent = 'Draw.'; }
  } else {
    statusEl.textContent = (current === human) ? "Your turn (X)" : "AI is thinking...";
  }

  scoreEl.textContent = `Wins — You: ${scores.human} | AI: ${scores.ai} | Draws: ${scores.draw}`;
}

function onCellClick(e){
  const i = Number(e.currentTarget.dataset.index);
  if(gameOver || board[i]) return;
  makeMove(i, current);
}

function makeMove(i, player){
  if(board[i] || gameOver) return;
  history.push(board.slice());
  board[i] = player;
  // switch
  current = (player === 'X') ? 'O' : 'X';
  checkAndProceed();
  render();
  // if it's AI's turn and game not over, let AI play
  if(!gameOver && current === ai){
    // small delay so UI updates show "AI is thinking..."
    setTimeout(()=>{ aiTurn(); }, 180);
  }
}

function aiTurn(){
  const move = findBestMove(board, ai);
  if(move >= 0){ makeMove(move, ai); }
}

resetBtn.addEventListener('click', ()=>{
  startNewGame();
});

undoBtn.addEventListener('click', ()=>{
  if(history.length===0 || gameOver) return;
  board = history.pop();
  // set current based on counts
  const xCount = board.filter(v=>v==='X').length;
  const oCount = board.filter(v=>v==='O').length;
  current = (xCount<=oCount) ? 'X' : 'O';
  gameOver = false;
  render();
});

firstSelect.addEventListener('change', ()=>{
  const who = firstSelect.value; // 'human' or 'ai'
  if(who==='human'){ human='X'; ai='O'; }
  else { human='O'; ai='X'; }
  startNewGame();
});

function startNewGame(){
  board = Array(9).fill(null);
  history = [];
  gameOver = false;
  current = (human === 'X') ? 'X' : 'X'; // X always starts per rules
  // if AI is X and chosen to go first, let AI play
  if(ai === 'X'){
    // AI starts
    setTimeout(()=>{ aiTurn(); }, 160);
  }
  render();
}

// ---------- Game logic helpers ----------
function checkWinner(b){
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for(const [a,c,d] of wins){
    if(b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  if(b.every(Boolean)) return 'draw';
  return null;
}

// Minimax implementation
function findBestMove(b, player){
  // returns index 0..8
  let bestVal = -Infinity;
  let bestMove = -1;
  for(let i=0;i<9;i++){
    if(!b[i]){
      b[i] = player;
      const moveVal = minimax(b, 0, false, player);
      b[i] = null;
      if(moveVal > bestVal){ bestVal = moveVal; bestMove = i; }
    }
  }
  return bestMove;
}

function minimax(b, depth, isMaximizing, playerSymbol){
  const opponent = (playerSymbol === 'X') ? 'O' : 'X';
  const winner = checkWinner(b);
  if(winner !== null){
    if(winner === playerSymbol) return 10 - depth;
    if(winner === opponent) return depth - 10;
    if(winner === 'draw') return 0;
  }

  if(isMaximizing){
    let best = -Infinity;
    for(let i=0;i<9;i++){
      if(!b[i]){
        b[i] = playerSymbol;
        best = Math.max(best, minimax(b, depth+1, false, playerSymbol));
        b[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for(let i=0;i<9;i++){
      if(!b[i]){
        b[i] = opponent;
        best = Math.min(best, minimax(b, depth+1, true, playerSymbol));
        b[i] = null;
      }
    }
    return best;
  }
}

function checkAndProceed(){
  const winner = checkWinner(board);
  if(winner){
    gameOver = true;
    if(winner === human) scores.human++;
    else if(winner === ai) scores.ai++;
    else if(winner === 'draw') scores.draw++;
  }
}

// start
startNewGame();
render();

// keyboard accessibility: allow number keys 1-9
window.addEventListener('keydown', e=>{
  if(gameOver) return;
  const key = e.key;
  if(!/^[1-9]$/.test(key)) return;
  const idx = Number(key)-1;
  if(current === human){ makeMove(idx, human); }
});
