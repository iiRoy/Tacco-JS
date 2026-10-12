'use strict'

process.stdin.resume();
process.stdin.setEncoding('utf8');

let line = ''
process.stdin.on('data', function(chunk) {
  line = line + chunk
});

process.stdin.on('end', function() {
  const values = line.split(/\s+/)
  console.log(b(values.slice(1, values.length-1).map(x => parseInt(x))))
  process.exit(0)
});

function b(arr) {
  // console.log(arr)
  let total = 0
  while (arr.length !== 0) {
    let next = []
    total += arr[0]
    arr.reduce((pre, num) => {
            next.push(Math.min(pre, num))
            total += num
            return num
    })
    arr = next
  }
  return total
}
