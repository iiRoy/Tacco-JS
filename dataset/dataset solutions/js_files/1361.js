process.stdin.on('data', function(line) {
  console.log(line.split(' ').sort(function(a, b) {
    return a - b;
  }).join(' '));
});