const fileContent = require('fs').readFileSync('/dev/stdin', 'utf-8')
const inputLines = fileContent.split('\n')

function evaluateNumbers(numA, numB) {
  if (numA >= numB) {
    return false
  }

  const twiceNumA = numA * 2
  const differenceVal = numB - twiceNumA
  const potentialRemainder = differenceVal / 2

  return potentialRemainder <= numA
}

const firstLineParts = inputLines[0].split(' ')
const firstNum = Number(firstLineParts[0])
const secondNum = Number(firstLineParts[1])

let finalVerdict = 'No'

if (evaluateNumbers(firstNum, secondNum)) {
  finalVerdict = 'Yes'
}

console.log(finalVerdict)
