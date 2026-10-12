function Main(input) {
    const inputLines = input.split("\n");
    let currentLineIndex = 0;

    while (currentLineIndex < inputLines.length) {
        const currentN = parseInt(inputLines[currentLineIndex]);
        const digitString = inputLines[currentLineIndex + 1];
        const numberSequence = digitString.split("").map(Number);

        let activeSequence = numberSequence;

        while (activeSequence.length > 1) {
            activeSequence = activeSequence.slice(0, -1).map((element, index) =>
                Math.abs(element - activeSequence[index + 1])
            );
        }
        console.log(activeSequence[0]);
        currentLineIndex += 2;
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
