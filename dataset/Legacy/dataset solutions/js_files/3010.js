'use strict'

function Main(input) {
    input = input.split("\n")
    let N = parseInt(input[0])
    let numbers = input[1].split(' ').map(str => parseInt(str, 10))

    const gcd = (x, y) => {
      while(y) {
        var t = y;
        y = x % y;
        x = t;
      }
      return x;      
    }

    let max = 1
    for(let i = 0; i < N; i++) {
      let g = numbers[i+1] || numbers[i-1]

      for(let j = 0; j < N; j++) {
        if(j === i) {
          continue;
        }
        g = gcd(g, numbers[j])
    
        if(g <= max) {
          break;
        }    
      }
       max = Math.max(max, g)
    }
   
    console.log(max)
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"))