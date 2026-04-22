function main(lines) {
  var nums = lines[0].split(/\s+/);
  var a = parseInt(nums[0], 10);
  var b = parseInt(nums[1], 10);

  if (a == b)
    console.log('a == b');
  else if (a < b)
    console.log('a < b');
  else if (a > b)
    console.log('a > b');
}

var chunks = [];
process.stdin.on('data', function(chunk) {
  chunks.push(chunk)
});
process.stdin.on('end', function() {
  var lines = chunks.join('').split('\n');
  main(lines);
});