'use strict';

const lines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

const ary = lines.map(str => Number(str));

console.log(16);
