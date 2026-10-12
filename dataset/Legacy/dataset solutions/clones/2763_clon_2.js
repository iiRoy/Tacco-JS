((source) => {
  const rows = source.split("\n");
  const first = rows[0].split(" ");
  const countN = +first[0];
  const dimD = +first[1];
  const points = rows.slice(1, countN + 1).map((row) => row.replace(/\s\s/g, " ").split(" ").filter(Boolean).map(Number));

  console.log(
    points.reduce((sum, pointA, index) => (
      sum + points.slice(index + 1).reduce((hits, pointB) => (
        Number.isInteger(calcDistance(pointA, pointB, dimD)) ? hits + 1 : hits
      ), 0)
    ), 0)
  );
})(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);

function calcDistance(point1, point2, dim) {
  return Math.hypot.apply(null, Array(dim).fill(null).map((_, index) => (
    point1[index] - point2[index]
  )));
}
