var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawData.trim().split("\n");

function parseNextInteger(linesSource) {
    return parseInt(linesSource.shift(), 10);
}

function outputRepeatedValue(count, valueToPrint) {
    for (let outputIndex = 0; outputIndex < count; outputIndex++) {
        console.log(valueToPrint);
    }
}

function calculateSpecificOutput(inputValue, chosenOption) {
    switch (chosenOption) {
        case 1:
            return (inputValue === 2) ? 2 : 1;
        case 2:
            return (inputValue === 1) ? 2 : 1;
        case 3:
            return (inputValue === 1) ? 1 : 2;
    }
}

while (true) {
    var firstInputVal = parseNextInteger(inputLines);

    if (firstInputVal === 0) {
        break;
    }

    var currentDataSet = [firstInputVal];
    for (let dataIndex = 0; dataIndex < 4; dataIndex++) {
        currentDataSet.push(parseNextInteger(inputLines));
    }

    const allPossibleOptions = [1, 2, 3];
    var availableOptions = allPossibleOptions.filter(function(optionCandidate) {
        const isCandidatePresent = currentDataSet.includes(optionCandidate);
        return !isCandidatePresent;
    });

    const numberOfAvailableOptions = availableOptions.length;

    if (numberOfAvailableOptions === 2 || numberOfAvailableOptions === 0) {
        outputRepeatedValue(5, 3);
    } else {
        const soleAvailableOption = availableOptions[0];

        currentDataSet.forEach(function(dataValue) {
            const finalResult = calculateSpecificOutput(dataValue, soleAvailableOption);
            console.log(finalResult);
        });
    }
}
