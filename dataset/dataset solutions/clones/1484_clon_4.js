const processData = (rawContent) => {
    const initialSegment = rawContent.split('\n')[0];
    const [leftOperand, rightOperand] = initialSegment.split(' ').slice(0, 2).map(Number);
    return leftOperand - 1 - rightOperand;
};
console.log(processData(require("fs").readFileSync("/dev/stdin", "utf8")));