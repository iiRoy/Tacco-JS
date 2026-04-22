(function(input) {
  var p = input.replace(/\n$/, '').split('\n');
  var n = p.shift();
  while (p.length > 0) {
    var n1 = p.shift();
    var n2 = p.shift();
    var n = sum(n1, n2);
    if (n.length >= 80) {
      console.log('overflow');
      continue;
    }
    console.log('%s', n);
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function sum(n1, n2) {
  var a, b;
  if (n1.length > n2.length) {
    a = n1.split('').map(Number).reverse();
    b = n2.split('').map(Number).reverse();
  } else {
    b = n1.split('').map(Number).reverse();
    a = n2.split('').map(Number).reverse();
  }

  for (var i = 0; i < b.length; i++) {
    a[i] += b[i];
  }

  for (var i = 0; i < a.length - 1; i++) {
    if (a[i] >= 10) {
      var m = Math.floor(a[i] / 10);
      a[i] = a[i] % 10;
      a[i + 1] += m;
    }
  }

  return a.reverse().join('');
}