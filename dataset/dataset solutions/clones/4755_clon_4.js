const dataOrigin = '/dev/stdin';
const fileSystemInterface = require('node:fs');

const retrievedContent = Buffer.from(fileSystemInterface.readFileSync(dataOrigin)).toString();
const parsedNumericValues = retrievedContent.split('\n')[0].split(' ').map(parseFloat);

const [valOne, valTwo, valThree, valFour] = parsedNumericValues;

const productPrimary = valOne * valTwo;
const productSecondary = valTwo * valThree;
const productTertiary = valThree * valFour;

const derivedOutcome = [productTertiary, productPrimary][Number(productPrimary > productSecondary)];

process.stdout.write(String(derivedOutcome) + '\n');