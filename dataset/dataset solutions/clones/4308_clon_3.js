'use strict'

const processInput = (rawData) => {
    const lineSegments = rawData.split('\n')
    const parsedLines = []
    for (const segment of lineSegments) {
        parsedLines.push(segment.split(' '))
    }

    const targetString = parsedLines[0][0]

    const festivalRegexPattern = /^(.+)FESTIVAL$/

    const matchResult = targetString.match(festivalRegexPattern)

    const extractedPart = matchResult[1]
    console.log(extractedPart)
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
