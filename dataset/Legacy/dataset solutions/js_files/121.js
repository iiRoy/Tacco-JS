(function(input) {
  var p = input.replace(/\n$/, '').split('\n');
  while (true) {
    var a = p.shift().split(' ').map(Number);
    var n = a.shift();
    var s = a.shift();
    if (n === 0 && s === 0) {
      return;
    }
    console.log(count(n, s));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function count(n, s) {
  return loop(0, n, s);
}

function loop(i, n, s) {
  var c = 0;
  for (var j = i; j < 10; j++) {
    s = s - j;
    if (n === 1) {
      if (s === 0) {
        c++;
      }
    } else {
      c += loop(j + 1, n - 1, s);
    }
  }
  return c;
}