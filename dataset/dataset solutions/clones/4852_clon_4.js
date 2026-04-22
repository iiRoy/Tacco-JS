const performArithmeticOperation = (inputStringContent) => {
    let firstValueAsString = '';
    let secondValueAsString = '';
    let spaceEncountered = false;

    for (let characterIndex = 0; characterIndex < inputStringContent.length; characterIndex++) {
        const currentCharacter = inputStringContent[characterIndex];
        if (currentCharacter === ' ') {
            spaceEncountered = true;
            continue;
        }
        if (!spaceEncountered) {
            firstValueAsString += currentCharacter;
        } else {
            secondValueAsString += currentCharacter;
        }
    }

    const numericalOne = parseInt(firstValueAsString, 10);
    const numericalTwo = parseInt(secondValueAsString, 10);

    const productOfValues = numericalOne * numericalTwo;
    const sumOfValues = numericalOne + numericalTwo;

    const calculatedResult = productOfValues / sumOfValues;

    console.log(calculatedResult);
};

(function(fileSystemDependency, runtimeProcess) {
    const dataFromStandardIn = fileSystemDependency.readFileSync("/dev/stdin", "utf8");
    performArithmeticOperation(dataFromStandardIn);
})(require("fs"), process);