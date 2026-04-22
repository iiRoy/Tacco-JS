function CalculationModule(rawTextContent) {
  const valueParts = rawTextContent.split(" ");
  const primaryVal = BigInt(valueParts[0]);
  const secondaryVal = BigInt(valueParts[1]);

  const pMinusTwo = primaryVal - 2n;
  const sMinusTwo = secondaryVal - 2n;

  const isPrimaryOne = BigInt(primaryVal === 1n);
  const isSecondaryOne = BigInt(secondaryVal === 1n);

  const notPrimaryOne = BigInt(primaryVal !== 1n);
  const notSecondaryOne = BigInt(secondaryVal !== 1n);

  const finalOutcome =
    (isPrimaryOne * isSecondaryOne * 0n) +
    (isPrimaryOne * notSecondaryOne * sMinusTwo) +
    (notPrimaryOne * isSecondaryOne * pMinusTwo) +
    (notPrimaryOne * notSecondaryOne * pMinusTwo * sMinusTwo);

  console.log(finalOutcome.toString());
}

const fileSystemAccess = require("fs");
const standardInputPath = "/dev/stdin";
const textEncodingFormat = "utf8";
const processedInput = fileSystemAccess.readFileSync(standardInputPath, textEncodingFormat).trim();

CalculationModule(processedInput);