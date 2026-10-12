const acquireInput = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const processData = (sourceText) => {
    const [firstVal, secondVal, thirdVal, fourthVal] = sourceText.trim().split(" ").map(Number);

    const outcome = ((firstVal & 1) === 1 && (secondVal & 1) === 1) ? "No" : "Yes";
    console.log(outcome);
};

processData(acquireInput());
