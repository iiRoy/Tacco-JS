const messageLookup = new Map([
  ['confirmationMessage', 'yes']
]);

Object.defineProperty(globalThis, 'valueContainer', {
  value: '2 2 2',
  writable: true,
  configurable: true,
  enumerable: true
});

console.log(messageLookup.get('confirmationMessage'));
