function computeRotatedSquareVertices(coordinateInputString) {
    const stringParts = coordinateInputString.split(" ");
    const numericCoordinates = stringParts.map(val => parseInt(val, 10));

    const [x1Coord, y1Coord, x2Coord, y2Coord] = numericCoordinates;

    const deltaX = x2Coord - x1Coord;
    const deltaY = y2Coord - y1Coord;

    const x3Coord = x2Coord - deltaY;
    const y3Coord = y2Coord + deltaX;

    const x4Coord = x3Coord - deltaX;
    const y4Coord = y3Coord - deltaY;

    return [x3Coord, y3Coord, x4Coord, y4Coord].join(" ");
}

((initialInputString, processedOutput, outputType) => {
    if (typeof require !== "undefined") {
        console.log(computeRotatedSquareVertices(require("fs").readFileSync("/dev/stdin", "utf8")));
    } else {
        initialInputString = initialInputString.split("\n").slice(1, -1).join("\n");
        processedOutput = (() => {
            try {
                return computeRotatedSquareVertices(initialInputString);
            } catch (error) {
                return error.stack || error.message;
            }
        })();
        outputType = typeof processedOutput;

        if (outputType !== "string") {
            processedOutput = JSON.stringify(processedOutput);
        }

        $("<form>")
            .append(
                [
                    [10, initialInputString], 0,
                    [1, outputType], 0,
                    [10, processedOutput]
                ].map(item =>
                    $(item ? "<textarea>" : "<br>", item && { rows: item[0], cols: 40, text: item[1] })
                )
            )
            .appendTo("body");
    }
})(`
31 -41 -59 26
`);
