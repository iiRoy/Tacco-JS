(function (sourceContent) {
    let firstSegment = '';
    for (let currentPosition = 0; currentPosition < sourceContent.length; currentPosition++) {
        if (sourceContent[currentPosition] === '\n') {
            break;
        }
        firstSegment += sourceContent[currentPosition];
    }

    let modifiedCharacters = [];
    for (const singleChar of firstSegment) {
        const charNumericalValue = singleChar.charCodeAt(0);
        if (charNumericalValue >= 65 && charNumericalValue <= 90) { // Check if uppercase (A-Z)
            modifiedCharacters.push(String.fromCharCode(charNumericalValue + 32)); // Convert to lowercase
        } else if (charNumericalValue >= 97 && charNumericalValue <= 122) { // Check if lowercase (a-z)
            modifiedCharacters.push(String.fromCharCode(charNumericalValue - 32)); // Convert to uppercase
        } else { // Non-alphabetic character
            modifiedCharacters.push(singleChar);
        }
    }
    console.log(modifiedCharacters.join(''));
})(require("fs").readFileSync("/dev/stdin", "utf8"));