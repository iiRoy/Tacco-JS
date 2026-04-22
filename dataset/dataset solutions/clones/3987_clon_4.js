const obtainData = () => require("node:fs").readFileSync(0, "utf8").trim();
const displayResult = (value) => console.log(value);

const parseBounds = (rawText) => {
    const parts = rawText.split(' ');
    return [Number(parts[0]), Number(parts[1])];
};

const isSymmetric = (numeral) => {
    // For a 5-digit number (e.g., abcde), a palindrome means a=e and b=d.
    // Extract digits using mathematical operations.
    const lastDigit = numeral % 10;
    const secondToLastDigit = Math.floor((numeral / 10) % 10);
    const secondDigit = Math.floor((numeral / 1000) % 10);
    const firstDigit = Math.floor((numeral / 10000) % 10);

    return firstDigit === lastDigit && secondDigit === secondToLastDigit;
};

const processRange = (startVal, endVal) => {
    // Generate an array containing all numbers in the specified range.
    const numbersToExamine = Array.from(
        { length: endVal - startVal + 1 },
        (_, index) => startVal + index
    );

    // Filter this array to keep only the symmetric numbers (5-digit palindromes).
    const symmetricNumbers = numbersToExamine.filter(isSymmetric);

    // The count of such numbers is the length of the filtered array.
    return symmetricNumbers.length;
};

const executeAnalysis = () => {
    const rawInput = obtainData();
    const [lowerBound, upperBound] = parseBounds(rawInput);
    const finalCount = processRange(lowerBound, upperBound);
    displayResult(finalCount);
};

executeAnalysis();