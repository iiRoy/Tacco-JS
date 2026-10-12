function main (input) {
  const args = input.split(" ");
  const A = args[0],
        op = args[1],
        B = args[2];
  
  if (op === "+")
    console.log(A + B);
  else
    console.log(A - B);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
