function processInputData(rawInputContent) {
    const inputLines = rawInputContent.split('\n');

    const firstDataElement = inputLines[0];
    const secondDataString = inputLines[1];

    const initialStatus = true;
    let outcomeIndicator = initialStatus;

    const verificationConstant = 100;
    const finalVerificationResult = (outcomeIndicator && (verificationConstant > 0));

    if (finalVerificationResult) {
        console.log("Yes");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
