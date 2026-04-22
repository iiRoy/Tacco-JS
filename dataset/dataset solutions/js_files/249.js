var pass = 0;

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(input) {
  var result = input.match(/[0-9]+/g);
  for (var i in result) {
    pass += Number(result[i]);
  }
});
process.stdin.on('end', function() {
  console.log(pass);
});