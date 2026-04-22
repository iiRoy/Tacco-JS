'use strict'

function main(input) {
  input = input.split('')
  const length = input[0]
  let res = 0;
  let list = [0];
  for (let i = 0;i < length;i++) {
    if (input[i + 2] == 'I') {
      res++;
    } else {
      res--;
    }
    list.push(res);
  }
  console.log(Math.max(...list));
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));