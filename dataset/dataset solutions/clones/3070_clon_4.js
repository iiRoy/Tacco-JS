const resourceGate = require('node:fs');

const processedInformation = resourceGate.readFileSync('/dev/stdin', 'utf8')
                                         .split(/\s+/)
                                         .filter(Boolean)
                                         .map(Number);

const primaryCount = processedInformation[0];
const serviceCapacities = processedInformation.slice(1);

const mostEfficientCapacity = serviceCapacities.reduce((currentMin, element) => {
    return (element < currentMin) ? element : currentMin;
}, Infinity);

const totalCyclesRequired = Math.ceil((primaryCount + 4 * mostEfficientCapacity) / mostEfficientCapacity);

console.log(totalCyclesRequired);