function processInput(rawInputContent) {
    const inputLines = rawInputContent.split("\n");
    const elementCount = Number.parseInt(inputLines[0], 10);
    const numericSequence = inputLines[1].split(" ").map(Number);

    let matchingSubarrayCount = 0;

    Array.from({ length: elementCount }, (_, startIdx) => {
        Array.from({ length: elementCount - startIdx }, (_, lengthOffset) => {
            const endIdx = startIdx + lengthOffset;
            const currentSubarray = numericSequence.slice(startIdx, endIdx + 1);

            const subarrayXorSum = currentSubarray.reduce((acc, val) => acc ^ val, 0);
            const subarrayArithmeticSum = currentSubarray.reduce((acc, val) => acc + val, 0);

            if (subarrayXorSum === subarrayArithmeticSum) {
                matchingSubarrayCount++;
            }
        });
    });

    console.log(String(matchingSubarrayCount));
}

function executeDebug() {
    const inputSource = document.getElementById("input");
    if (inputSource) {
        processInput(inputSource.value);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
