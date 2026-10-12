function main(input) {
  const lines = input.split('\n');
  lines.forEach(line => {
    if (line.length === 0) {
      return;
    }
    const vs = line.split(' ');
    console.log(flow(
      parseInt(vs[0], 10),
      parseInt(vs[1], 10),
      parseInt(vs[2], 10),
      parseInt(vs[3], 10)
    ));
  });
}

function flow(a, b, c, d) {
  return (b - a + 1) - count(a, b, c) - count(a, b, d) + count(a, b, c*d);
}

function count(min, max, devide) {
  const total = Math.floor(max / devide);
  const diff = Math.floor((min -1) / devide);
  return total - diff;
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
