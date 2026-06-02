function center (arr) {
  return arr.sort()[Math.floor(arr.length / 2)]
}

function Solve(source) {
  source = source.split('\n')
  count = parseInt(source[0])
  values = source[1].split(' ')
  mids = []

  for (var x = 0 ; x < count ; x++ ) {
    for (var y = x + 1 ; y < count + 1 ; y++ ) {
      mids.push(center(values.slice(x, y)))
    }
  }
  console.log(center(mids))
}

Solve(require('fs').readFileSync('/dev/stdin', 'utf8'));
