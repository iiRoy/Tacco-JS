function retrieveInput(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function displayOutput(content){console.log(content);}

function processConversion(dataItem, conversionType){
    switch(conversionType){
        case 0: return dataItem;
        case 1: return parseInt(dataItem);
        case 2: return dataItem.split(" ");
        case 3: return dataItem.split("\n");
        case 4: return dataItem.split(" ").map((val)=>Number(val));
        case 5: return dataItem.split("\n").map((val)=>Number(val));
        case 6: return dataItem.split("");
        case 7: return dataItem.split("").map((val)=>Number(val));
    }
}

function calculateSequenceScores(inputString) {
    const characterArray = processConversion(inputString, 6);
    const arrayLength = characterArray.length;
    const scorePositions = arrayLength + 1;

    const leftScores = new Array(scorePositions).fill(0);
    const rightScores = new Array(scorePositions).fill(0);

    // Propagate scores from left to right based on '<' relations
    for (let position = 0; position < arrayLength; position++) {
        if (characterArray[position] === '<') {
            leftScores[position + 1] = leftScores[position] + 1;
        }
    }

    // Propagate scores from right to left based on '>' relations
    for (let position = arrayLength - 1; position >= 0; position--) {
        if (characterArray[position] === '>') {
            rightScores[position] = rightScores[position + 1] + 1;
        }
    }

    let totalSum = 0;
    for (let position = 0; position < scorePositions; position++) {
        totalSum += Math.max(leftScores[position], rightScores[position]);
    }

    return totalSum;
}

displayOutput(calculateSequenceScores(retrieveInput()));
