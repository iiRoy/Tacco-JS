var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

var line;
while (line = lines.shift()) {
  var cnt = 0;
  var num = +line;
  console.log(line);
  console.log(num);
  for (var i1 = 0; i1 < 9; i1++) {
    for (var i2 = 0; i2 < 9; i2++) {
      for (var i3 = 0; i3 < 9; i3++) {
        for (var i4 = 0; i4 < 9; i4++) {
          if (i1 + i2 + i3 + i4 == num)
              cnt++;
        }
      }
    }
  }
  console.log(cnt)
}