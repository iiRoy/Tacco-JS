'use strict'
function main(input) {
  input = input.split('\n')
  input.shift()
  let count = []
  input = input
    .map(c => {
      let arr = c.split(' ').map(w => w - 0)
      if (count[arr[0]] === undefined) count[arr[0]] = []
      count[arr[0]].push(arr[1])
      return arr
    })
  count.forEach(v => v.sort((a, b) => a - b))
  input = input.map(c => {
    let id = ('000000' + c[0].toString(10)).slice(-6)
    id += ('000000' + (count[c[0]].indexOf(c[1]) + 1).toString(10)).slice(-6)
    console.log(id)
  })
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
