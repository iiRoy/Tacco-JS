function main(lines) {
  var nums = lines[0].split(/\s+/);
  var x1 = parseFloat(nums[0]);
  var y1 = parseFloat(nums[1]);
  var x2 = parseFloat(nums[2]);
  var y2 = parseFloat(nums[3]);

  var distance = Math.sqrt(Math.abs(x2-x1) + Math.abs(y2-y1));
  console.log(distance.toFixed(6));
}

function shuffle(cards, h) {
  return cards.substr(h, cards.length-h) + cards.substr(0, h);
}

var chunks = [];
process.stdin.on('data', function(chunk) {
  chunks.push(chunk)
});
process.stdin.on('end', function() {
  var lines = chunks.join('').split('\n');
  main(lines);
});