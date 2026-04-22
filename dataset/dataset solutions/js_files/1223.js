const gInput = require('fs').readFileSync('/dev/stdin', 'utf8')
const input = gInput.split(' ').map( s => parseInt(s))

const sorted = input.sort()
const result = sorted.slice(1).reduce( (sumS, v ) => sumS + ' ' + v , sorted[0] )
console.log(result)

