'use strict'

function Main(input) {
  const N = Number(input.split('\n')[0]);
  const line = input.split('\n')[1].split(' ').map(x => Number(x));

  const max = Math.max.apply(null, line);
  const min = Math.min.apply(null, line);

  console.log(max - min);

}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());