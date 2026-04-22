var reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var line;
reader.on('line', (l) => {
  line = l;
});

reader.on('close', () => {
  var elems = line.split(' ');
  var A = elems[1];
  var B = elems[2];
  var win = Math.abs(B - A - 1) % 2 ? 'Alice' : 'Bolis';
  console.log(win);
});