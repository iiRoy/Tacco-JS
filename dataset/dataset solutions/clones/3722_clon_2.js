"use strict"

function processInput(rawData) {

    let initialValue = Number(rawData.split('\n')[0])
    let workingValue = initialValue
    let digitSum = 0
    for (let idx = 1; idx <= rawData.length; idx++) {
        digitSum += workingValue % 10
        workingValue = Math.floor(workingValue / 10)
            // Another way to remove the last digit:
            // workingValue = (workingValue - (workingValue % 10)) / 10
    }
    if (initialValue % digitSum == 0) console.log('Yes')
    else console.log('No')
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
