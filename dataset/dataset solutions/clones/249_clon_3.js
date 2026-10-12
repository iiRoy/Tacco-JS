var total = 0;
var chunks = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(input) {
  chunks.push(input);
});

process.stdin.on('end', function() {
  var text = chunks.join('');
  var result = text.match(/[0-9]+/g) || [];

  for (var i = 0; i < result.length; i++) {
    var value = Number(result[i]);
    if (!isNaN(value)) {
      total += value;
    }
  }

  console.log(total);
});