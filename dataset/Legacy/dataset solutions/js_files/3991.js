"use strict"
const fs = require('fs');
const input = fs.readFileSync("/dev/stdin", "utf8");
const range = input.toString().split(" ");
const x = parseInt(range[0]);
const mx = x > 1 ? x : 0;
const y = parseInt(range[1]);
const my = y > 1 ? y : 0;
console.log(mx*my);