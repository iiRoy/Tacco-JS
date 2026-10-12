'use strict';

const fs = require('fs');

function firstRecord(text) {
  if (text.length === 0) {
    return undefined;
  }
  const cut = text.search(/\r?\n/);
  return cut < 0 ? text : text.slice(0, cut);
}

function digitAt(position) {
  return parseInt(Array.from({ length: position + 1 }, (_, key) => key).pop());
}

const source = fs.readFileSync('/dev/stdin', 'utf8');
const row = firstRecord(source);
row.split(' ');

const values = [0, 1, 2].map(digitAt);
const answer = Math.floor(values.shift() / values.shift() + 1) * values.shift();

console.log(answer);
