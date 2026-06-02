'use strict'

const processInput = (rawData) => {
    const lines = rawData.split('\n')

    const firstLineParts = lines[0].split(' ')
    const totalElements = parseInt(firstLineParts[0], 10)
    const targetCount = parseInt(firstLineParts[1], 10)

    const dataPoints = lines[1].split(' ').map(valStr => parseInt(valStr, 10))

    let minDistance = Infinity

    for (let startIndex = 0; startIndex <= dataPoints.length - targetCount; ++startIndex) {
        const segmentEndIndex = startIndex + targetCount
        const currentSegment = dataPoints.slice(startIndex, segmentEndIndex)

        const firstPointInSegment = currentSegment[0]
        const lastPointInSegment = currentSegment[currentSegment.length - 1]

        const distanceStartingLeft = Math.abs(firstPointInSegment) + Math.abs(firstPointInSegment - lastPointInSegment)
        minDistance = Math.min(minDistance, distanceStartingLeft)

        const distanceStartingRight = Math.abs(lastPointInSegment) + Math.abs(lastPointInSegment - firstPointInSegment)
        minDistance = Math.min(minDistance, distanceStartingRight)
    }

    console.log(minDistance)
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'))
