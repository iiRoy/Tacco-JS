function processInput(rawData) {
    const inputLines = rawData.split('\n');
    const initialNumStrings = inputLines[0].split(' ');

    const valA = Number(initialNumStrings[0]);
    const valB = Number(initialNumStrings[1]);
    const valC = Number(initialNumStrings[2]);
    const exponentValue = Number(inputLines[1]);

    const numericValues = [valA, valB, valC];
    numericValues.sort((x, y) => x - y);

    const maxVal = numericValues[2];
    const remainingSum = numericValues[0] + numericValues[1];

    const powerOfTwo = 2 ** exponentValue;

    const finalResult = maxVal * powerOfTwo + remainingSum;
    console.log(finalResult);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
