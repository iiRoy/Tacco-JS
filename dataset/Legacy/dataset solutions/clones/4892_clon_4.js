const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const [firstLineVal, stringSVal, stringTVal] = inputContent.trim().split('\n');
const integerNVal = parseInt(firstLineVal, 10);

const resultOffset = Array.from({ length: integerNVal }, (_, currentIdx) => currentIdx).findIndex(
  (overlapStart) => {
    const sSuffix = stringSVal.substring(overlapStart);
    const tPrefix = stringTVal.substring(0, integerNVal - overlapStart);
    return sSuffix === tPrefix;
  }
);

if (resultOffset !== -1) {
  console.log(resultOffset + integerNVal);
} else {
  console.log(integerNVal + integerNVal);
}
