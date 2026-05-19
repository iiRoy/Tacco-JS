let rawData = ''

process.stdin.resume()
process.stdin.setEncoding('utf8')
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk
})
process.stdin.on('end', function() {
  const processedLines = rawData.split('\n')
  processInputData(processedLines)
})

function processInputData(inputLines) {
    for(let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
        const currentLine = inputLines[lineIndex]
        const lineParts = currentLine.split(' ')

        const coefficients = lineParts.map(Number)

        const valA = coefficients[0]
        const valB = coefficients[1]
        const valC = coefficients[2]
        const valD = coefficients[3]
        const valE = coefficients[4]
        const valF = coefficients[5]
        
        const determinantTerm = (valD * valB) - (valA * valE)
        const xNumeratorTerm = (valB * valF) - (valE * valC)

        const solutionX = xNumeratorTerm / determinantTerm
        
        const yNumeratorTerm = valC - (valA * solutionX)
        const solutionY = yNumeratorTerm / valB

        console.log(solutionX.toFixed(3), solutionY.toFixed(3))
    }
}
