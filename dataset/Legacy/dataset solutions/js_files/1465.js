function main(lines) {
  var score_a = 0;
  var score_b = 0;

  var i = 0;
  var noGemes = parseInt(lines[i++], 10);
  for (var gi = 0; gi < noGemes; gi++) {
    var cards = lines[i++].split(/\s+/);
    if (cards[0] === cards[1]) {
      score_a += 1;
      score_b += 1;
    } else if (cards[0] > cards[1]) {
      score_a += 3;
    } else if (cards[0] < cards[1]) {
      score_b += 3;
    }
  }
  console.log(score_a, score_b);
}

var chunks = [];
process.stdin.on('data', function(chunk) {
  chunks.push(chunk)
});
process.stdin.on('end', function() {
  var lines = chunks.join('').split('\n');
  main(lines);
});