function performCalculation(rawContent) {
  const extractedNumbers = rawContent.match(/(-?\d+)/g);
  
  const initialValueA = BigInt(extractedNumbers[0]);
  const initialValueB = BigInt(extractedNumbers[1]);

  const obtainAbsoluteMagnitude = (amount) => (amount < 0n ? -amount : amount);

  const transformedValueA = obtainAbsoluteMagnitude(initialValueA - 2n);
  const transformedValueB = obtainAbsoluteMagnitude(initialValueB - 2n);

  let finalProduct = transformedValueA * transformedValueB;

  process.stdout.write(finalProduct.toString() + '\n');
}

const fileSystemAccessor = require('node:fs');
const acquiredData = fileSystemAccessor.readFileSync('/dev/stdin', { encoding: 'utf8' });
performCalculation(acquiredData);