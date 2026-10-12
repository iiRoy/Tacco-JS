function processInput(rawData) {
    const lines = rawData.split("\n");

    const parseThreeIntegers = (lineStr) => {
        const parts = lineStr.split(" ");
        return parts.map(Number);
    };

    const [initialA, initialB, initialC] = parseThreeIntegers(lines[0]);

    let currentA = initialA;
    let currentB = initialB;
    let currentC = initialC;

    let operationCount = 0;

    const hasOddNumber = (n1, n2, n3) => {
        return n1 % 2 !== 0 || n2 % 2 !== 0 || n3 % 2 !== 0;
    };

    const calculateNextValues = (prevA, prevB, prevC) => {
        const nextA_val = (prevB + prevC) / 2;
        const nextB_val = (prevA + prevC) / 2;
        const nextC_val = (prevB + prevA) / 2;
        return [nextA_val, nextB_val, nextC_val];
    };

    if (currentA === currentB && currentB === currentC) {
        if (!hasOddNumber(currentA, currentB, currentC)) {
            operationCount = -1;
        }
    } else {
        while (!hasOddNumber(currentA, currentB, currentC)) {
            const [nextA, nextB, nextC] = calculateNextValues(currentA, currentB, currentC);
            currentA = nextA;
            currentB = nextB;
            currentC = nextC;
            operationCount++;
        }
    }
    
    console.log(operationCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
