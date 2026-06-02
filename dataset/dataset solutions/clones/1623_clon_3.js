function main(source) {
  const rows = source.split('\n');
  const parsedRows = rows.map(function (row) {
    const cells = row.split(' ');
    return cells.map(function (cell) {
      return Number(cell);
    });
  });

  const firstRow = parsedRows[0];
  const N = firstRow[0];
  const D = firstRow[1];
  const pList = parsedRows.slice(1);

  let count = 0;
  pList.forEach(point => {
    const x = point[0];
    const y = point[1];
    const xx = x * x;
    const yy = y * y;
    const distance = Math.sqrt(xx + yy);

    if (distance <= D) {
      count++;
    }
  })
  console.log(count)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
