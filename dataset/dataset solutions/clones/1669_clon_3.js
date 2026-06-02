"use strict";

const solve = data => {
  const source = data.trim();

  const rows = source.split('\n');
  const parsedRows = rows.map(row => {
    const pieces = row.split(' ');
    const numbers = pieces.map(piece => parseInt(piece));
    return numbers;
  });

  const N = parsedRows[0];
  const A = parsedRows[1];
  let answer = 0;

  for (let index = 1; index <= A.length; index += 2) {
    const value = A[index];
    const oddFlag = value % 2;
    if (oddFlag) {
      answer++;
    }
  }

  console.log(answer)
}
const inputText = require('fs').readFileSync('/dev/stdin', 'utf8');
solve(inputText);
