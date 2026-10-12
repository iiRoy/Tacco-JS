/**
 * Created by hiroqn on 13/10/06.
 */
var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
function main() {
  var str = input[0],
      ans = '',
      i, len, j, diff, sqr, pmchar,
      prev = 0,
      N = 160,
      charCodeList = [];
  for (i = 0, len = str.length; i < len; i++) {
    charCodeList[i] = str.charCodeAt(i);
  }
  for (i = 0; i < len; prev = charCodeList[i], i++) {
    diff = charCodeList[i] - prev;
    if (diff === 0) {
      ans += '.';
      continue;
    }
    pmchar = diff > 0 ? '+' : '-';
    diff = Math.abs(diff);
    if (diff < N) {

      for (j = diff; j > 0; j--) {
        ans += pmchar;
      }
    } else {
      sqr = ~~Math.sqrt(diff);
      ans += '>';
      for (j = sqr; j > 0; j--) {
        ans += '+';
      }
      ans += '[<';
      for (j = sqr; j > 0; j--) {
        ans += pmchar;
      }
      ans += '>-]<';
      for (j = diff - sqr * sqr; j > 0; j--) {
        ans += pmchar;
      }

    }
    ans += '.';
  }
  console.log(ans);
}