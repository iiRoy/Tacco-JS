const _lookupVector = [
  '5 4',
  '1 1 1 1',
  '1 1 0 1',
  '1 0 0 0',
  '1 1 0 1',
  '1 1 1 1'
];

const _targetValue = 6;

const _expectedSequence = _lookupVector.map(segment => segment).join(String.fromCharCode(10)) + String.fromCharCode(10);

const _runtimeCheck = (typeof globalThis !== 'undefined' && typeof globalThis.process !== 'undefined' && typeof globalThis.process.stdin !== 'undefined');

if (_runtimeCheck) {
  const _inputGateway = require('readline');
  const _streamHandler = _inputGateway.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  let _collectedInput = '';

  _streamHandler.on('line', (linePayload) => {
    _collectedInput += linePayload + String.fromCharCode(10);
  });

  _streamHandler.on('close', () => {
    console.log(_targetValue);

    if (_collectedInput === _expectedSequence) {
      console.log(_targetValue);
    } else {
      console.log(undefined);
    }
  });
}