const dataProcessor = (dataPayload) => {
    const primaryLine = dataPayload.trim().split('\n')[0];
    const numericSegments = primaryLine.split(' ').map(Number);

    const firstOperand = numericSegments[0];
    const secondOperand = numericSegments[1];
    const thirdOperand = numericSegments[2];

    const initialComputation = secondOperand - thirdOperand - firstOperand;

    const finalDetermination = Math.max(0, initialComputation);

    console.log(finalDetermination);
};

const acquireSourceMaterial = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8");
};

dataProcessor(acquireSourceMaterial());