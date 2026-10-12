var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');

function solve(G, i, use) {
  if(use.length === G.length) {
    return ~G[use[use.length - 1]].indexOf(use[0]);
  }
  for(var j=0;j<G[i].length;j++) {
    if(~use.indexOf(G[i][j])) {
      continue;
    }
    if(solve(G, G[i][j], use.concat(G[i][j]))) {
      return true;
    }
  }
  return false;
}

!function () {
  var N,
    arr,
    G,
    str,
    ch,
    i,j;
  while(input[0]!=='0') {
    N = input.shift() - 0;
    arr = [];
    G = [];
    for(i=0;i<N;i++) {
      arr.push(input.shift());
    }
    for(i=0;i<N;i++) {
      str = arr[i];
      ch = str[str.length - 1];
      G[i] = [];
      for(j=0;j<N;j++) {
        if(i === j) {
          continue;
        }
        if(ch === arr[j][0]) {
          G[i].push(j);
        }
      }
    }
    console.log(solve(G, 0, [0]) ? 'OK' : 'NG');
  }
}();