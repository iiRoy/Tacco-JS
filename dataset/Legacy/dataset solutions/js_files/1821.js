const inputs = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(/\s+/)

const N = parseInt(inputs[0])
const A = new Array(N)
const B = new Array(N)

for (let i = 0, p = 1; i < N; i += 1) {
  A[i] = parseInt(inputs[p++])
  B[i] = parseInt(inputs[p++])
}

const cmp = (a, b) => a - b
A.sort(cmp)
B.sort(cmp)

if (N % 2 == 0) { // even
  const i1 = N / 2 - 1
  const i2 = N / 2
  const maxMed = B[i1] + B[i2]
  const minMed = A[i1] + A[i2]
  console.log(maxMed - minMed + 1)
} else { // odd
  const i = (N - 1) / 2
  const maxMed = B[i]
  const minMed = A[i]
  console.log(maxMed - minMed + 1)
}
