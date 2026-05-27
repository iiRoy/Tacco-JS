const processInput = rawData => {
    const lines = rawData.trim().split('\n');
    const firstLineContent = lines[0];
    const firstToken = firstLineContent.split(" ")[0];

    const ZERO_NUMERIC_VALUE = 0;

    const outcomeIndicator = (firstToken == ZERO_NUMERIC_VALUE) ? 1 : 0;

    console.log(outcomeIndicator);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
