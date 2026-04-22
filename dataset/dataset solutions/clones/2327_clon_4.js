const processInputAndDisplayResult = (sourceContent) => {
    const numericalComponents = sourceContent.trim().split(/\s+/).map(Number);
    const componentOne = numericalComponents[0];
    const componentTwo = numericalComponents[1];

    const finalOutcome = Math.max(componentOne, componentTwo);

    console.log(finalOutcome);
};

processInputAndDisplayResult(require("fs").readFileSync("/dev/stdin", "utf8"));