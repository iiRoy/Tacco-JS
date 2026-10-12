function main(lines) {
  for (var i = 0;;) {
    var noItems = parseInt(lines[i++], 10);
    if (noItems === 0)
      break;
 
    var items    = lines[i++].split(/\s+/).map(parseFloat);
    var average  = items.reduce(function(sum, n){ return sum + n }, 0) / items.length;
    var variance = items.reduce(function(sum, n){ return sum + Math.pow(n-average, 2)}, 0) / items.length;
    var standarddeviation = Math.sqrt(variance);
    console.log(standarddeviation.toFixed(6));
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