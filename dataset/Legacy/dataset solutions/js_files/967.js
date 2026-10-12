//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

const assert = require('assert');

const SIZE = 16;

boxedNumber = [];
for (i = 0; i < SIZE; i++) boxedNumber.push([i]);

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

near = [
  [1,4], [0,2,5], [1,3,6], [2,7],
  [0,5,8], [1,4,6,9], [2,5,7,10], [3,6,11],
  [4,9,12], [5,8,10,13], [6,9,11,14], [7,10,15],
  [8,13], [9,12,14], [10,13,15], [11,14] ];

function iddfs(board, step, max, space) {
  var i, d, next;
  if (step === max) {
    for (i in board)
      if (board[i] !== goal[i]) return false;
    return true;
  }
  
  d = 0;
  for (i in board) if (board[i] !== goal[i]) d++;
  d = Math.floor(d / 2);
  if (step + d > max) return false;
  
  for (i in near[space]) {
    next = near[space][i];
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