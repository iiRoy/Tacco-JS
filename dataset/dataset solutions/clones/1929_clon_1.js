	  const input = require("fs").readFileSync("/dev/stdin", "utf8")

    const lines = input.split('\n')
   const [N, M] = lines[0].split(' ').map(Number)

let e = N - N % 2
   for (let i = 0; i<  M;i++)  {
console.log(`${i + 1} ${e - i}`)
        }
