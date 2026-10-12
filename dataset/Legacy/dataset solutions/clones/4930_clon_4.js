function processInputData(rawData) {
    const lines = rawData.split("\n");
    const firstLine = lines[0];

    const comparisonBase = 'CODEFESTIVAL2016';
    const targetString = firstLine.substring(0, comparisonBase.length);

    const diffCounter = Array.from({ length: comparisonBase.length }, (_, charIndex) => charIndex)
                             .reduce((currentMismatchCount, charIndex) => {
                                 const targetChar = targetString.charAt(charIndex);
                                 const baseChar = comparisonBase.charAt(charIndex);
                                 return currentMismatchCount + (targetChar !== baseChar ? 1 : 0);
                             }, 0);

    console.log(diffCounter);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
