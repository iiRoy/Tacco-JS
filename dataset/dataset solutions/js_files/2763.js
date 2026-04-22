((input) => {
  const data = input.split('\n');
  const line1 = data[0].split(' ');
  const N = +line1[0];
  const D = +line1[1];
  const coords = data.slice(1, N + 1).map((line) => line.replace(/\s\s/g, ' ').split(' ').filter(Boolean).map(Number));

  console.log(
    coords.reduce((total, coord1, i) => (
      total + coords.slice(i + 1).reduce((count, coord2) => (
        Number.isInteger(distance(coord1, coord2, D)) ? count + 1 : count
      ), 0)
    ), 0)
  );
})(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

function distance(coords1, coords2, D) {
  return Math.hypot.apply(null, Array(D).fill(null).map((_, i) => (
    coords1[i] - coords2[i]
  )));
}
