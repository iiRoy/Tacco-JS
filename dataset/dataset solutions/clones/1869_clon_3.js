const processInput = (rawData) => {
    const stringParts = rawData.split(" ");

    const numericStrings = [stringParts[0], stringParts[1], stringParts[2], stringParts[3]];
    const [valA, valB, valC, targetK] = numericStrings.map(s => parseInt(s, 10));

    const currentSum = valA + valB;

    if (currentSum >= targetK) {
        console.log(valA);
    } else {
        const requiredAmount = targetK - currentSum;
        const finalOutput = valA - requiredAmount;
        console.log(finalOutput);
    }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
