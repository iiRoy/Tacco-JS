const processInputAndDetermineOutput = (rawInputContent) => {
    const numericArray = rawInputContent.trim().split(" ").reduce((accumulator, currentString) => {
        accumulator.push(Number(currentString));
        return accumulator;
    }, []);

    const decisionMatrix = {
        true: "ARC",
        false: "ABC"
    };

    console.log(decisionMatrix[1200 <= numericArray]);
};

processInputAndDetermineOutput(require("fs").readFileSync("/dev/stdin", "utf8"));
