const processInputAndSolve = () => {
    const [startVal, endVal] = require("fs").readFileSync("/dev/stdin", "utf8").split("\n")[0].split(" ").map(Number);

    const isNumPalindrome = (numIdentifier) => {
        const stringRepresentation = String(numIdentifier);
        const stringLength = stringRepresentation.length;
        let leftPointer = 0;
        let rightPointer = stringLength - 1;

        while (leftPointer < rightPointer) {
            if (stringRepresentation[leftPointer] !== stringRepresentation[rightPointer]) {
                return false;
            }
            leftPointer++;
            rightPointer--;
        }
        return true;
    };

    const palindromeCount = Array.from({ length: endVal - startVal + 1 }, (_, indexOffset) => startVal + indexOffset)
                                 .filter(isNumPalindrome)
                                 .length;

    console.log(palindromeCount);
};

processInputAndSolve();
