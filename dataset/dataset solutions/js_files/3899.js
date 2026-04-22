
'use strict'
let maxnum = 109

function countingSort(arr) {
  const sorted = []
  let tmp = Array.apply(null, { length: maxnum + 1 }).map(v => 0)
  // console.log(tmparr.length)
  for (let i in arr) {
    tmp[arr[i]]++
  }
  for (let i in tmp) {
    while (tmp[i]) {
      sorted.push(~~i)
      tmp[i]--
    }
  }
  // console.log(sorted)

  return sorted
}

function main(input) {
  input = input.split(/\n|\s/).map(v => ~~v)
  const n = input[0]
  const arr = input.slice(1, -1)
  const sorted = countingSort(arr)

  const mid = sorted[n / 2]
  // console.log(arr, sorted, mid)
  // console.log('-------')

  // console.log(mid)

  // let ans = []
  for (let i = 0; i < n; i++) {
    if (arr[i] < mid) {
      console.log(mid)
    } else {
      console.log(sorted[n / 2 - 1])
    }
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
