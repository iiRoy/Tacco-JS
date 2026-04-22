function evaluateSequence(payload) {
    const lineBreakIndex = payload.indexOf('\n');
    let firstPayloadLine;

    if (lineBreakIndex === -1) {
        firstPayloadLine = payload;
    } else {
        firstPayloadLine = payload.substring(0, lineBreakIndex);
    }

    const targetPattern = ['Y', 'A', 'K', 'I'];
    let isMatch = true;

    if (firstPayloadLine.length < targetPattern.length) {
        isMatch = false;
    } else {
        for (let i = 0; i < targetPattern.length; i++) {
            if (firstPayloadLine.charAt(i) !== targetPattern[i]) {
                isMatch = false;
                break;
            }
        }
    }

    const decisionLookup = {
        true: "Yes",
        false: "No"
    };

    console.log(decisionLookup[isMatch]);
}

evaluateSequence(require("fs").readFileSync("/dev/stdin", "utf8"));