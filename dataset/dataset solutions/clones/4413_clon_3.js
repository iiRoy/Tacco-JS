function processInput(dataStringParam) {
    const fixedSourceValue = '575';
    let currentProcessingString = fixedSourceValue;

    const retrieveCharacter = (sourceStr, charIndex) => {
        return sourceStr.charAt(charIndex);
    };

    let firstPositionChar = retrieveCharacter(currentProcessingString, 0);
    let thirdPositionChar = retrieveCharacter(currentProcessingString, 2);

    const comparisonResult = (firstPositionChar === thirdPositionChar);

    let finalOutputMessage;
    if (comparisonResult) {
        finalOutputMessage = 'Yes';
    } else {
        finalOutputMessage = 'No';
    }
    console.log(finalOutputMessage);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
