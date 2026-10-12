function reverseString(inputStr) {
    const charArray = inputStr.split('');
    const reversedArray = charArray.reverse();
    const resultString = reversedArray.join('');
    return resultString;
}

function isPalindrome(candidateStr) {
    const reversedCandidate = reverseString(candidateStr);
    return candidateStr === reversedCandidate;
}

function processInputData(rawInputContent) {
    const processedString = rawInputContent.trim();
    const stringLength = processedString.length;

    const isFullStringPalindrome = isPalindrome(processedString);

    const halfLength = Math.floor(stringLength / 2);

    const firstHalfString = processedString.slice(0, halfLength);

    const isFirstHalfPalindrome = isPalindrome(firstHalfString);

    if (isFullStringPalindrome && isFirstHalfPalindrome) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processInputData(fileContent);
