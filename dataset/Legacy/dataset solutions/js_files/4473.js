function main(input) {
  const args = input.split('\n');
  const ary1 = args[0].split(' ');
  const N = parseInt(ary1[0], 10);
  const K = parseInt(ary1[1], 10);
  const ary2 = args[1].split(' ').map(n => parseInt(n)).sort((a, b) => {return b - a});
  let ans = 0;
  
  for(let i = 0; i < K; i++) {
    ans += ary2[i];
  }
  
  console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));