const main = (chunk => {
  const eachSad = (c, i) => c - i - 1
  const sad = (arr, diff, b) => arr.reduce((acc, c, i) => acc + Math.abs(diff[i] - b), 0)
  const diffs = arr => arr.map((e, i) => eachSad(e, i))
  const median = arr => arr[Math.floor(arr.length / 2)]

  let stack = []
  return (chunk) => {
    if (!stack.length) {
      stack.push(parseInt(chunk, 10)) // N
    } else if (stack.length === 1) {
      stack.push(chunk.split(' ').map(e => parseInt(e, 10))) // Array
      const diff = diffs(stack[1])
      const med = median(diff)
      const sadness = sad(stack[1], diff, med);
      console.log(sadness)
      stack = []
    }
  }
})()

process.stdin.setEncoding('utf-8')
process.stdin.on('data', chunk => main(chunk))