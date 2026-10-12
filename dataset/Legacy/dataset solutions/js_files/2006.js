const Main = input => {
  const input_sp = input.split(' ').map(e => BigInt(e));
  const N = input_sp[0]; const K = input_sp[1];

  let x_prev = N;
  let x = N;
  let result;
  while(true) {
    x = x_prev - K;
    x = x > 0 ? x : -1n*x;
    console.log(`${x_prev}\n${x}`);
    if(x === K) {
      result = 0;
      break;
    }
    if(x < K) {
      if(x < K / 2n) {
        result = x;
        break;
      }
    }
    x_prev = x;
  }

  console.log(Number(result));
};

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
