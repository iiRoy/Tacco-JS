var source = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
  source += chunk;
});
process.stdin.on('end', function () {
  solve(source.split('\n'));
});

function solve(lines) {
  var visited = new Set();
  var cursor = 10 + 10 * 21;
  var lastStride;

  while (true) {
    var count = +lines.shift();
    if (count === 0) {
      break;
    }

    var targets = new Set();
    for (var g = 0; g < count; g++) {
      var gem = lines.shift().split(' ');
      var cell = (+gem[0]) + 21 * (+gem[1]);
      if (cell >= 0 && cell < 21 * 21 && cell === Math.floor(cell)) {
        targets.add(cell);
      }
    }

    var moveCount = +lines.shift();
    for (var m = 0; m < moveCount; m++) {
      var item = lines.shift().split(' ');
      switch (item[0]) {
        case 'N':
          lastStride = 21;
          break;
        case 'W':
          lastStride = -1;
          break;
        case 'E':
          lastStride = 1;
          break;
        case 'S':
          lastStride = -21;
          break;
      }

      for (var step = 0; step < +item[1]; step++) {
        cursor += lastStride;
        if (cursor >= 0 && cursor < 21 * 21 && cursor === Math.floor(cursor)) {
          visited.add(cursor);
        }
      }
    }

    var ok = true;
    targets.forEach(function (cell) {
      if (!visited.has(cell)) {
        ok = false;
      }
    });
    console.log(ok ? 'Yes' : 'No');
  }
}
