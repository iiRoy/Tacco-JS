const sourceInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const inputTokenArray = sourceInputData.split(/\s/);
for (const currentInputToken of inputTokenArray) {
    if (!currentInputToken) {
        break;
    }
    const numericalValue = Number(currentInputToken);
    const computedResult = (numericalValue * numericalValue + numericalValue + 2) / 2;
    console.log(computedResult);
}
