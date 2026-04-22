var input = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(input);
var list = input.split(' ');

var output = () => {
  if (list[0] === 2 || list[1] === 2) {
    return 'No';
  }

  return 'Yes';
};

console.log(output());
