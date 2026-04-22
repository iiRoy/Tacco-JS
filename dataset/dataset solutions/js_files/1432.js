function main(lines) {
  var target    = lines[0];
  var wordCount = 0;
  for (var i = 1; i < lines.length; i++) {
    var words = lines[i].split(/\s+/);
    for (var wi = 0; wi < words.length; wi++) {
      if (words[wi] === target) {
        wordCount++;
      }
    }
  }
  console.log(wordCount);
}

var chunks = [];
process.stdin.on('data', function(chunk) {
  chunks.push(chunk)
});
process.stdin.on('end', function() {
  var lines = chunks.join('').split('\n');
  main(lines);
});