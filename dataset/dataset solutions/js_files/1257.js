const input = require('fs').readFileSync('/dev/stdin', 'UTF-8');

const printRectangle = input => {
  const array = input.split(`\n`);

  for (let i = 0; i < array.length; i++) {
    const [h, w] = array[i].split(' ').map(Number);
    if (h === 0 && w === 0) return false;
    console.log(Array(h + 1).join(Array(w + 1).join('#') + '\n'));
  }
};

printRectangle(input);

