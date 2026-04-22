function main(input) {
  const args = input.split(' ');
  let a = parseInt(args[0], 10);
  let b = parseInt(args[1], 10);
  let c = parseInt(args[2], 10);

  [a,b] = [b,a];
  [a,c] = [c,a];

  console.log(`${a} ${b} ${c}`)

}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
