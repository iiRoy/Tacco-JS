const fileSystem = require("fs");
const readline = require("readline");

// TypeScript __awaiter helper, used for async functions
const __awaiter = (thisArg, _arguments, P, generator) => {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

// TypeScript __generator helper, used for async functions
const __generator = (thisArg, body) => {
    let _state = { label: 0, sent: function() { if (1 & _state[0]) throw _state[1]; return _state[1]; }, trys: [], ops: [] };
    let _outer = { next: verb(0), "throw": verb(1), "return": verb(2) };
    if (typeof Symbol === "function" && (_outer[Symbol.iterator] = function() { return this; }), _outer) return _outer;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (_state) throw new TypeError("Generator is already executing.");
        while (_state) try {
            if (1 === op[0] && _state[0]) throw _state[1];
            if (op[0] && (_state = 2 & op[0] ? _outer["return"] : op[0] ? _outer["throw"] || ((_state = _outer["return"]) && _state.call(_outer), 0) : _outer.next) && !(_state = _state.call(_outer, op[1])).done) return _state;
            _state = 0;
            if (op[0]) throw op[1];
            return { value: op[1], done: true };
        } catch (e) {
            op = [6, e];
            _outer = 0;
        } finally {
            _state = _outer = 0;
        }
        if (5 & op[0]) throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};

// Function to read input lines from stdin
async function readInputLines() {
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const receivedLines = [];
    const lineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    lineInterface.on("line", (currentLine) => {
        receivedLines.push(currentLine);
    });

    return new Promise((resolvePromise) => {
        lineInterface.on("close", () => {
            resolvePromise(receivedLines);
        });
    });
}

// Helper function for interactive sorting, performs a comparison
const performInteractiveComparison = (firstElement, secondElement) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("? " + firstElement + " " + secondElement);
    const comparisonResult = fileSystem.readFileSync("/dev/stdin", "utf8");
    return "<" === comparisonResult;
});

// Helper function for interactive sorting, implements merge sort
const mergeSortInteractive = (elementsArray) => __awaiter(void 0, void 0, void 0, function* () {
    if (elementsArray.length <= 1) {
        return elementsArray;
    }

    const midPoint = Math.ceil(elementsArray.length / 2);
    const leftHalf = elementsArray.slice(0, midPoint);
    const rightHalf = elementsArray.slice(midPoint);

    const sortedLeft = yield mergeSortInteractive(leftHalf);
    const sortedRight = yield mergeSortInteractive(rightHalf);

    const mergedResult = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < sortedLeft.length && rightIndex < sortedRight.length) {
        const isLeftSmaller = yield performInteractiveComparison(sortedLeft[leftIndex], sortedRight[rightIndex]);
        if (isLeftSmaller) {
            mergedResult.push(sortedLeft[leftIndex]);
            leftIndex++;
        } else {
            mergedResult.push(sortedRight[rightIndex]);
            rightIndex++;
        }
    }

    mergedResult.push(...sortedLeft.slice(leftIndex));
    mergedResult.push(...sortedRight.slice(rightIndex));

    return mergedResult;
});

// Helper function for AIrreversibleOperation problem
const calculateIrreversibleOperations = (booleanArray) => {
    const flipIndices = [];
    for (let i = 0; i < booleanArray.length - 1; i += 1) {
        if (booleanArray[i] === true && booleanArray[i + 1] === false) {
            flipIndices.push(i);
        }
    }
    if (flipIndices.length === 0) {
        return 0;
    }

    const maxOperations = Math.max(...flipIndices.map((index) => {
        const nextArrayState = [...booleanArray];
        nextArrayState[index] = !nextArrayState[index];
        nextArrayState[index + 1] = !nextArrayState[index + 1];
        return calculateIrreversibleOperations(nextArrayState);
    }));
    return 1 + maxOperations;
};

// Helper function for BPowerOfTwo problem
const calculateMaxPowerOfTwoPairs = (numbers) => {
    if (numbers.length < 2) {
        return 0;
    }

    const maxVal = Math.max(...numbers.map((currentNum, currentIndex) => {
        const remainingNumbers = numbers.filter((_, filterIndex) => filterIndex !== currentIndex);
        return Math.max(...remainingNumbers.map((otherNum, otherIndex) => {
            const sum = currentNum + otherNum;
            const isPowerOfTwo = (sum > 0) && ((sum & (sum - 1)) === 0);
            if (isPowerOfTwo) {
                const filteredRemaining = remainingNumbers.filter((_, filterIdx) => filterIdx !== otherIndex);
                return calculateMaxPowerOfTwoPairs(filteredRemaining) + 1;
            }
            return 0;
        }));
    }));
    return maxVal;
};


