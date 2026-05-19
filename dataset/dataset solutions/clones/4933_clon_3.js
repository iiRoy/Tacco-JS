process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
lineReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});
lineReader.on('close', () => {
    const APPLICANT_TYPE_A_CHAR = "a";
    const APPLICANT_TYPE_B_CHAR = "b";
    const PASS_STATUS_TEXT = "Yes";
    const FAIL_STATUS_TEXT = "No";

    const configParts = inputLines[0].split(" ");
    const competitionLimitA = parseInt(configParts[1], 10);
    const competitionLimitB = parseInt(configParts[2], 10);

    const applicantSequence = inputLines[1].split("");

    const applicantPassFlags = Array(applicantSequence.length).fill(false);

    let currentTotalPassed = 0;
    let currentBTypePassed = 0;

    const overallPassLimit = competitionLimitA + competitionLimitB;

    for (let applicantIndex = 0; applicantIndex < applicantSequence.length; applicantIndex++) {
        const currentApplicantChar = applicantSequence[applicantIndex];
        let isEligibleToPass = false;

        if (currentTotalPassed < overallPassLimit) {
            if (currentApplicantChar === APPLICANT_TYPE_A_CHAR) {
                isEligibleToPass = true;
            } else if (currentApplicantChar === APPLICANT_TYPE_B_CHAR) {
                if (currentBTypePassed < competitionLimitB) {
                    isEligibleToPass = true;
                }
            }
        }

        if (isEligibleToPass) {
            currentTotalPassed++;
            if (currentApplicantChar === APPLICANT_TYPE_B_CHAR) {
                currentBTypePassed++;
            }
            applicantPassFlags[applicantIndex] = true;
        }
    }

    const finalOutputResult = applicantPassFlags.map(statusFlag =>
        statusFlag ? PASS_STATUS_TEXT : FAIL_STATUS_TEXT
    ).join("\n");

    console.log(finalOutputResult);
});
