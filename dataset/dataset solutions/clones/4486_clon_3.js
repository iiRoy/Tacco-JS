function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    const firstLineParts = inputLines[0].split(" ");
    const totalCount = parseInt(firstLineParts[0], 10);
    const remainderCondition = parseInt(firstLineParts[1], 10);

    const numberStrings = inputLines[1].split(" ");
    const parsedNumbers = numberStrings.map(str => parseInt(str, 10));

    let evenCount = 0;
    let oddCount = 0;

    for (let currentNum of parsedNumbers) {
        const isEven = (currentNum % 2 === 0);
        if (isEven) {
            evenCount++;
        } else {
            oddCount++;
        }
    }
    
    const calculateFactorial = (nVal) => {
        let resultFactorial = 1;
        if (nVal < 0) return 0;
        if (nVal === 0 || nVal === 1) return 1;
        for (let loopVar = 2; loopVar <= nVal; loopVar++) {
            resultFactorial *= loopVar;
        }
        return resultFactorial;
    };
    
    const calculateCombinations = (nVal, kVal) => {
        if (kVal < 0 || kVal > nVal) {
            return 0;
        }
        if (kVal === 0 || kVal === nVal) {
            return 1;
        }
        if (kVal > nVal / 2) {
            kVal = nVal - kVal;
        }

        const numerator = calculateFactorial(nVal);
        const denominatorProduct = calculateFactorial(kVal) * calculateFactorial(nVal - kVal);
        
        return Math.round(numerator / denominatorProduct);
    };

    const baseTwo = 2;
    const evenCombinations = Math.pow(baseTwo, evenCount);
    
    let oddCombinations = 0;
    
    if (remainderCondition === 0) {
        let currentOddIndex = 0;
        const stepIncrement = 2;
        while (currentOddIndex <= oddCount) {
            oddCombinations += calculateCombinations(oddCount, currentOddIndex);
            currentOddIndex += stepIncrement;
        }
    } else {
        let currentOddIndex = 1;
        const stepIncrement = 2;
        while (currentOddIndex <= oddCount) {
            const currentCombinationValue = calculateCombinations(oddCount, currentOddIndex);
            oddCombinations += currentCombinationValue;
            console.log(currentCombinationValue);
            currentOddIndex += stepIncrement;
        }
    }
    
    console.log(evenCombinations * oddCombinations);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
