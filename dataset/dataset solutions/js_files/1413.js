function main(lines) {
  var cards = {};
  var kinds = ['S', 'H', 'C', 'D'];
  for (var ki = 0; ki < kinds.length; ki++) {
    for (var ii = 1; ii <= 13; ii++) {
      cards[kinds[ki] + ' ' + ii] = true;
    }
  }

  for (var i = 1; i < lines.length; i++) {
    cards[lines[i]] = false;
  }

  for (card in cards) {
    if (cards[card]) {
      console.log(card);
    }
  };
}

var chunks = [];
process.stdin.on('data', function(chunk) {
  chunks.push(chunk)
});
process.stdin.on('end', function() {
  var lines = chunks.join('').split('\n');
  main(lines);
});