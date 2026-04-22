const processInputData = (rawTextContent) => {
    const lines = rawTextContent.split('\n');

    const configLineParts = lines[0].split(' ');
    const numSanctuaries = Number(configLineParts[0]);
    const numTemples = Number(configLineParts[1]);
    const numQueries = Number(configLineParts[2]);

    const sanctuaryCoordinates = lines
        .slice(1, 1 + numSanctuaries)
        .map(Number);

    const templeCoordinates = lines
        .slice(1 + numSanctuaries, 1 + numSanctuaries + numTemples)
        .map(Number);

    const queryCoordinates = lines
        .slice(1 + numSanctuaries + numTemples, 1 + numSanctuaries + numTemples + numQueries)
        .map(Number);

    const queryResults = [];

    queryCoordinates.forEach(currentQueryPoint => {
        let minimumJourneyCost = Number.POSITIVE_INFINITY;

        Array.from({ length: sanctuaryCoordinates.length }).forEach((_, sanctuaryIndex) => {
            const sanctuaryPosition = sanctuaryCoordinates[sanctuaryIndex];

            Array.from({ length: Math.max(0, templeCoordinates.length - sanctuaryIndex) })
                 .forEach((_, tempOffset) => {
                    const templeIndex = sanctuaryIndex + tempOffset;
                    const templePosition = templeCoordinates[templeIndex];

                    const distanceBetweenStops = Math.abs(sanctuaryPosition - templePosition);
                    const initialLegOptions = Math.min(
                        Math.abs(currentQueryPoint - sanctuaryPosition),
                        Math.abs(currentQueryPoint - templePosition)
                    );
                    const calculatedRouteCost = distanceBetweenStops + initialLegOptions;

                    minimumJourneyCost = Math.min(minimumJourneyCost, calculatedRouteCost);
                });
        });
        queryResults.push(minimumJourneyCost);
    });

    queryResults.forEach(res => console.log(`${res}`));
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));