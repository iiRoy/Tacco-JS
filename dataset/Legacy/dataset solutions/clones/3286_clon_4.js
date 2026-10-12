const processGridConnections = (rawData) => {
    const lines = rawData.trim().split('\n');
    const [gridHeight, gridWidth] = lines[0].split(' ').map(Number);
    const gridData = lines.slice(1).map(line => line.split(''));

    const obstacleChar = '#';
    const pathChar = '.';

    const connectionRecords = Array.from({ length: gridHeight }).flatMap((_, rIdx) =>
        Array.from({ length: gridWidth }).flatMap((_, cIdx) => {
            if (gridData[rIdx][cIdx] !== obstacleChar) {
                return [];
            }

            const currentCoord = [rIdx, cIdx];
            const neighborDisplacements = [[-1, 0], [1, 0], [0, -1], [0, 1]];

            return neighborDisplacements.filter(([dr, dc]) => {
                const nR = rIdx + dr;
                const nC = cIdx + dc;
                return nR >= 0 && nR < gridHeight && nC >= 0 && nC < gridWidth && gridData[nR][nC] === pathChar;
            }).map(([dr, dc]) => {
                const nR = rIdx + dr;
                const nC = cIdx + dc;
                return [currentCoord, [nR, nC]];
            });
        })
    );

    console.log(connectionRecords.length);
};

processGridConnections(require("fs").readFileSync("/dev/stdin", "utf8"));
