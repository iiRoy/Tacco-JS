function main(input) {
  const args = input.split('\n');
  const N = parseInt(args[0], 10);
  let ary = args[1].split(' ').map(n => parseInt(n, 10));
  let count = 0;
  let ans = 0;
  
  ary = ary.sort((a, b) => a - b);
  
  if (N === 1) {
  	ans = ary[1];
  } else {
    for(let i = N; i <= ((2 * N) - 1); i++) {
	  ans += ary[i];
    }
  }
  
  console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));