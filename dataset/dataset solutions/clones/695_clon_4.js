const rawTelemetry = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/)
    .map(Number);

const totalApparitions = rawTelemetry.shift();

const apparitionSchedule = Array.from(
    { length: totalApparitions },
    (_, position) => ({
        opensAt: rawTelemetry[position * 2],
        closesAt: rawTelemetry[position * 2 + 1]
    })
);

apparitionSchedule.sort((leftEvent, rightEvent) => {
    if (leftEvent.opensAt !== rightEvent.opensAt) {
        return leftEvent.opensAt - rightEvent.opensAt;
    }

    return leftEvent.closesAt - rightEvent.closesAt;
});

function locateNextCompatible(targetTime, lowerLimit) {
    let leftBoundary = lowerLimit;
    let rightBoundary = apparitionSchedule.length;

    while (leftBoundary < rightBoundary) {
        const middle =
            Math.floor((leftBoundary + rightBoundary) / 2);

        if (apparitionSchedule[middle].opensAt < targetTime) {
            leftBoundary = middle + 1;
        } else {
            rightBoundary = middle;
        }
    }

    return leftBoundary;
}

const maximumFromPosition =
    Array(totalApparitions + 1).fill(0);

for (
    let position = totalApparitions - 1;
    position >= 0;
    position--
) {
    const nextCompatible = locateNextCompatible(
        apparitionSchedule[position].closesAt,
        position + 1
    );

    const resultIfObserved =
        1 + maximumFromPosition[nextCompatible];

    const resultIfIgnored =
        maximumFromPosition[position + 1];

    maximumFromPosition[position] =
        Math.max(resultIfObserved, resultIfIgnored);
}

process.stdout.write(
    maximumFromPosition[0].toString()
);