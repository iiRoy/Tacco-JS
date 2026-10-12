'use strict'

function Main(input) {
  input = input.trim().split('\n')
  const array = input[0].split(' ').map(s => parseInt(s))
  const N = array[0]
  const M = array[1] // 提出回数

  const rest = input.slice(1)

  const list = rest.map(s => {
    return s.split(' ')
  })


  let success = 0
  let pena = 0
  let fail = 0
  let preID = 0
  let dp = {}
  list.forEach(data => {
    if(!dp[data[0]]) dp[data[0]] = 0

    // AC
    if(data[1] === 'AC' && preID !== data[0]) {
      success++

      pena += dp[data[0]]
      fail = 0
      preID = data[0]
    } else if(data[1] === 'WA') {

      dp[data[0]] += 1
    }
  })


  console.log(`${success} ${pena}`)

}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));