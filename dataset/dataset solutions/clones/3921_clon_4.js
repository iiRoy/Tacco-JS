function multiplyBigInts(numA, numB) {
    return (BigInt(numA) * BigInt(numB)).toString();
}

function findCeilingSquareRoot(numString) {
    const n = BigInt(numString);
    if (n < 0n) {
        throw new Error("Negative input for square root.");
    }
    if (n === 0n) {
        return 0;
    }

    let lowerBound = 1n;
    let upperBound = n;
    let currentRoot = 1n;

    while (lowerBound <= upperBound) {
        const midPoint = lowerBound + (upperBound - lowerBound) / 2n;
        if (midPoint > n / midPoint) {
            upperBound = midPoint - 1n;
        } else {
            currentRoot = midPoint;
            lowerBound = midPoint + 1n;
        }
    }
    
    return Number(currentRoot * currentRoot === n ? currentRoot : currentRoot + 1n);
}

function ProcessInput(inputStr) {
    const lines = inputStr.split("\n").map(line => line.trim()).filter(Boolean);
    const queryCount = Number(lines[0]);

    lines.slice(1, queryCount + 1).forEach(currentLine => {
        const [valX, valY] = currentLine.split(" ").map(Number);

        const smallerVal = Math.min(valX, valY);
        const largerVal = Math.max(valX, valY);

        const productStr = multiplyBigInts(smallerVal, largerVal);
        const k = findCeilingSquareRoot(productStr) - 1;

        let finalAnswer = (smallerVal - 1) * 2;

        if (smallerVal < largerVal - 1) {
            finalAnswer++;
        }

        finalAnswer += Math.max(k - smallerVal, 0) * 2;

        if (k !== 0 && Math.floor(smallerVal / k * largerVal) === k) {
            finalAnswer--;
        }

        console.log(finalAnswer);
    });
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
