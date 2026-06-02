var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var processedLines = (rawData.trim()).split("\n");

function parseLineOfNumbers(lineContent) {
    return lineContent.split(" ").map(Number);
}

function calculateQuaternionProduct(q1_x, q1_y, q1_z, q1_w, q2_x, q2_y, q2_z, q2_w) {
    let product_a = q1_x * q2_x;
    let product_i = q1_x * q2_y;
    let product_j = q1_x * q2_z;
    let product_k = q1_x * q2_w;

    product_i += q1_y * q2_x;
    product_a -= q1_y * q2_y;
    product_k += q1_y * q2_z;
    product_j -= q1_y * q2_w;
               
    product_j += q1_z * q2_x;
    product_k -= q1_z * q2_y;
    product_a -= q1_z * q2_z;
    product_i += q1_z * q2_w;
               
    product_k += q1_w * q2_x;
    product_j += q1_w * q2_y;
    product_i -= q1_w * q2_z;
    product_a -= q1_w * q2_w;

    return { a: product_a, i: product_i, j: product_j, k: product_k };
}

while (true) {
    let lineForN = processedLines.shift();
    let currentN = Number(lineForN);

    if (currentN === 0) {
        break;
    }

    for (let loopIndex = 0; loopIndex < currentN; loopIndex++) {
        let numberComponents = parseLineOfNumbers(processedLines.shift());
        
        let q1_x = numberComponents[0];
        let q1_y = numberComponents[1];
        let q1_z = numberComponents[2];
        let q1_w = numberComponents[3];
        
        let q2_x = numberComponents[4];
        let q2_y = numberComponents[5];
        let q2_z = numberComponents[6];
        let q2_w = numberComponents[7];
        
        let resultQuaternion = calculateQuaternionProduct(
            q1_x, q1_y, q1_z, q1_w,
            q2_x, q2_y, q2_z, q2_w
        );
        
        console.log(resultQuaternion.a + " " + resultQuaternion.i + " " + resultQuaternion.j + " " + resultQuaternion.k);
    }
}
