const fileAccess = require('node:fs');

const acquiredData = fileAccess.readFileSync('/dev/stdin', { encoding: 'utf-8' });

const baseNumber = ~~acquiredData.trim();

const squaredValue = baseNumber * baseNumber;
const finalProduct = (squaredValue << 1) + squaredValue;

process.stdout.write(String(finalProduct) + '\n');