"use strict";

function main(input) {
  input = input.split(/\n|\s/);
  const n = ~~input[0];
  const m = ~~input[n + 1];
  const blue = input.slice(1, n + 1);
  const red = input.slice(n + 2);

  let obj = new Object();
  for (let i in blue) {
    obj[blue[i]] = obj[blue[i]] + 1 || 1;
  }

  for (let i in red) {
    obj[red[i]] = obj[red[i]] - 1 || -1;
  }

  let max = 0;
  for (let v in obj) {
    max = Math.max(max, obj[v]);
  }
  max = max >= 0 ? max : 0;

  console.log(max);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
