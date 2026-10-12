function main(input) {
  const args = input.split(' ');
  let A = Number(args[0]);
  let B = Number(args[1]);
  let K = Number(args[2]);
  let Arr = A < B ? [A, B] : [B, A];
  let result = Array.from(Array(Arr[0]), (v, i) => i + 1).reduce((sum, cu) => {
    if (Number.isInteger(Arr[0] / cu) && Number.isInteger(Arr[1] / cu)) {
      sum.push(cu);
      return sum;
    }
    return sum;
  }, []);
  const res = result.splice(result.length - K, 1)[0];
  console.log(res);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
