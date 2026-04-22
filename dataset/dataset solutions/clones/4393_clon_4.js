function processData(rawData) {
    const firstLineBreak = rawData.indexOf('\n');
    const relevantSegment = firstLineBreak === -1 ? rawData : rawData.substring(0, firstLineBreak);

    const numericalStrings = relevantSegment.match(/-?\d+/g);

    if (!numericalStrings || numericalStrings.length < 3) {
        // Assuming valid input as per original problem constraints
        return;
    }

    const valueA = Number(numericalStrings[0]);
    const valueB = Number(numericalStrings[1]);
    const valueC = Number(numericalStrings[2]);

    const calculateAbsoluteDifference = (param1, param2) => {
        return param1 > param2 ? param1 - param2 : param2 - param1;
    };

    const findLargerValue = (argX, argY) => {
        return argX > argY ? argX : argY;
    };

    const diffAB = calculateAbsoluteDifference(valueA, valueB);
    const diffAC = calculateAbsoluteDifference(valueA, valueC);

    const finalOutcome = findLargerValue(diffAB, diffAC);

    const outputDisplay = console.log;
    outputDisplay(finalOutcome);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));