'use strict';
const main = input => {
  let x = parseInt(input[0]);
  for(let i=x;i<(2*x); i++) {
    let check = 0;
    for(let j=2; j<i-1; j++) {
      if (i%j == 0) {
        check = 1;
        break;
      }
    }
    if (!check) {
      return console.log(i);
    }
  }

}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));