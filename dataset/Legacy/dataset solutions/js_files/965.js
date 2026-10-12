//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

const assert = require('assert');

const SIZE = 16;

goal = '123456789ABCDEF0';

init = require('fs').readFileSync(config.input, 'ascii')
  .trim()
  .split(config.newline)
  .map(function (line) {
    return line.split(' ').map(function (num) {
      return Number(num).toString(16); }).join(''); })
  .join('')
  .toUpperCase();

north = [null,null,null,null,0,1,2,3,4,5,6,7,8,9,10,11];
south = [4,5,6,7,8,9,10,11,12,13,14,15,null,null,null,null];
west = [null,0,1,2,null,4,5,6,null,8,9,10,null,12,13,14];
east = [1,2,3,null,5,6,7,null,9,10,11,null,13,14,15,null];

function iddfs(step, board) {
  var idx0, i, next;
  if (step === 0) {
    return board === goal;
  }
  idx0 = board.indexOf('0');

  i = north[idx0];
  if (i !== null) {
    next = board.replace(board[i], 'x')
                .replace('0', 'y')
                .replace('x', '0')
                .replace('y', board[i]);
    if (iddfs(step - 1, next)) return true;
  }

  i = south[idx0];
  if (i !== null) {
    next = board.replace(board[i], 'x')
                .replace('0', 'y')
                .replace('x', '0')
                .replace('y', board[i]);
    if (iddfs(step - 1, next)) return true;
  }

  i = west[idx0];
  if (i !== null) {
    next = board.replace(board[i], 'x')
                .replace('0', 'y')
                .replace('x', '0')
                .replace('y', board[i]);
    if (iddfs(step - 1, next)) return true;
  }

  i = east[idx0];
  if (i !== null) {
    next = board.replace(board[i], 'x')
                .replace('0', 'y')
                .replace('x', '0')
                .replace('y', board[i]);
    if (iddfs(step - 1, next)) return true;
  }

  return false;
}

for (i = 0; i <= 45; i++) {
  if (iddfs(i, init)) break;
}
console.log(i);