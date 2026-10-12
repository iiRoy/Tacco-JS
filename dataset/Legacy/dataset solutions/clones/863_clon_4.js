const fileSystem = require('fs');
const streamStats = fileSystem.fstatSync(process.stdin.fd);
const dataCapacity = streamStats.size;
const dataContainer = Buffer.alloc(dataCapacity);
const actualBytesRead = fileSystem.readSync(process.stdin.fd, dataContainer, 0, dataCapacity, 0);
const parsedLines = dataContainer.toString('utf8', 0, actualBytesRead).split('\n');

const upperLimit = Number(parsedLines[0]);

const [valA, valB] = parsedLines[1].split(' ').map(Number).map(v => v - 1);
const [valC, valD] = parsedLines[2].split(' ').map(Number).map(v => v - 1);

const calculateGridDistance = (p1x, p1y, p2x, p2y) => Math.abs(p1x - p2x) + Math.abs(p1y - p2y);

const minimumCombinedDistance = Array.from({ length: upperLimit }, (_, idx) => idx + 1)
    .reduce((currentMin, divisor) => {
        const aX = valA % divisor;
        const aY = Math.floor(valA / divisor);

        const bX = valB % divisor;
        const bY = Math.floor(valB / divisor);

        const cX = valC % divisor;
        const cY = Math.floor(valC / divisor);

        const dX = valD % divisor;
        const dY = Math.floor(valD / divisor);

        const distanceAB = calculateGridDistance(aX, aY, bX, bY);
        const distanceCD = calculateGridDistance(cX, cY, dX, dY);

        return Math.min(currentMin, distanceAB + distanceCD);
    }, Infinity);

console.log(minimumCombinedDistance);
