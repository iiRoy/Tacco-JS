const calculateUnionLength = (inputContent) => {
    const dataLines = inputContent.split('\n');
    const parameters = dataLines[0].split(' ').map(parseFloat);
    const coordinates = dataLines[1].split(' ').map(parseFloat);

    const intervalSpan = parameters[1];

    if (coordinates.length === 0) {
        process.stdout.write('0\n');
        return;
    }

    const boundaryEvents = [];
    for (const point of coordinates) {
        boundaryEvents.push({ location: point, kind: 1 });
        boundaryEvents.push({ location: point + intervalSpan, kind: -1 });
    }

    boundaryEvents.sort((alpha, beta) => {
        if (alpha.location !== beta.location) {
            return alpha.location - beta.location;
        }
        return beta.kind - alpha.kind;
    });

    let totalExtent = 0;
    let currentCoverageLevel = 0;
    let previousEventLocation = boundaryEvents[0].location;

    for (const currentEvent of boundaryEvents) {
        if (currentCoverageLevel > 0) {
            totalExtent += currentEvent.location - previousEventLocation;
        }

        currentCoverageLevel += currentEvent.kind;
        previousEventLocation = currentEvent.location;
    }

    process.stdout.write(totalExtent.toString() + '\n');
};

const retrieveInputData = () => require("node:fs").readFileSync("/dev/stdin", "utf8").trim();

calculateUnionLength(retrieveInputData());