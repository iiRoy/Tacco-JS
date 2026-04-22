"use strict"

const processor =   (inputData) => {
    inputData = inputData  .trim() .split("\n")
    const firstCount = parseInt(inputData[0].split(" ")[0])
    const secondCount  = parseInt(inputData[0].split(" ")[1])

    const connections = inputData.slice(1, secondCount + 1)

    let pathTracker = [...Array(firstCount)].fill(0)
    let finalVerdict = "IMPOSSIBLE"

    for (let idx = 0; idx < secondCount; idx++) {
        let currentPair = connections[idx].split(" ").map(numStr => parseInt(numStr))
        let originNode = currentPair[0]
        let destNode = currentPair[1]

        if (originNode === 1) {
            if (pathTracker[destNode] === firstCount) {
                finalVerdict = "POSSIBLE"
                break
            } else {
                pathTracker[destNode]++
            }
        }

        if (destNode === firstCount) {
            if (pathTracker[originNode] === 1) {
                finalVerdict = "POSSIBLE"
                break
            } else {
                pathTracker[originNode]++
            }
        }
    }

    console.log(finalVerdict)
}
processor(require('fs').readFileSync('/dev/stdin', 'utf8'))