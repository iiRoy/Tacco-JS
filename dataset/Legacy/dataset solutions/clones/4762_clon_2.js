function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(outputValue) {
  console.log(outputValue);
} // Outputs the computed value to the console

// Input transformation utility
// 0: No change
// 1: Convert to integer
// 2: Split by space
// 3: Split by newline
// 4: Split by space, convert to number array
// 5: Split by newline, convert to number array
// 6: Split into characters
// 7: Split into characters, convert to number array
function transformInput(inputStr, conversionType) {
  switch (conversionType) {
    case 0:
      return inputStr;
    case 1:
      return parseInt(inputStr, 10);
    case 2:
      return inputStr.split(" ");
    case 3:
      return inputStr.split("\n");
    case 4:
      return inputStr.split(" ").map((element) => Number(element));
    case 5:
      return inputStr.split("\n").map((item) => Number(item));
    case 6:
      return inputStr.split("");
    case 7:
      return inputStr.split("").map((charVal) => Number(charVal));
    default:
      return inputStr;
  }
}

function processData(rawInput) {
  rawInput = transformInput(rawInput, 1);

  // The number of divisors is the product of (exponent + 1) for each prime factor.
  // This array will store the counts of each prime factor.
  let primeFactorCounts = new Array(rawInput + 1).fill(0);
  const modulus = 1000000007;

  // Iterate from 1 up to the input number to find prime factors
  for (let currentNum = 1; currentNum <= rawInput; currentNum++) {
    if (currentNum === 1) {
      primeFactorCounts[1] = 1;
      continue;
    } else {
      let tempValue = currentNum;
      // Find prime factors for the current number
      for (let divisor = 2; divisor <= tempValue;) {
        if (tempValue % divisor === 0) {
          primeFactorCounts[divisor]++;
          tempValue /= divisor;
        } else {
          divisor++;
        }
      }
    }
  }

  let finalResult = 1;
  // Calculate the total number of divisors using the prime factor counts
  for (let index = 2; index < primeFactorCounts.length; index++) {
    if (primeFactorCounts[index] !== 0) {
      finalResult = (finalResult * (primeFactorCounts[index] + 1)) % modulus;
    }
  }

  // displayResult(primeFactorCounts); // Debugging line, commented out
  displayResult(finalResult);
}

processData(getInputData());
