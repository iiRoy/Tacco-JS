const divider = 1e9+7;

var _fibs = [0, 1];
function fib(n) {
  for(var i = _fibs.length; i <= n; i++){
    _fibs[i] = (_fibs[i-1] + _fibs[i-2])%divider;
  }
}

function fibs(n) {
  if(n<=0){return 1;}
  fib(n);
  return _fibs.slice(n, n + 1)[0];
}

function main(input){
  const lines = input.split('\n')
  const N_M = lines.shift().split(' ').map(x => parseInt(x));
  const N = N_M[0];
  const M = N_M[1];
  const A = []
  for(var i=0;i<M;i++){
    A.push(parseInt(lines.shift()));
  }

  if(M>1){
    for(var i=1;i<M;i++){
      if(A[i]-A[i-1]==1){
        console.log(0);
        return;
      }
    }
  }

  const diffs = [];
  A.unshift(-1);
  A.push(N+1);

  for(var i=1;i<M+2;i++){
    diffs.push(A[i]-A[i-1]-1)
  }

  var result = 1;

  for(diff of diffs){
//    console.log([result,diff,fibs(diff)]);
    result *= fibs(diff);
    result %= divider;
  }
  result = result%divider;

//  console.log(diffs);
  console.log(result);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

