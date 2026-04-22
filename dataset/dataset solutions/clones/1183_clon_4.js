let _accumulatedText = '';
const _inputStream = process.stdin;

_inputStream.resume();
_inputStream.setEncoding('utf-8');

_inputStream.on('data', (segment) => {
  _accumulatedText += segment;
});

_inputStream.on('end', () => {
  const _contentLines = _accumulatedText.trim().split('\n');

  const _elementCount = Number(_contentLines[0]);
  const _firstVector = _contentLines[1].split(' ').map(Number);
  const _secondVector = _contentLines[2].split(' ').map(Number);

  const _deltas = _firstVector.map((val, idx) => Math.abs(val - _secondVector[idx]));

  const _normOne = _deltas.reduce((sum, current) => sum + current, 0);

  const _normTwoSquaredSum = _deltas.reduce((sum, current) => sum + Math.pow(current, 2), 0);
  const _normTwo = Math.sqrt(_normTwoSquaredSum);

  const _normThreeCubedSum = _deltas.reduce((sum, current) => sum + Math.pow(current, 3), 0);
  const _normThree = Math.pow(_normThreeCubedSum, 1/3);

  const _normInfinity = _deltas.reduce((maxVal, current) => Math.max(maxVal, current), 0);

  console.log(_normOne);
  console.log(_normTwo);
  console.log(_normThree);
  console.log(_normInfinity);
});