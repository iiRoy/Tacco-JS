var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');

function solve(G, i, use) {
  for(var j=0;j<G[i].length;j++) {
    if(~use.indexOf(G[i][j])) {
      return true;
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
    min,
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
    for(i=0;i<N;i++) {
      if(solve(G, i, [i])) {
        break;
      }
    }
    console.log(i !== N ? 'OK' : 'NG');
  }
}();