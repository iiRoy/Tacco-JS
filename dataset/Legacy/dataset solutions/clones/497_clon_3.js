const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContent.trim().split("\n");

const totalCases = Number(inputLines.shift());

function calculateQuaternionProduct(q1_s_comp, q1_i_comp, q1_j_comp, q1_k_comp, q2_s_comp, q2_i_comp, q2_j_comp, q2_k_comp) {
    let product_s_result = q1_s_comp * q2_s_comp;
    let product_i_result = q1_s_comp * q2_i_comp;
    let product_j_result = q1_s_comp * q2_j_comp;
    let product_k_result = q1_s_comp * q2_k_comp;

    product_i_result += q1_i_comp * q2_s_comp;
    product_s_result -= q1_i_comp * q2_i_comp;
    product_k_result += q1_i_comp * q2_j_comp;
    product_j_result -= q1_i_comp * q2_k_comp;
              
    product_j_result += q1_j_comp * q2_s_comp;
    product_k_result -= q1_j_comp * q2_i_comp;
    product_s_result -= q1_j_comp * q2_j_comp;
    product_i_result += q1_j_comp * q2_k_comp;
              
    product_k_result += q1_k_comp * q2_s_comp;
    product_j_result += q1_k_comp * q2_i_comp;
    product_i_result -= q1_k_comp * q2_j_comp;
    product_s_result -= q1_k_comp * q2_k_comp;
    
    return { scalar: product_s_result, i_component: product_i_result, j_component: product_j_result, k_component: product_k_result };
}

const TERMINATION_CONDITION_VALUE = 0;

for (let caseIndex = 0; caseIndex < totalCases; caseIndex++) {
    const currentInputLine = inputLines[caseIndex];
    if (Number(currentInputLine) === TERMINATION_CONDITION_VALUE) {
        break;
    }

    const numericValues = currentInputLine.split(" ").map(Number);

    const [
        first_q_s, first_q_i, first_q_j, first_q_k,
        second_q_s, second_q_i, second_q_j, second_q_k
    ] = numericValues;

    const quaternionProduct = calculateQuaternionProduct(
        first_q_s, first_q_i, first_q_j, first_q_k,
        second_q_s, second_q_i, second_q_j, second_q_k
    );

    console.log(`${quaternionProduct.scalar} ${quaternionProduct.i_component} ${quaternionProduct.j_component} ${quaternionProduct.k_component}`);
}
