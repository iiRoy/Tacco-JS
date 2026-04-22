process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  var lines = chunk.split("\n");
  var n = lines[0] * 1;
  var name = lines[1];
  var i, j, len;
  
  var cnt = 0;
  for (i=2; i<=n; i++) {
    var chars = name.split('');
    var board = lines[i];
    var idx, prevIdx = 0, diff = 0, able = true;
    len = chars.length;
    for (j=0; j<len; j++) {
      idx = board.substr(prevIdx).indexOf(chars[j]);
      if (idx == -1) {
        able = false;
        break;
      }
      prevIdx = idx;
      prevDiff = diff;
    }
    if (able) {
      cnt++;
    }
  }
  console.log(cnt);
});