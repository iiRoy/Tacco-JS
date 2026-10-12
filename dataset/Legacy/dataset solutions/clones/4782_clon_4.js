'use strict'

function main(inputData) {
  const [startX, startY, targetX, targetY] = inputData
    .trim()
    .split(' ')
    .reduce((accumulator, currentVal) => {
      accumulator.push(parseInt(currentVal, 10))
      return accumulator
    }, [])

  const deltaX = targetX - startX
  const deltaY = targetY - startY

  const generateSequence = (charSymbol, countValue) =>
    Array(countValue).fill(charSymbol).join('')

  const pathSegments = []

  pathSegments.push(generateSequence('U', deltaY + 1))
  pathSegments.push(generateSequence('R', deltaX + 1))
  pathSegments.push(generateSequence('D', deltaY + 1))
  pathSegments.push(generateSequence('L', deltaX + 1))
  pathSegments.push('L')
  pathSegments.push(generateSequence('U', deltaY + 2))
  pathSegments.push(generateSequence('R', deltaX + 2))
  pathSegments.push('DR')
  pathSegments.push(generateSequence('D', deltaY + 2))
  pathSegments.push(generateSequence('L', deltaX + 2))
  pathSegments.push('U')

  const finalRoute = pathSegments.join('')

  console.log(finalRoute)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
