function main(lines) {
  var stack = [];
  for (var i = 0;; i++) {
    var operation = lines[i];
    if (operation.match(/^quit/)) {
      break;
    } else if (operation.match(/^push/)) {
      var block = operation.split(/\s+/)[1];
      stack.push(block);
    } else if (operation.match(/^pop/)) {
      var block = stack.pop();
      console.log(block);
    }
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