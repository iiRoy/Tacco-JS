'use strict'

function main(input) {
  input = input.split("\n").slice(1);
  const data = input.map(v => v.split(" ").slice(1).map(v => parseInt(v, 10)));
  let ret = data[0];
  for (let i = 1; i < data.length; i++)
    ret = ret.filter(v => data[i].indexOf(v) != -1);
  return ret.length;
}

const fs = require("fs");
const msg = main(fs.readFileSync("/dev/stdin", "utf8"));
console.log(msg);
