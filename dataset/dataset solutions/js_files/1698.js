const maxIdx = (arr) => {
  let max = -1n
  let idx = -1

  for (let i=0; i<arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i]
      idx = i
    }
  }

  return idx
}

const main = (input) => {
  input = input.trim().split('\n')
  const nums = input[1].split(' ').map(v => BigInt(v))
  nums.sort((a, b) => b - a)

  let r = [nums.shift()]

  let ans = 0n
  while (nums.length) {
    const n = nums.shift()

    const i = maxIdx(r)
    ans += r[i]

    r = [...r.slice(0, i), n, n, ...r.slice(i+1)]
  }

  console.log(`${ans}`)
}

process.env.MYTEST ? test() : main(require('fs').readFileSync('/dev/stdin', 'utf8'))