function Main(input) {
  var as = input.split('\n')[1].split(' ').map(function (i) {
    return parseInt(i);
  });
  var bs = input.split('\n')[2].split(' ').map(function (i) {
    return parseInt(i);
  });
  var cs = input.split('\n')[3].split(' ').map(function (i) {
    return parseInt(i);
  });

  var possibles = bs.map(function (b) {
    return as.filter(function (a) {
      return a < b;
    }).length;
  });
  console.log(possibles);

  var result = cs.map(function (c) {
    return bs.map(function (b, i) {
      return b < c ? possibles[i] : 0;
    }).reduce(function (p, a) {
      return p + a;
    });
  }).reduce(function (p, a) {
    return p + a;
  });
  console.log(result);
}

// この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
