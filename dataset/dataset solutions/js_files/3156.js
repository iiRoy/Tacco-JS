function main(input) {
  const args = input.split(' ');
  const A = Number(args[0]);
  const B = Number(args[1]);
  const K = Number(args[2]);
  const [min, max] = A < B ? [A, B] : [B, A];
  const result = Array.from(Array(min), (v, i) => i + 1).reduce((sum, cu) => {
    if (Number.isInteger(min / cu) && Number.isInteger(max / cu)) {
      return [...sum, cu];
    }
    return sum;
  }, []);
  console.log(result.splice(result.length - K, 1)[0]);
}