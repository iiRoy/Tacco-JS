function main(input) {
  const args = input.split('\n');
  const items1 = args[0].split(' ').map(i => parseInt(i));
  const N = items1[0] + 1;
  const X = items1[1];
  const List = args[1].split(' ').map(i => parseInt(i));

  for (var i = 1; i <= N; i++) {
    var total = List.slice(0, i).reduce((x, y) => x + y);
    if (total >= X) {
      console.log(i);
      return;
    }
  }
  console.log(N - 1);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
