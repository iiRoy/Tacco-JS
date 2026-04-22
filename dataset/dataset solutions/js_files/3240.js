
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

var list = input.split('\n');

var n = Number(list[0]);

var a = list[1].split('');

var b = list[2].split('');

var c = list[3].split('');

var num = 0;

var getIndex = (i)  => {
  if (a[i] === b[i] || b[i] === c[i] || c[i] === a[i]) {
    return true;
  }
  return false;
}

for (var j = 0; j < n; j++) {
  if (!getIndex(j)) {
    num += 2;
  } else if (a[j] === b[j] && b[j] === c[j]) {
  } else {
    num += 1;
  }
}

console.log(num);
