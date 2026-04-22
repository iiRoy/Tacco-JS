function main(lines) {
  for (var i = 0;; i++) {
    if (lines[i] == '0')
      break;

    var digits = lines[i].split('').map(parseFloat);
    var sum = 0;
    for (var di = 0; di < digits.length; di++)
      sum += digits[di];

    console.log(sum);
  }
}

var chunks = [];
process.stdin.on('data', function(chunk) {
  chunks.push(chunk)
});
process.stdin.on('end', function() {
  var lines = chunks.join('').split('\n');
  main(lines);
});