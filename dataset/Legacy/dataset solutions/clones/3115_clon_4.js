const acquireInput = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();
const displayOutput = (content) => console.log(content);
const reportError = (err) => console.error(err);

const inputConverters = new Map([
    [0, (val) => val],
    [1, (val) => parseInt(val)],
    [2, (val) => val.split(" ")],
    [3, (val) => val.split("\n")],
    [4, (val) => val.split(" ").map(Number)],
    [5, (val) => val.split("\n").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
]);

const transformInput = (value, type) => inputConverters.get(type)(value);

const processMain = (rawInput) => {
    const numericValue = transformInput(rawInput, 1);

    const fixedResponses = new Map([
        [3, "2\n1 3\n2 3"],
        [4, "4\n1 3\n2 1\n4 2\n3 4"],
    ]);

    if (fixedResponses.has(numericValue)) {
        displayOutput(fixedResponses.get(numericValue));
        return;
    }

    let generatedLines = [];

    if (numericValue % 2 !== 0) {
        generatedLines.push((numericValue - 1) * 2);
        const halfCount = Math.floor(numericValue / 2);

        const intermediatePairs = Array.from({ length: halfCount }, (_, idx) => {
            const currentVal = idx + 1;
            const nextVal = currentVal + 1;
            const complementVal = numericValue - 1 - idx;
            const prevComplementVal = complementVal - 1;

            let iterationPairs = [];

            if (idx === 0 || idx === halfCount - 1) {
                iterationPairs.push(`${currentVal} ${numericValue}`);
                iterationPairs.push(`${complementVal} ${numericValue}`);
            }

            if (idx < halfCount - 1) {
                iterationPairs.push(`${currentVal} ${nextVal}`);
                iterationPairs.push(`${currentVal} ${prevComplementVal}`);
                iterationPairs.push(`${complementVal} ${nextVal}`);
                iterationPairs.push(`${complementVal} ${prevComplementVal}`);
            }
            return iterationPairs;
        }).flat();

        generatedLines.push(...intermediatePairs);

    } else {
        generatedLines.push(numericValue * 2);
        const halfCount = numericValue / 2;

        const intermediatePairs = Array.from({ length: halfCount }, (_, idx) => {
            const currentVal = idx + 1;
            let nextVal = currentVal + 1;
            const complementVal = numericValue - idx;
            let prevComplementVal = complementVal - 1;

            if (idx === halfCount - 1) {
                nextVal = 1;
                prevComplementVal = numericValue;
            }

            return [
                `${currentVal} ${nextVal}`,
                `${currentVal} ${prevComplementVal}`,
                `${complementVal} ${nextVal}`,
                `${complementVal} ${prevComplementVal}`,
            ];
        }).flat();

        generatedLines.push(...intermediatePairs);
    }

    displayOutput(generatedLines.join("\n"));
};

processMain(acquireInput());
