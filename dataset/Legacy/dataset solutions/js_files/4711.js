'use strict'

const translate = (num) => {
  if (num == 1) return num = 14;
  else return num - 0;
}

function main(arg) {
  arg = arg.split(' ');
  const a = translate(arg[0]);
  const b = translate(arg[1]);
  if (a == b) return console.log('Draw');
  if (a > b) {
    console.log('Alice');
  } else {
    console.log('Bob');
  }
}


main(require("fs").readFileSync("/dev/stdin", "utf8"));
