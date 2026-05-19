function obtainCharCounts(textInput) {
    const baseCode = 'a'.charCodeAt(0);
    return Array.from(textInput).reduce((accumulator, char) => {
        const charOffset = char.charCodeAt(0) - baseCode;
        if (charOffset >= 0 && charOffset < 26) {
            accumulator[charOffset]++;
        }
        return accumulator;
    }, new Array(26).fill(0));
}

function intersectCounts(countsA, countsB) {
    return countsA.map((value, index) => Math.min(value, countsB[index]));
}

function processInputData(rawData) {
    const lines = rawData.split("\n");
    const numStrings = parseInt(lines[0], 10);
    const stringCollection = lines.slice(1, numStrings + 1);

    if (stringCollection.length === 0) {
        console.log("");
        return;
    }

    const finalCounts = stringCollection.slice(1).reduce((currentMinCounts, currentString) => {
        const currentStrCounts = obtainCharCounts(currentString);
        return intersectCounts(currentMinCounts, currentStrCounts);
    }, obtainCharCounts(stringCollection[0]));

    const resultString = Array.from({ length: 26 }, (_, charIndex) => {
        const charCode = charIndex + 'a'.charCodeAt(0);
        const character = String.fromCharCode(charCode);
        const count = finalCounts[charIndex];
        return character.repeat(count);
    }).join('');

    console.log(resultString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
