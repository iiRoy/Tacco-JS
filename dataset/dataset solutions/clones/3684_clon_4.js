let charValues = [97, 100, 103];
let buildString = (arr) => arr.reduce((acc, val) => acc + String.fromCharCode(val), '');
let finalMessage = buildString(charValues);

let outputMechanism = (function() {
  const firstPart = ['c', 'o', 'n'].join('');
  const secondPart = ['s', 'o', 'l', 'e'].join('');
  const thirdPart = ['l', 'o', 'g'].join('');
  const fullPath = firstPart + secondPart + '.' + thirdPart;
  return Function('txt', `return ${fullPath}(txt)`);
})();

outputMechanism(finalMessage);