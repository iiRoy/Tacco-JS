(function(input) {
  var p = input.replace(/\n$/, '').split('\n').map(Number);
  var s = - Infinity;
  var m = - Infinity;
  while (true) {
    var n = p.shift();
    if (n === 0) {
      break;
    }
    s = - Infinity;
    m = - Infinity;
    for (var i = 0; i < n; i++) {
      var a = p.shift();
      if (a > s + a) {
        s = a;
      } else {
        s = s + a;
      }
      if (s > m) {
        m = s;
      }
    }
    console.log(m);
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));