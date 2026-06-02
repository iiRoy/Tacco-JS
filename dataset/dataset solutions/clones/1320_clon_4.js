const fileSystem = require("fs");

const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const parsedLines = rawInputContent.trim().split('\n');

const sourceString = parsedLines[0];
const patternToFind = parsedLines[1];

const extendedSource = sourceString + sourceString;

function performSubstringSearch(mainText, targetFragment) {
    const mainLength = mainText.length;
    const fragmentLength = targetFragment.length;

    if (fragmentLength === 0) {
        return true;
    }
    if (fragmentLength > mainLength) {
        return false;
    }

    let currentMainIndex = 0;
    while (currentMainIndex <= mainLength - fragmentLength) {
        let fragmentMatch = true;
        let currentFragmentIndex = 0;
        while (currentFragmentIndex < fragmentLength) {
            if (mainText[currentMainIndex + currentFragmentIndex] !== targetFragment[currentFragmentIndex]) {
                fragmentMatch = false;
                break;
            }
            currentFragmentIndex++;
        }
        if (fragmentMatch) {
            return true;
        }
        currentMainIndex++;
    }
    return false;
}

const isPatternPresent = performSubstringSearch(extendedSource, patternToFind);

console.log(isPatternPresent ? 'Yes' : 'No');
