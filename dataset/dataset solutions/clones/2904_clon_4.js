'use strict';

const fs = require('fs');
const raw = fs.readFileSync('/dev/stdin', 'utf8');

const row = raw.trim().split('\n').shift();
const cells = row.split(' ').slice(0, 2).map(Number);
const heap = [cells[0], cells[0], cells[0], cells[1]];

const total = heap.reduce((carry, value) => carry + value, 0);
console.log(Math.floor(total / 2));
