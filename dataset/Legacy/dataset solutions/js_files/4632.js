const input = require("fs").readFileSync("/dev/stdin", "utf8")

;(input => {
 
    const lines = input.split('\n')
    const N = lines[0] - 0
    const A = lines[1].split(' ').map(Number)
    
    let count = 0
    let dir = 0
    for (let i = 1; i < N; i++) {
	    if (A[i] - A[i - 1] > 0) {
          if (dir === -1) {
            dir = 0
            count++
          } else {
            dir = 1
          }
        } else if (A[i] - A[i - 1] < 0) {
          if (dir === 1) {
            dir = 0
            count++
          } else {
            dir = -1
          }
        }
    }
  
  console.log(count + 1)

})(input)
