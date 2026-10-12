function Main(input) {
    const processSingleLine = (currentLineContent) => {
        const lineSegments = currentLineContent.split(" ");

        const firstOperand = Number(lineSegments[0]);
        const secondOperand = Number(lineSegments[1]);

        const totalValue = firstOperand + secondOperand;

        console.log(String(totalValue).length);
    };

    input.split("\n").forEach(processSingleLine);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
