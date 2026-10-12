var processData = function(rawData){
    const parseLineOfInts = (lineString) => {
        return lineString.split(' ').map(strVal => parseInt(strVal, 10));
    };

    const computeAbsSumOfFirstThree = (numericArray) => {
        const firstElement = numericArray[0];
        const secondElement = numericArray[1];
        const thirdElement = numericArray[2];
        const intermediateSum = firstElement + secondElement + thirdElement;
        return Math.abs(intermediateSum);
    };

    const processedLines = rawData.split('\n');

    const firstLineValues = parseLineOfInts(processedLines[0]);
    const numEntries = firstLineValues[0];
    const topCount = firstLineValues[1];

    const scoreList = [];

    for(let entryIndex = 1; entryIndex <= numEntries; entryIndex++){
        const currentLineNumbers = parseLineOfInts(processedLines[entryIndex]);
        const currentAbsoluteSum = computeAbsSumOfFirstThree(currentLineNumbers);
        scoreList.push(currentAbsoluteSum);
    }

    scoreList.sort(function(scoreA, scoreB){
        return scoreB - scoreA;
    });

    let finalResult = 0;
    for(let sumIndex = 0; sumIndex < topCount; sumIndex++){
        finalResult = finalResult + scoreList[sumIndex];
    }

    console.log(finalResult);

    return 0;
};

processData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
