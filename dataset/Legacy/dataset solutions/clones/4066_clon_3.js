// rawDataに入力データ全体が入る
function processInput(rawData) {
  // Split the raw input string by space and parse all parts into numbers.
  // This uses a common array method (map) and the Number constructor for parsing,
  // which is a structural modification compared to individual parseInt calls.
  const numericValues = rawData.split(' ').map(str => Number(str));

  // Extract the two numbers from the parsed array for clarity.
  const firstOperand = numericValues[0];
  const secondOperand = numericValues[1];

  // Calculate the product of the two numbers.
  // This introduces a helper variable for an intermediate computation step.
  const calculatedProduct = firstOperand * secondOperand;

  // Determine the remainder when the product is divided by 2.
  // This uses a temporary constant for the modulo operation result.
  const remainderAfterDivision = calculatedProduct % 2;

  // Use a conditional (ternary) expression to assign the final result string.
  // This is an equivalent rewrite of the original if/else block.
  const parityOutcome = (remainderAfterDivision === 1) ? 'Odd' : 'Even';

  // Output the determined parity. The output format is strictly preserved.
  console.log('%s', parityOutcome);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、processInputを呼び出します）
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
