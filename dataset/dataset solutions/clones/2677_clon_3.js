function processInput(rawData) {
    const calculateOddDigitCount = (inputStringArray) => {
        const targetNumber = parseInt(inputStringArray[0], 10);
        let oddDigitCountResult = 0;

        // Helper function to determine the number of digits in a positive integer
        const getNumberOfDigits = (value) => {
            if (value === 0) return 1; // Assuming positive integers for this problem context
            return String(value).length;
        };

        const currentNumberDigits = getNumberOfDigits(targetNumber);

        // Pre-calculated cumulative counts for full blocks of odd-digit numbers
        const oneDigitNumbersTotal = 9; // Numbers 1-9
        const threeDigitNumbersTotal = 900; // Numbers 100-999
        const fiveDigitNumbersTotal = 90000; // Numbers 10000-99999

        const cumulativeCountUpToThreeDigits = oneDigitNumbersTotal + threeDigitNumbersTotal; // 1-9, 100-999
        const cumulativeCountUpToFiveDigits = cumulativeCountUpToThreeDigits + fiveDigitNumbersTotal; // 1-9, 100-999, 10000-99999

        // Determine the oddDigitCount based on the number of digits of targetNumber
        if (currentNumberDigits === 1) { // targetNumber is 1-9
            oddDigitCountResult = targetNumber;
        } else if (currentNumberDigits === 2) { // targetNumber is 10-99
            oddDigitCountResult = oneDigitNumbersTotal;
        } else if (currentNumberDigits === 3) { // targetNumber is 100-999
            oddDigitCountResult = oneDigitNumbersTotal + (targetNumber - 99);
        } else if (currentNumberDigits === 4) { // targetNumber is 1000-9999
            oddDigitCountResult = cumulativeCountUpToThreeDigits;
        } else if (currentNumberDigits === 5) { // targetNumber is 10000-99999
            oddDigitCountResult = cumulativeCountUpToThreeDigits + (targetNumber - 9999);
        } else { // targetNumber is 100000 or greater (6 digits or more)
            oddDigitCountResult = cumulativeCountUpToFiveDigits;
        }
        
        return oddDigitCountResult;
    };

    const splitInputData = rawData.split(" ");
    const finalCalculatedValue = calculateOddDigitCount(splitInputData);
    console.log(finalCalculatedValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
