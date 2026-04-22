const calculateProductValue = (firstNumStr, secondNumStr) => {
  if (typeof firstNumStr !== 'string' || typeof secondNumStr !== 'string') {
    throw new Error('Input operands must be provided as strings.');
  }

  let primaryFactor;
  try {
    primaryFactor = BigInt(firstNumStr);
  } catch (e) {
    throw new Error(`Failed to convert first operand to BigInt: "${firstNumStr}"`);
  }

  const floatValForSecond = parseFloat(secondNumStr);
  if (isNaN(floatValForSecond)) {
    throw new Error(`Second operand is not a valid number: "${secondNumStr}"`);
  }

  const scaledFloatVal = floatValForSecond * 100;
  const integerScaledVal = Math.floor(scaledFloatVal);

  const secondaryFactorScaled = BigInt(integerScaledVal);

  const intermediateProduct = primaryFactor * secondaryFactorScaled;

  const finalResultBigInt = intermediateProduct / 100n;

  return finalResultBigInt.toString();
};

const executeMainLogic = (rawInputPayload) => {
  const processedInputString = String(rawInputPayload || '').trim();

  const inputParts = processedInputString.split(/\s+/);

  if (inputParts.length !== 2) {
    throw new Error(`Expected exactly two space-separated numbers, but received ${inputParts.length} parts.`);
  }

  const [operandAlpha, operandBeta] = inputParts;

  const computedOutcome = calculateProductValue(operandAlpha, operandBeta);

  console.log(computedOutcome);
};

const isTestEnvironmentActive = typeof process !== 'undefined' && process.env.RUN_TESTS_MODE === 'true';

const runValidationScenarios = () => {
  console.log("--- Initiating internal validation scenarios ---");

  const scenarios = [
    { inputA: "10", inputB: "5", expected: "50", description: "Basic positive integer multiplication" },
    { inputA: "100", inputB: "1.23", expected: "123", description: "Multiplication with decimal (positive)" },
    { inputA: "1000000000000000000", inputB: "100", expected: "100000000000000000000", description: "Large number multiplication" },
    { inputA: "0", inputB: "123.45", expected: "0", description: "Multiplication by zero" },
    { inputA: "5", inputB: "-2.5", expected: "-12", description: "Multiplication with negative decimal (truncation check)" },
    { inputA: "1", inputB: "0.01", expected: "0", description: "Small decimal multiplication" },
    { inputA: "1", inputB: "0.99", expected: "0", description: "Decimal less than one" },
    { inputA: "12345678901234567890", inputB: "1.00", expected: "12345678901234567890", description: "Large number with explicit .00" }
  ];

  let passedCount = 0;
  let failedCount = 0;

  scenarios.forEach((scenario, index) => {
    try {
      const result = calculateProductValue(scenario.inputA, scenario.inputB);
      if (result === scenario.expected) {
        console.log(`[PASS] Scenario ${index + 1}: ${scenario.description} (Input: ${scenario.inputA} ${scenario.inputB}, Result: ${result})`);
        passedCount++;
      } else {
        console.error(`[FAIL] Scenario ${index + 1}: ${scenario.description} (Input: ${scenario.inputA} ${scenario.inputB}) - Expected: ${scenario.expected}, Got: ${result}`);
        failedCount++;
      }
    } catch (error) {
      console.error(`[ERROR] Scenario ${index + 1}: ${scenario.description} (Input: ${scenario.inputA} ${scenario.inputB}) - Exception: ${error.message}`);
      failedCount++;
    }
  });

  console.log(`--- Validation scenarios completed. Passed: ${passedCount}, Failed: ${failedCount} ---`);
  if (failedCount > 0) {
    process.exit(1); // Indicate failure in test environment
  }
};

if (isTestEnvironmentActive) {
  runValidationScenarios();
} else {
  try {
    const fileSystemUtility = require('fs');
    const stdInputData = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
    executeMainLogic(stdInputData);
  } catch (error) {
    console.error(`Application encountered an error: ${error.message}`);
    process.exit(1);
  }
}