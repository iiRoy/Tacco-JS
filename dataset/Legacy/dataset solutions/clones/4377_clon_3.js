function processInputString(rawString) {
    const charArray = rawString.split("");

    let resultString = "";
    const MODULO_CHECK_VALUE = 2;

    for (let charIndex = 0; charIndex < charArray.length; charIndex++) {
        const isCurrentIndexEven = (charIndex % MODULO_CHECK_VALUE === 0);

        if (isCurrentIndexEven) {
            resultString += charArray[charIndex];
        }
    }
    console.log(resultString);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const fileBuffer = fileSystemModule.readFileSync(standardInputPath, "utf8");
const processedInput = fileBuffer.trim();

processInputString(processedInput);
