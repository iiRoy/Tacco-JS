processInput = rawDataArray => {
    const inputLineData = rawDataArray[0];
    const parsedStringComponents = inputLineData.split(' ');

    const valueA = Number(parsedStringComponents[0]);
    const valueB = Number(parsedStringComponents[1]);
    const totalTimeLimit = Number(parsedStringComponents[2]);

    const numberOfIterations = Math.floor(totalTimeLimit / valueA);
    const finalCalculatedResult = numberOfIterations * valueB;

    console.log(finalCalculatedResult);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
