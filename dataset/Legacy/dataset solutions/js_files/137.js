(function(input) {
  var p = input.replace(/\n$/, '').split('\n');
  var n = p.length;
  for (var i = 0; i < n; i++) {
    var a = p.shift().split(',').map(Number);
    var v2 = a.pop();
    var v1 = a.pop();
    console.log(cross(a, v1, v2));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function cross(a, v1, v2) {
  var l = [];
  for (var i = 0; i < a.length; i++) {
    l[i] = a[i];
    if (i > 0) {
      l[i] += l[i - 1];
    }
  }
  var x = l[l.length - 1] * v1 / (v1 + v2);
  //console.log(l, x);
  var c = 1;
  for (i = 0; i < l.length; i++) {
    if (x > l[i]) {
      c = i + 2;
      continue;
    }
    return c;
  }
}