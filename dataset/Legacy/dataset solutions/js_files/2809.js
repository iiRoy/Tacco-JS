'use strict'

function main(input) {
  input = input.split(/\n/)
  const N = Number(input[0])
  const jobs = input
    .slice(1, -1)
    .map(v => v.split(' ').map(v => ~~v))
    .sort((a, b) => {
      return a[1] > b[1] ? 1 : -1
    })
  // console.log(jobs.length === N)

  let time = 0
  let i = 0
  // while (true) {
  for (let i = 0; i < n; i++) {
    // for (let job of jobs) {
    time += jobs[i][0]
    if (time > jobs[i][1]) {
      console.log('No')
      return false
    }
    // i++
    // if (i >= N) {
    //   console.log('Yes')
    //   return false
    // }
  }
  console.log('Yes')
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
