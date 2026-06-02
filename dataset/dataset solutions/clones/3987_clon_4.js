const acquireInput = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();
const displayOutput = (content) => console.log(content);
const reportError = (issue) => console.error(issue);

const checkPalindrome = (value) => {
    const textForm = String(value);
    if (textForm.length !== 5) {
        return false;
    }
    const reversedTextForm = textForm.split('').reverse().join('');
    return textForm === reversedTextForm;
};

const processInputAndCalculate = (rawInput) => {
    const [lowerBound, upperBound] = rawInput.split(" ").map(Number);

    const numberSequence = function* (start, end) {
        let current = start;
        while (current <= end) {
            yield current;
            current++;
        }
    };

    const totalPalindromes = [...numberSequence(lowerBound, upperBound)].reduce((count, num) => {
        return count + (checkPalindrome(num) ? 1 : 0);
    }, 0);

    displayOutput(totalPalindromes);
};

processInputAndCalculate(acquireInput());
