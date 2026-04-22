const _systemIO = require('fs');
const _inputContent = _systemIO.readFileSync(0, 'utf8');

const _stringToNumber = (inputString) => parseInt(inputString, 10);
const _outputResult = (messageContent) => process.stdout.write(messageContent + '\n');

const _valueStrings = _inputContent.trim().split(/\s+/);
const _numericQuantities = _valueStrings.map(_stringToNumber);

const _sourceOrder = _numericQuantities;
const _sortedOrder = [..._numericQuantities].sort((firstValue, secondValue) => firstValue - secondValue);

const _isNonDecreasing = (
  _sourceOrder[0] === _sortedOrder[0] &&
  _sourceOrder[1] === _sortedOrder[1] &&
  _sourceOrder[2] === _sortedOrder[2]
);

const _areAllUnique = new Set(_sourceOrder).size === 3;

if (_isNonDecreasing && _areAllUnique) {
  _outputResult('Yes');
} else {
  _outputResult('No');
}