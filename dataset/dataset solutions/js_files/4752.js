const input = require('fs').readFileSync('/dev/stdin', 'utf8')
const [n, ...seqSetStr] = input.split('\n')
const seqSet = seqSetStr.map(setStr => setStr.split(' '))
const aSeq = seqSet.map(set => +set[0])
const bSeq = seqSet.map(set => +set[1])
const sum = aSeq.reduceRight((sum, a, i) => {
  const b = bSeq[i]
  const currentA = a + sum
  const diff = currentA % b
  return diff > 0 ? currentA + (b - diff) - a : sum
}, 0)

console.log(sum)
