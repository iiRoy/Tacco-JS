function main(lines) {
  var charCounts = {};
  for (var code = 'a'.charCodeAt(0); code <= 'z'.charCodeAt(0); code++) {
    charCounts[String.fromCharCode(code)] = 0;
  }

  for (var i = 0; i < lines.length; i++) {
    var chars = lines[i].toLowerCase()
    for (var li = 0; li <= chars.length; li++) {
      charCounts[chars[li]]++;
    }
  }

  for (var code = 'a'.charCodeAt(0); code <= 'z'.charCodeAt(0); code++) {
    var char = String.fromCharCode(code);
    console.log(char + ' : ' + charCounts[char]);
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