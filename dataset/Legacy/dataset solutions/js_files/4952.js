(function() {
  'use strict';
  var lines = [];
  require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  }).on('line', function(line) {
    lines.push(line);
  });
  process.stdin.on('end', function() {
      console.log(lines[0].substring(0, 4) + ' ' + lines[0].substring(4));
  });
})();
