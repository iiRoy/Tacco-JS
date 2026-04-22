(function(stdin) {
  var lines = stdin.trim().split('\n');
  while (1) {
    var line = lines.shift();
    if (line == '0') {
      break;
    }
    var n = Number(line);
    var jewels = {};
    for (var i = 0; i < n; i++) {
      jewels[lines.shift().trim()] = 1;
    }
    var m = Number(lines.shift().trim());
    var x = 10, y = 10;
    var dirStep = {'N': [0, 1], 'S': [0, -1], 'E': [1, 0], 'W': [-1, 0]};
    var found = 0;
    for (var j = 0; j < m; j++) {
      var ops = lines.shift().trim().split(' ');
      var dir = ops[0];
      var steps = Number(ops[1]);
      for (var s = 0; s < steps; s++) {
        x += dirStep[dir][0];
        y += dirStep[dir][1];
        var key = [x, y].join(' ');
        if (jewels[key]) {
          found += 1;
          jewels[key] = 0;
        }
      }
    }
    console.log(found == m ? 'Yes' : 'No');
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));