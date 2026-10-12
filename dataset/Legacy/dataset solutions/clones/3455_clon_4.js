function padZero(num, length) {
    let s = String(num);
    while (s.length < length) {
        s = '0' + s;
    }
    return s;
}

function processCityData(rawData) {
    const lines = rawData.trim().split('\n');

    if (lines.length === 0) {
        throw new Error("Input is empty.");
    }

    const nmParts = lines[0].split(' ').map(Number);
    if (nmParts.length !== 2 || isNaN(nmParts[0]) || isNaN(nmParts[1])) {
        throw new Error("Invalid N M line format.");
    }
    const totalCities = nmParts[0];
    const eventCount = nmParts[1];

    const cityEvents = [];
    for (let k = 1; k <= eventCount; k++) {
        if (k >= lines.length) {
            throw new Error(`Expected ${eventCount} event lines but found fewer. Missing line ${k + 1}.`);
        }
        const pyParts = lines[k].split(' ').map(Number);
        if (pyParts.length !== 2 || isNaN(pyParts[0]) || isNaN(pyParts[1])) {
            throw new Error(`Invalid P Y line format on line ${k + 1}.`);
        }
        cityEvents.push({
            prefectureId: pyParts[0],
            year: pyParts[1],
            originalOrder: k - 1
        });
    }

    cityEvents.sort((firstEvent, secondEvent) => {
        if (firstEvent.prefectureId !== secondEvent.prefectureId) {
            return firstEvent.prefectureId - secondEvent.prefectureId;
        }
        return firstEvent.year - secondEvent.year;
    });

    const finalIds = new Array(eventCount);
    let currentPref = -1;
    let currentRank = 0;

    for (const event of cityEvents) {
        if (event.prefectureId !== currentPref) {
            currentPref = event.prefectureId;
            currentRank = 1;
        } else {
            currentRank++;
        }

        const formattedPref = padZero(event.prefectureId, 6);
        const formattedRank = padZero(currentRank, 6);
        finalIds[event.originalOrder] = formattedPref + formattedRank;
    }

    return finalIds.join('\n');
}

const nodeFileSystem = require('fs');

try {
    const inputBuffer = nodeFileSystem.readFileSync('/dev/stdin');
    const inputText = inputBuffer.toString('utf8');
    const result = processCityData(inputText);
    console.log(result);
} catch (error) {
    throw error;
}
