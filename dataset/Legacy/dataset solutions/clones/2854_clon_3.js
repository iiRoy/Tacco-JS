function processInput(inputString) {
    const splitValues = inputString.split(" ");

    const numericValues = splitValues.map(strPart => parseInt(strPart, 10));

    const valA = numericValues[0];
    const valB = numericValues[1];
    const valC = numericValues[2];

    const sumAB = valA + valB;
    const sumBC = valB + valC;
    const sumCA = valC + valA;

    const calculatedSums = [sumAB, sumBC, sumCA];
    const minimumSum = Math.min(...calculatedSums);

    console.log(minimumSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
