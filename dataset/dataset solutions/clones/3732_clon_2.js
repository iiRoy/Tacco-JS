const stringToInteger = (stringVal) => {
    return parseInt(stringVal, 10);
};

const convertStringArrayToNumbers = (inputStringArray) => {
    return inputStringArray.map(
        (eachString) => stringToInteger(eachString)
    );
};

function retrieveMinimumValue() {
    let allArguments = arguments;
    let minimumFound = allArguments[0];

    for (
        let argumentIndex = 1;
        argumentIndex < allArguments.length;
        argumentIndex++
    ) {
        if (
            allArguments[argumentIndex] < minimumFound
        ) {
            minimumFound = allArguments[argumentIndex];
        }
    }

    return minimumFound;
}

function retrieveMaximumValue() {
    let allArguments = arguments;
    let maximumFound = allArguments[0];

    for (
        let argumentIndex = 1;
        argumentIndex < allArguments.length;
        argumentIndex++
    ) {
        if (
            allArguments[argumentIndex] > maximumFound
        ) {
            maximumFound = allArguments[argumentIndex];
        }
    }

    return maximumFound;
}

executePrimaryLogic(
    require("fs").readFileSync("/dev/stdin", "utf8")
);

function executePrimaryLogic(rawInputData) {
    let iterationLimit = stringToInteger(rawInputData.split('\n')[0]);

    let currentLeadingDigit = 1;
    let numberOfNinesToAppend = 0;
    let finalOutputString;

    for (
        let primaryLoopCounter = 1;
        primaryLoopCounter <= iterationLimit;
        primaryLoopCounter++
    ) {
        finalOutputString = currentLeadingDigit.toString();

        for (
            let suffixLoopCounter = 0;
            suffixLoopCounter < numberOfNinesToAppend;
            suffixLoopCounter++
        ) {
            finalOutputString += '9';
        }

        console.log(finalOutputString);

        currentLeadingDigit++;
        if (currentLeadingDigit === 10) {
            currentLeadingDigit = 1;
            numberOfNinesToAppend++;
        }
    }
}