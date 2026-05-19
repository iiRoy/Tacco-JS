const FIRST_OPERAND_VALUE = 0;
const SECOND_OPERAND_VALUE = 1;

function computeInitialValue(operandA, operandB) {
  return operandA | operandB;
}

let evaluatedInput = computeInitialValue(FIRST_OPERAND_VALUE, SECOND_OPERAND_VALUE);

let resultToLog;

if (evaluatedInput === 0) {
  resultToLog = 1;
} else if (evaluatedInput === 1) {
  resultToLog = 0;
}

console.log(resultToLog);
