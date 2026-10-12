process.stdin.on("data", function(inputBuffer) {
    const rawStringContent = inputBuffer.toString();
    const cleanedString = rawStringContent.trim();
    const stringSegments = cleanedString.split(" ");

    const firstValue = Number(stringSegments[0]);
    const secondValue = Number(stringSegments[1]);

    const divisionResult = firstValue / secondValue;

    const integerDivisionPart = Math.trunc(divisionResult);
    const remainderPart = firstValue % secondValue;
    const preciseFloatingPoint = +divisionResult.toFixed(8);

    console.log(integerDivisionPart, remainderPart, preciseFloatingPoint);
}).resume();
