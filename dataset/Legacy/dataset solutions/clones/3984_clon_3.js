function processInput(rawData) {
  const parsedData = rawData.split(" ");
  const calculatePalindromeCount = (inputValues) => {
    const RADIX_BASE = 10;
    const startNum = parseInt(inputValues[0], RADIX_BASE);
    const endNum = parseInt(inputValues[1], RADIX_BASE);

    let palindromeCounter = 0;

    const isPalindrome = (numericValue) => {
      const stringRepresentation = String(numericValue);
      let leftIndex = 0;
      let rightIndex = stringRepresentation.length - 1;

      while (leftIndex < rightIndex) {
        if (stringRepresentation[leftIndex] !== stringRepresentation[rightIndex]) {
          return false;
        }
        leftIndex++;
        rightIndex--;
      }
      return true;
    };

    for (let currentNum = startNum; currentNum <= endNum; currentNum++) {
      if (isPalindrome(currentNum)) {
        palindromeCounter++;
      }
    }

    console.log(palindromeCounter);
  };

  calculatePalindromeCount(parsedData);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
