const processInput = (sourceText) => {
    const [firstNum, secondNum] = sourceText.split('\n')[0].split(' ').map(Number);

    const remainderA = firstNum % 3;
    const remainderB = secondNum % 3;

    const outcome = (remainderA === remainderB && remainderA !== 0) ? "Impossible" : "Possible";
    console.log(outcome);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
