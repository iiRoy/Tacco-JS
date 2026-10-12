function main(lines) {
  for (var i = 0;; i++) {
    if (lines[i] == '0 0')
      break;
    
    var nums = lines[i].split(/\s+/);
    var h = parseInt(nums[0], 10);
    var w = parseInt(nums[1], 10);

    var cells = new Array(h);
    for (var y = 0; y < cells.length; y++) {
      cells[y] = new Array(h);
      for (var x = 0; x < cells[y].length; x++) {
        cells[y][x] = (x+y)%2 == 0 ? '#' : '.';
      }
      cells[y] = cells[y].join('') + '\n';
    }
    cells = cells.join('');

    console.log(cells);
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