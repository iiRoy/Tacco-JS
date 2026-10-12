let rawData = ''

process.stdin.resume()
process.stdin.setEncoding('utf8')
process.stdin.on('data', function(chunk) {
  rawData += chunk
})
process.stdin.on('end', function() {
  const processedLines = rawData.trim().split('\n')
  processInputData(processedLines)
})

function isWithinValidRange(value) {
  const numericValue = Number(value)
  return numericValue >= 0 && numericValue <= 1000
}

function processInputData(lines) {
  const dataCountStr = lines[0]
  const dataCountNum = parseInt(dataCountStr, 10)

  if (dataCountNum > 1000) {
    return
  }

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const currentLineParts = lines[lineIndex].split(' ')
    currentLineParts.sort(descendingSort)
    
    const numbers = currentLineParts.map(part => Number(part))

    if (!isWithinValidRange(numbers[0]) || !isWithinValidRange(numbers[1]) || !isWithinValidRange(numbers[2])) {
      return
    }
    
    const firstSquared = numbers[0] * numbers[0]
    const secondSquared = numbers[1] * numbers[1]
    const thirdSquared = numbers[2] * numbers[2]

    if (firstSquared === secondSquared + thirdSquared) {
      console.log('YES')
    } else {
      console.log('NO')
    }
  }
}

function descendingSort(valA, valB) {
  return valB - valA
}
