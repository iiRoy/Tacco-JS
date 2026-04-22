const main = (arg) => {
  const lines = arg.trim().split('\n');
  const [N, i] = lines[0].split(' ').map(Number);
  console.log(N - i + 1);
};
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
