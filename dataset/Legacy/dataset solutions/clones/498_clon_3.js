function computeQuaternionProduct(q1x, q1y, q1z, q1w, q2x, q2y, q2z, q2w) {
    let resultReal = 0.0;
    let resultImagI = 0.0;
    let resultImagJ = 0.0;
    let resultImagK = 0.0;

    // Calculate terms based on the first quaternion's real component (q1x)
    const q1x_q2x_prod = q1x * q2x;
    const q1x_q2y_prod = q1x * q2y;
    const q1x_q2z_prod = q1x * q2z;
    const q1x_q2w_prod = q1x * q2w;

    resultReal += q1x_q2x_prod;
    resultImagI += q1x_q2y_prod;
    resultImagJ += q1x_q2z_prod;
    resultImagK += q1x_q2w_prod;

    // Calculate terms based on the first quaternion's i-component (q1y)
    const q1y_q2x_prod = q1y * q2x;
    const q1y_q2y_prod = q1y * q2y;
    const q1y_q2z_prod = q1y * q2z;
    const q1y_q2w_prod = q1y * q2w;

    resultImagI += q1y_q2x_prod;
    resultReal -= q1y_q2y_prod;
    resultImagK += q1y_q2z_prod;
    resultImagJ -= q1y_q2w_prod;
             
    // Calculate terms based on the first quaternion's j-component (q1z)
    const q1z_q2x_prod = q1z * q2x;
    const q1z_q2y_prod = q1z * q2y;
    const q1z_q2z_prod = q1z * q2z;
    const q1z_q2w_prod = q1z * q2w;

    resultImagJ += q1z_q2x_prod;
    resultImagK -= q1z_q2y_prod;
    resultReal -= q1z_q2z_prod;
    resultImagI += q1z_q2w_prod;
             
    // Calculate terms based on the first quaternion's k-component (q1w)
    const q1w_q2x_prod = q1w * q2x;
    const q1w_q2y_prod = q1w * q2y;
    const q1w_q2z_prod = q1w * q2z;
    const q1w_q2w_prod = q1w * q2w;

    resultImagK += q1w_q2x_prod;
    resultImagJ += q1w_q2y_prod;
    resultImagI -= q1w_q2z_prod;
    resultReal -= q1w_q2w_prod;

    return [resultReal, resultImagI, resultImagJ, resultImagK];
}

function processSingleTestCase(caseString) {
    const numericInputs = caseString.split(" ").map(Number);
    const computedResult = computeQuaternionProduct(...numericInputs);
    return computedResult.join(" ");
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const trimmedInput = rawInputData.trim();
const inputLines = trimmedInput.split("\n");

const numberOfTestCases = Number(inputLines.shift());

for (let caseIndex = 0; caseIndex < numberOfTestCases; caseIndex++) {
    const currentCaseLine = inputLines[caseIndex];
    const outputString = processSingleTestCase(currentCaseLine);
    console.log(outputString);
}
