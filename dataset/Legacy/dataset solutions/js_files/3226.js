function main(input) {
    var rows = input.split('\n');
    var pieceCount = rows[0].split(" ").map(Number)[0];
    var coordinates = rows[1].trim().split(" ").map(Number).sort((a, b) => a - b);
    var steps = [];
    coordinates.forEach((item, i) => {
        if (i > 0) {
        steps.push(item - coordinates[i-1])
      }
    })
    steps = steps.sort((a, b) => a - b).slice(0, steps.length - pieceCount + 1);
    console.log(steps.reduce((sum, cur) => sum+cur, 0))
  }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));