function main(lines) {
  var nums = lines[0].split(/\s+/);
  var a   = parseFloat(nums[0]);
  var b   = parseFloat(nums[1]);
  var deg = parseFloat(nums[2]);

  var rad = deg * Math.PI / 180;
  var c   = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2) - 2*a*b*Math.cos(rad));

  var area      = a*b*Math.sin(rad) / 2.0;
  var perimeter = a + b + c;
  var h         = 2*area / a;
  console.log([
    area.toFixed(6),
    perimeter.toFixed(6),
    h.toFixed(6),
  ].join(' '));
}

var chunks = [];
process.stdin.on('data', function(chunk) {
  chunks.push(chunk)
});
process.stdin.on('end', function() {
  var lines = chunks.join('').split('\n');
  main(lines);
});