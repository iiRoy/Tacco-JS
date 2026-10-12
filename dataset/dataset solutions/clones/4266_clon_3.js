function Main(input) {
  var lines = input.trim().split('\n');

  var as = lines[1].split(' ').map(function (i) {
    return parseInt(i, 10);
  });
  var bs = lines[2].split(' ').map(function (i) {
    return parseInt(i, 10);
  });
  var cs = lines[3].split(' ').map(function (i) {
    return parseInt(i, 10);
  });

  var possibles = [];

  for (var i = 0; i < bs.length; i++) {
    var b = bs[i];
    var count = as.filter(function (a) {
      if (a < b) {
        return true;
      }
      return false;
    }).length;
    possibles.push(count);
  }

  console.log(possibles);

  var result = cs.map(function (c) {
    var subtotal = bs.map(function (b, i) {
      if (b < c) {
        return possibles[i];
      }
      return 0;
    }).reduce(function (p, a) {
      return p + a;
    }, 0);

    return subtotal;
  }).reduce(function (p, a) {
    return p + a;
  }, 0);

  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));