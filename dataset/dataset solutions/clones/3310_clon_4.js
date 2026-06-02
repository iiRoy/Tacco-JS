'use strict';

const fs = require('fs');

function buildLengthTable(leftText, rightText) {
  const rows = leftText.length + 1;
  const cols = rightText.length + 1;
  const table = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let row = 1; row < rows; row++) {
    for (let col = 1; col < cols; col++) {
      if (leftText[row - 1] === rightText[col - 1]) {
        table[row][col] = table[row - 1][col - 1] + 1;
      } else {
        const fromLeft = table[row][col - 1];
        const fromTop = table[row - 1][col];
        table[row][col] = fromLeft > fromTop ? fromLeft : fromTop;
      }
    }
  }

  return table;
}

function recoverSameSubsequence(leftText, rightText, table) {
  const answer = [];
  let row = leftText.length;
  let col = rightText.length;

  while (row > 0 && col > 0) {
    if (leftText[row - 1] === rightText[col - 1]) {
      answer.push(leftText[row - 1]);
      row--;
      col--;
    } else {
      const fromLeft = table[row][col - 1];
      const fromTop = table[row - 1][col];

      if (fromLeft > fromTop) {
        col--;
      } else {
        row--;
      }
    }
  }

  return answer.reverse().join('');
}

function solve(input) {
  const lines = input.split('\n');
  const first = lines[0];
  const second = lines[1];

  const lengths = buildLengthTable(first, second);
  console.log(recoverSameSubsequence(first, second, lengths));
}

solve(fs.readFileSync('/dev/stdin', 'utf8'));