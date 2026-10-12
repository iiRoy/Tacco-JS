/**
 * Created by hiroqn on 13/10/06.
 */
var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
function seqStr(n, c) {
  var j, res = '';
  for (j = n; j > 0; j--) {
    res += c;
  }
  return res;
}

function main() {
  var str = input[0],
      len = str.length,
      ans = '>++++++[<+++++>-]<[>+>+>+>++>++>++>+++>+++>+++>++++<<<<<<<<<<-]>',
      i, j, diff, sqr, sqr2,
      pmchar = '',
      prevList = [30, 30, 30, 60, 60, 60, 90, 90, 90, 120],
      pointer = 0,
      pointer2,
      N = 9,
      charCode;
  for (i = 0; i < len; i++) {
    charCode = str.charCodeAt(i);
    pointer2 = ~~((charCode - 33) / 11);
//    console.log(charCode,pointer2)
    ans += seqStr(Math.abs(pointer - pointer2), pointer < pointer2 ? '>' : '<');
    diff = charCode - prevList[pointer2];
    pmchar = diff > 0 ? '+' : '-';
    diff = Math.abs(diff);
//    console.log(prevList,diff,pointer2)
    ans += seqStr(diff, pmchar);
    prevList[pointer2] = charCode;
    ans += '.';
    pointer = pointer2;
  }
  console.log(ans);
}