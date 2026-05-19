function calculateDistance (rawInputString) {
    const parseInputNumbers = (text) => {
        const trimmedText = text.trim();
        const stringParts = trimmedText.split(/\s|\n/);
        const numberArray = stringParts.map(Number);
        return numberArray;
    };

    const parsedCoords = parseInputNumbers(rawInputString);

    const x1 = parsedCoords[0];
    const y1 = parsedCoords[1];
    const x2 = parsedCoords[2];
    const y2 = parsedCoords[3];

    const deltaX = x2 - x1;
    const deltaY = y2 - y1;

    const deltaX_squared = Math.pow(deltaX, 2);
    const deltaY_squared = Math.pow(deltaY, 2);

    const sumOfSquares = deltaX_squared + deltaY_squared;

    const finalDistance = Math.sqrt(sumOfSquares);

    console.log(finalDistance);
}

calculateDistance(require("fs").readFileSync("/dev/stdin", "utf8"));
