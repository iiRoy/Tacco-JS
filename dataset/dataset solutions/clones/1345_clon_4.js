const nodeIO = require("node:fs");
const entryPointFD = 0;
const dataCapacity = 64;
const dataStore = Buffer.alloc(dataCapacity);
let octetsRead = 0;
try {
    octetsRead = nodeIO.readSync(entryPointFD, dataStore, 0, dataCapacity, null);
} catch (issue) {
    // Error handling omitted for brevity as per common competitive programming style
}

const receivedPayload = dataStore.toString('utf8', 0, octetsRead).trim();
const numericDatum = parseFloat(receivedPayload);

const mathematicalConstant = 2 * Math.asin(1);
const inputScalar = numericDatum;

const surfaceExtent = inputScalar * inputScalar * mathematicalConstant;
const boundaryDistance = 2 * mathematicalConstant * inputScalar;

const finalResult = surfaceExtent.toString() + " " + boundaryDistance.toString();
process.stdout.write(finalResult + '\n');