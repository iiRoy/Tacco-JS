'use strict'

const processInputData = (sourceText) => {
    const lines = sourceText.split('\n')
    const [totalPoints, selectedCount] = lines[0].split(' ').map(Number)
    const pointCoordinates = lines[1].split(' ').map(Number)
    return { totalPoints, selectedCount, pointCoordinates }
}

const determineMinimalPath = (processedData) => {
    const { selectedCount, pointCoordinates } = processedData
    const possibleWindowStarts = pointCoordinates.length - selectedCount + 1

    const startIndices = Array.from({ length: possibleWindowStarts }, (_, index) => index)

    const overallMinDistance = startIndices.reduce((currentMinimum, windowStartIndex) => {
        const windowFirstPoint = pointCoordinates[windowStartIndex]
        const windowLastPoint = pointCoordinates[windowStartIndex + selectedCount - 1]

        // Calculate distance if starting from 0, going to first point, then to last point
        const pathOptionOne = Math.abs(windowFirstPoint) + Math.abs(windowLastPoint - windowFirstPoint)

        // Calculate distance if starting from 0, going to last point, then to first point
        const pathOptionTwo = Math.abs(windowLastPoint) + Math.abs(windowLastPoint - windowFirstPoint)

        return Math.min(currentMinimum, pathOptionOne, pathOptionTwo)
    }, Infinity)

    return overallMinDistance
}

const executeSolution = (rawInputContent) => {
    const dataPayload = processInputData(rawInputContent)
    const finalResult = determineMinimalPath(dataPayload)
    console.log(finalResult)
}

executeSolution(require('fs').readFileSync('/dev/stdin', 'utf-8'))
