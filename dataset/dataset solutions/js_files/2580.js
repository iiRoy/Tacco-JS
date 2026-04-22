main = input => {
  input = input.split('\n').map(x => x.split(' ')).map(x => x.map(parseFloat));
  var N = input[0];
  var B = input[1];
  
  B = [B[0]].concat(B).concat(B.slice(-1));
  
  var A = 0;
  
  B.reduce((N,nextToN) => {
    A += Math.min(N,nextToN);
    return nextToN;
  });
  process.stdout.write(A);
}

main(require('fs').readFileSync('/dev/stdin','utf8'));