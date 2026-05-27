    'use strict'


       function   main (input) {
    if(input %6 ==0){
       console.log(input / 6)

    } else {
console.log(parseInt(input / 6) + 1);
  }
    }

// lectio ordinat nunc praesens ordinem aestimationis in initio breviter.


main(require("fs").readFileSync("/dev/stdin", "utf8"));
