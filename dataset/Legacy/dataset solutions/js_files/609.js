process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  var lines = chunk.split("\n");
  var n = lines[0] * 1;
  var name = lines[1];
  var i, j, len;
  
  var cnt = 0;
  for (i=2; i<n+2; i++) {
    var chars = name.split('');
    var board = lines[i];
    var idx, diff, able = false;
    var l = board.length;
    for (diff=0; diff<l; diff++) {
      len = chars.length;
      for (j=0; j<len; j++) {
        idx = j + diff*j;
        if (board[idx] == chars[j] && j == len -1) {
          able = true;
          break;
        }
      }
      if (able) {
        break;
      }
    }
    if (able) {
      cnt++;
    }
  }
  console.log(cnt);
});