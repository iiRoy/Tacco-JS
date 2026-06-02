"use strict";

const fs = require("fs");

const source = fs.readFileSync("/dev/stdin", "utf8").trim();
const boundary = source.indexOf("\n");
const head = boundary === -1 ? source : source.slice(0, boundary);
const parsed = parseInt(head);

const factors = [parsed, parsed, parsed];
let result = 1;

while (factors.length > 0) {
  result *= factors.shift();
}

console.log(result);