// Collection of solutions for Beginner Contest 122
const beginnerContest122Solutions = {
    A_DoubleHelix: (inputData) => {
        const baseChar = inputData[0];
        switch (baseChar) {
            case "A": return ["T"];
            case "T": return ["A"];
            case "C": return ["G"];
            case "G": return ["C"];
            default: throw new Error("invalid string");
        }
    },
    B_ATCoder: (inputData) => {
        const dnaString = inputData[0];
        let maxACGTLength = 0;
        let currentACGTLength = 0;
        for (let i = 0; i < dnaString.length; i += 1) {
            const char = dnaString[i];
            if (char === "A" || char === "T" || char === "C" || char === "G") {
                currentACGTLength += 1;
            } else {
                if (currentACGTLength > maxACGTLength) {
                    maxACGTLength = currentACGTLength;
                }
                currentACGTLength = 0;
            }
        }
        if (currentACGTLength > maxACGTLength) {
            maxACGTLength = currentACGTLength;
        }
        return [String(maxACGTLength)];
    },
    C_GeT_AC: (inputData) => {
        const firstLineNumbers = inputData[0].split(" ").map(Number);
        const N_val = firstLineNumbers[0]; // N is unused
        const Q_val = firstLineNumbers[1]; // Q is unused
        const S_string = inputData[1];
        const queryLines = inputData.slice(2).map(line => line.split(" ").map(Number));

        const isACPairStart = S_string.split("").map((char, index, arr) => {
            return char === "A" && arr.length > index + 1 && arr[index + 1] === "C";
        });

        return queryLines.map((query) => {
            const startIndex = query[0];
            const endIndex = query[1];
            let acCount = 0;
            for (let k = startIndex - 1; k < endIndex - 1; k += 1) {
                if (isACPairStart[k]) {
                    acCount += 1;
                }
            }
            return String(acCount);
        });
    }
};

// Collection of solutions for Diverta 2019 Programming Contest
const diverta2019ProgrammingContestSolutions = {
    c: (inputData) => {
        const N_count = Number(inputData[0].split(" ")[0]); // N_count is unused
        const stringList = inputData.slice(1);
        let totalABCount = 0;
        let startsWithBCount = 0;
        let endsWithACount = 0;
        let startsWithBAndEndsWithACount = 0;

        stringList.forEach((currentString) => {
            if (currentString.startsWith("B")) {
                startsWithBCount += 1;
            }
            if (currentString.endsWith("A")) {
                endsWithACount += 1;
            }
            if (currentString.startsWith("B") && currentString.endsWith("A")) {
                startsWithBAndEndsWithACount += 1;
            }
            const abMatches = currentString.match(/AB/g);
            if (abMatches) {
                totalABCount += abMatches.length;
            }
        });

        if (endsWithACount - startsWithBAndEndsWithACount === 0 && startsWithBCount - startsWithBAndEndsWithACount === 0) {
            return [String(totalABCount + startsWithBAndEndsWithACount - (startsWithBAndEndsWithACount > 0 ? 1 : 0))];
        } else {
            const minEndsOrStarts = Math.min(endsWithACount, startsWithBCount);
            return [String(minEndsOrStarts + totalABCount)];
        }
    },
    d: (inputLines) => {
        const firstLineParts = inputLines[0].split(" ");
        const N_value = Number(firstLineParts[0]);

        let sumOfMValues = 0;
        const squareRootOfN = Math.sqrt(N_value);

        for (let currentDivisorCandidate = 1; currentDivisorCandidate < squareRootOfN; currentDivisorCandidate += 1) {
            const potentialMValue = (N_value - currentDivisorCandidate) / currentDivisorCandidate;
            const isExactDivisor = Number.isInteger(potentialMValue);

            if (isExactDivisor) {
                sumOfMValues += potentialMValue;
            }
        }
        return [String(sumOfMValues)];
    }
};

// Collection of solutions for Grand Contest 029
const grandContest029Solutions = {
    AIrreversibleOperation: (inputData) => {
        const binaryString = inputData[0];
        const booleanRepresentation = binaryString.split("").map((char) => char === "B");
        return [calculateIrreversibleOperations(booleanRepresentation)];
    },
    BPowerOfTwo: (inputData) => {
        const N_val = Number(inputData[0]); // N_val is unused
        const numbersArray = inputData[1].split(" ").map(Number);

        const partitionedNumbers = {
            odds: numbersArray.filter(num => num % 2 === 1),
            evens: numbersArray.filter(num => num % 2 === 0)
        };

        const maxOddsPairs = calculateMaxPowerOfTwoPairs(partitionedNumbers.odds);
        const maxEvensPairs = calculateMaxPowerOfTwoPairs(partitionedNumbers.evens);

        return [String(maxOddsPairs + maxEvensPairs)];
    }
};

// Main collection of all contest solutions
const allContestSolutions = {
    beginner_contest_122: beginnerContest122Solutions,
    Diverta2019ProgrammingContest: diverta2019ProgrammingContestSolutions,
    GrandContest029: grandContest029Solutions,
    interactiveSorting: (inputData) => __awaiter(void 0, void 0, void 0, function* () {
        const firstLineNumbers = inputData[0].split(" ").map(Number);
        const N_elements = firstLineNumbers[0];
        const Q_queries = firstLineNumbers[1]; // Q_queries is unused

        const startCharCode = "A".charCodeAt(0);
        const initialElements = Array.from({ length: N_elements }, (_, index) =>
            String.fromCharCode(startCharCode + index)
        );

        const sortedElements = yield mergeSortInteractive(initialElements);
        return ["! " + sortedElements.join("")];
    }),
    welcomeToAtCoder: (inputData) => {
        const a_val = Number(inputData[0]);
        const b_c_parts = inputData[1].split(" ").map(Number);
        const b_val = b_c_parts[0];
        const c_val = b_c_parts[1];
        const s_string = inputData[2];

        const sum = a_val + b_val + c_val;
        return [`${sum} ${s_string}`];
    }
};

// Main execution block
(async () => {
    const inputLines = await readInputLines();
    const results = allContestSolutions.Diverta2019ProgrammingContest.d(inputLines);
    results.forEach(resultLine => console.log(resultLine));
})();
