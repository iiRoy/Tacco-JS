function validateSequence(inputTxt) {
    const patternDef = [
        { char: 'A', opt: true },
        { char: 'K', opt: false },
        { char: 'I', opt: false },
        { char: 'H', opt: false },
        { char: 'A', opt: true },
        { char: 'B', opt: false },
        { char: 'A', opt: true },
        { char: 'R', opt: false },
        { char: 'A', opt: true }
    ];

    let txtPtr = 0;
    let patPtr = 0;

    while (txtPtr < inputTxt.length && patPtr < patternDef.length) {
        const currentPatternElement = patternDef[patPtr];
        const currentTextCharacter = inputTxt[txtPtr];

        if (currentTextCharacter === currentPatternElement.char) {
            txtPtr++;
            patPtr++;
        } else {
            if (currentPatternElement.opt) {
                patPtr++;
            } else {
                return false;
            }
        }
    }

    while (patPtr < patternDef.length) {
        if (!patternDef[patPtr].opt) {
            return false;
        }
        patPtr++;
    }

    return txtPtr === inputTxt.length;
}

function processInput(rawText) {
    const processedText = rawText.trim();
    console.log(validateSequence(processedText) ? "YES" : "NO");
}

processInput(require("fs").readFileSync("/dev/stdin","utf8"));
