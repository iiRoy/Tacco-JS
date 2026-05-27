function Main(input) {
    const sourceLines = input.split("\n");
    const iterationLimit = parseInt(sourceLines[0], 10);

    Array.from({ length: iterationLimit }, (_, currentIteration) => {
        const leadingDigit = (currentIteration % 9) + 1;
        const trailingNinesQuantity = Math.floor(currentIteration / 9);

        const constructedString = `${leadingDigit}${"9".repeat(trailingNinesQuantity)}`;
        console.log(constructedString);
    });
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
