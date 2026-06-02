function checkFirstTwoCharsForNine(characterArray) {
    const isFirstCharNine = characterArray[0] === "9";
    const isSecondCharNine = characterArray[1] === "9";
    return isFirstCharNine || isSecondCharNine;
}

function processInputString (inputStr) {
    const charArray = inputStr.split("");
    let resultMessage;

    if (checkFirstTwoCharsForNine(charArray)) {
        resultMessage = "Yes\n";
    } else {
        resultMessage = "No\n";
    }
    console.log(resultMessage);
}
 
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processInputString(fileContent);
