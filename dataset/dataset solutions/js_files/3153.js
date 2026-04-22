function main(input) {
  const args = input.split(' ');
  let A = Number(args[0]);
  let B = Number(args[1]);
  let K = Number(args[2]);
  let Arr = A < B ? [A, B] : [B, A];
  let cu = 0;
  let sum;
  let count = 0;
  for (cu = Arr[0]; cu > 0; --cu) {
    if (Number.isInteger(Arr[0] / cu) && Number.isInteger(Arr[1] / cu)) {
      count++;
      if (count === K) {
        sum = cu;
        break;
      }
    }
  }
  console.log(cu);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

