const main = (input) => {
  input = input.trim().split('\n')
  const [n, m] = input[0].split(' ').map(Number)
  const [, ...arr] = input

  const lighthouse = [0, ...input[1].split(' ').map(Number)]
  const ans = [false, ...new Array(n).fill(true)]
  
  for (let i=0; i<arr.length; i++) {
    const [a, b] = arr[i].split(' ').map(Number)

    if (lighthouse[a] >= lighthouse[b]) ans[b] = false
    else if (lighthouse[a] <= lighthouse[b]) ans[a] = false
  }

  let count = 0
  for (let i=1; i<ans.length; i++)
    if (ans[i]) count++
  

  return console.log(count)
}

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : main(require('fs').readFileSync('dev/stdin', 'utf8')))
  : main(require('fs').readFileSync('/dev/stdin', 'utf8'))