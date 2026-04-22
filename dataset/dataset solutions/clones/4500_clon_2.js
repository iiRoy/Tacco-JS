"use strict";

const   processInputData =   inputStringData =>
{
    inputStringData = inputStringData.trim().split("\n");
    const elementCount = parseInt(inputStringData[0], 10);
    const numericValuesArray = inputStringData[1].split(" ").map(stringValue => parseInt(stringValue, 10));

    let resultSequence = [];

    if (elementCount % 2 === 0)
    {
        for (let currentIndex = elementCount - 1; currentIndex > 0; currentIndex -= 2)
        {
            resultSequence.push(numericValuesArray[currentIndex]);
        }

        for (let currentIndex = 0; currentIndex < elementCount; currentIndex += 2)
        {
            resultSequence.push(numericValuesArray[currentIndex]);
        }
    }
    else
    {
        for (let currentIndex = elementCount - 1; currentIndex >= 0; currentIndex -= 2)
        {
            resultSequence.push(numericValuesArray[currentIndex]);
        }

        for (let currentIndex = 1; currentIndex < elementCount; currentIndex += 2)
        {
            resultSequence.push(numericValuesArray[currentIndex]);
        }
    }

    console.log(resultSequence.join(" "));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));