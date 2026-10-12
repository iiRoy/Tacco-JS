"use strict";

const fs = require("fs");

function main(input) {
  const tmp = input.split("\n");
  const card = tmp.slice(0, 3).map(v => v.split(" "));
  const n = tmp[3];
  const bs = tmp.slice(4);
  const check = [];
  for (let i = 0; i < 3; i++)
    check[i] = new Array(3).fill(false);
  for (let b of bs)
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (card[i][j] === b)
          check[i][j] = true;
  if (check[0][0] && check[0][1] && check[0][2]
     || check[1][0] && check[1][1] && check[1][2]
     || check[2][0] && check[2][1] && check[2][2]
     || check[0][0] && check[1][0] && check[2][0]
     || check[0][1] && check[1][1] && check[2][1]
     || check[0][2] && check[1][2] && check[2][2]
     || check[0][0] && check[1][1] && check[2][2]
     || check[0][2] && check[1][1] && check[2][0])
    console.log("yes");
  else
    console.log("no");
}

main(fs.readFileSync("/dev/stdin", "utf8"));