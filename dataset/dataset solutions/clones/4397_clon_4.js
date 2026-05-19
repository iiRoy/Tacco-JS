const prepareCharacterExclusions = (sourceString) => {
    const presentCodes = new Set();
    let minimumCode = Infinity;

    for (let i = 0; i < sourceString.length; i++) {
        const charVal = sourceString.charCodeAt(i);
        if (charVal >= 97 && charVal <= 122) {
            presentCodes.add(charVal);
            if (charVal < minimumCode) {
                minimumCode = charVal;
            }
        }
    }

    if (minimumCode !== Infinity) {
        presentCodes.delete(minimumCode);
    }

    return presentCodes;
};

function Main(sourceData) {
    const excludedCharCodes = prepareCharacterExclusions(sourceData);

    const firstAbsentCode = Array.from({ length: 26 }, (_, idx) => 97 + idx)
                               .find(code => !excludedCharCodes.has(code));

    console.log(firstAbsentCode === undefined ? 'None' : String.fromCharCode(firstAbsentCode));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
