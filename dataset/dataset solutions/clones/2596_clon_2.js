"use strict"
performCalculation(require("fs").readFileSync("/dev/stdin", "UTF-8"))

function performCalculation(receivedText) {
    const numericValues = receivedText
        .split("\n")[0]
        .split(" ")
        .map(val => Number(val))

    let iterationCounter = 1

    if (numericValues[0] >= numericValues[1]) {
        console.log(1)
    }
    else {
        while (numericValues[1] > numericValues[0]) {
            numericValues[0] += (numericValues[0] - 1)
            iterationCounter++
        }
    }
    console.log(iterationCounter)
}