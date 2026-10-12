function main(input = "") {
    const sourceLines = input.split("\n");
    const maxCutsAllowed = Number.parseInt(sourceLines[0].split(" ")[1], 10);
    const segmentLengths = sourceLines[1].split(" ").map(Number.parseInt);

    let lowerBound = 1;
    let upperBound = Math.max(...segmentLengths);
    let optimalLength = upperBound;

    const calculatePieceCuts = (pieceSize, targetSegmentSize) => {
        return Math.floor((pieceSize - 1) / targetSegmentSize);
    };

    while (lowerBound <= upperBound) {
        const currentTestLength = Math.floor((upperBound + lowerBound) / 2);

        const totalCutsRequired = segmentLengths.reduce((accumulator, currentPieceLength) => {
            return accumulator + calculatePieceCuts(currentPieceLength, currentTestLength);
        }, 0);

        if (totalCutsRequired <= maxCutsAllowed) {
            optimalLength = currentTestLength;
            upperBound = currentTestLength - 1;
        } else {
            lowerBound = currentTestLength + 1;
        }
    }
    return optimalLength;
}

exports.main = main;

function Main(input) {
    console.log(main(input.trim()));
}

if (process.argv[2] !== "test") {
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
}
