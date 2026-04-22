//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

const assert = require('assert');

const SIZE = 16;

boxedNumber = [];
for (i = 0; i < SIZE; i++) boxedNumber.push([i.toString(16)]);

init = require('fs').readFileSync(config.input, 'ascii')
  .trim()
  .split(config.newline)
  .map(function (line) { return line.split(' ').map(Number); });
init = [].concat(init[0], init[1], init[2], init[3]);
init = init.map(function (num) { return boxedNumber[num]; });

goal = [];
for (i = 1; i < SIZE; i++) goal.push(boxedNumber[i]);
goal.push(boxedNumber[0]);

board = [].concat(init);

north = [null,null,null,null,0,1,2,3,4,5,6,7,8,9,10,11];
south = [4,5,6,7,8,9,10,11,12,13,14,15,null,null,null,null];
west = [null,0,1,2,null,4,5,6,null,8,9,10,null,12,13,14];
east = [1,2,3,null,5,6,7,null,9,10,11,null,13,14,15,null];

distance = [];
for (i = 0; i < SIZE; i++) distance.push(new Array(Math.sqrt(SIZE)));
for (i = 0; i < Math.sqrt(SIZE); i++)
  for (j = 0; j < Math.sqrt(SIZE); j++)
    for (k = 0; k < Math.sqrt(SIZE); k++)
      for (l = 0; l < Math.sqrt(SIZE); l++)
        distance[Math.sqrt(SIZE)*i+j][Math.sqrt(SIZE)*k+l]
          = Math.abs(i-k) + Math.abs(j-l);

const INIT_DIRECTION = 0, N = 1, S = 2, W = 3, E = 4;

function iddfs(board, step, max, space, prevDir) {
  var i, d, next;
  if (step === max) {
    for (i in board)
      if (board[i] !== goal[i]) return false;
    return true;
  }
 
  /* 
  d = 0;
  for (i in boxedNumber) {
    d += distance[board.indexOf(boxedNumber[i])][goal.indexOf(boxedNumber[i])];
  }
  d = Math.floor(d / 2);
  if (step + d > max) return false;
  */

  if (prevDir !== S && (next = north[space])) {
    board[space] = board[next];
    board[next] = boxedNumber[0];
    if (iddfs(board, step + 1, max, next)) return true;
    board[next] = board[space];
    board[space] = boxedNumber[0];
  }
  if (prevDir !== N && (next = south[space])) {
    board[space] = board[next];
    board[next] = boxedNumber[0];
    if (iddfs(board, step + 1, max, next)) return true;
    board[next] = board[space];
    board[space] = boxedNumber[0];
  }
  if (prevDir !== E && (next = west[space])) {
    board[space] = board[next];
    board[next] = boxedNumber[0];
    if (iddfs(board, step + 1, max, next)) return true;
    board[next] = board[space];
    board[space] = boxedNumber[0];
  }
  if (prevDir !== W && (next = east[space])) {
    board[space] = board[next];
    board[next] = boxedNumber[0];
    if (iddfs(board, step + 1, max, next)) return true;
    board[next] = board[space];
    board[space] = boxedNumber[0];
  }
  return false;
}

for (i = 0; i <= 45; i++)
  if (iddfs(board, 0, i, init.indexOf(boxedNumber[0]))) break;
console.log(i);