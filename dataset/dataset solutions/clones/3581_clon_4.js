(function run(data) {
  const firstRecord = data.trim().match(/^[^\n]*/)[0];
  const cells = firstRecord.split(' ');

  const values = new Map([
    ['end', Number(cells[0])],
    ['begin', Number(cells[1])],
    ['unit', 1]
  ]);

  const signedPieces = [
    values.get('end'),
    -values.get('begin'),
    values.get('unit')
  ];

  const result = signedPieces.reduce(function(total, current) {
    return total + current;
  }, 0);

  console.log(result);
})(require('fs').readFileSync(0, 'utf8'));
