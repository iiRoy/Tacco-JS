const processSimulation = (rawData) => {
    const lines = rawData.split('\n');

    const [extent, numMoves] = lines[0].split(' ').map(Number);
    
    const currentPopulation = Array(extent).fill(0);

    const initialFootprints = new Map();

    lines[1].split('').forEach((char, spot) => {
        currentPopulation[spot] = 1;
        if (!initialFootprints.has(char)) {
            initialFootprints.set(char, new Set());
        }
        initialFootprints.get(char).add(spot);
    });

    const movementSeries = lines.slice(2, 2 + numMoves).map(line => {
        const [kind, way] = line.split(' ');
        return { kind, vector: way === 'R' ? 1 : -1 };
    });

    const shiftPieces = (populationState, originSpot, vector, boardLimit) => {
        const countToShift = populationState[originSpot];
        if (countToShift === 0) return;

        populationState[originSpot] = 0;

        const targetSpot = originSpot + vector;
        if (targetSpot >= 0 && targetSpot < boardLimit) {
            populationState[targetSpot] += countToShift;
        }
    };

    const finalPopulationState = movementSeries.reduce((boardState, instruction) => {
        const { kind, vector } = instruction;
        const relevantSpots = initialFootprints.get(kind);

        if (!relevantSpots || relevantSpots.size === 0) {
            return boardState;
        }

        const nextBoardState = [...boardState];

        const spotsToOperate = Array.from(relevantSpots);

        if (vector === 1) {
            spotsToOperate.sort((a, b) => b - a);
        } else {
            spotsToOperate.sort((a, b) => a - b);
        }

        spotsToOperate.forEach(originSpot => {
            shiftPieces(nextBoardState, originSpot, vector, extent);
        });

        return nextBoardState;
    }, currentPopulation);

    const totalRemaining = finalPopulationState.reduce((total, count) => total + count, 0);

    console.log(totalRemaining);
};

processSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));