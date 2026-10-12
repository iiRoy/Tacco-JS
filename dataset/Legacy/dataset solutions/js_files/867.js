/**
 * Created by hiroqn on 13/10/07.
 */
var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
function matrix(n, m, init) {
  var arr = [], i, j;
  for (i = 0; i < n; i++) {
    arr[i] = [];
    for (j = 0; j < m; j++) {
      arr[i][j] = init;
    }
  }
  return arr;
}

function solve(melody, phraseList) {
  var n = phraseList.length,
      dp = matrix(n + 1, melody + 1, 0),
      i, j, k,
      s, l, p,
      range;
  for (i = 0; i < n; i++) {
    for (j = 0; j <= melody; j++) {
      s = phraseList[i][0];
      l = phraseList[i][1];
      p = phraseList[i][2];
      if (s <= j) {
//        console.log(i,j)
        range = dp[i + 1].slice(l > j ? 0: j - l, j - s + 1)
        dp[i + 1][j] = Math.max(dp[i][j], Math.max.apply(null, range) + p);
      } else {
        dp[i + 1][j] = dp[i][j];
      }

    }
  }
//  console.log(dp);
  return dp[n][melody];
}
function main() {

  var n = input.shift() - 0,
      phraseList = [];
  while (n--) {
    phraseList.push(input.shift().split(' ').map(Number));
  }
  n = phraseList.length;
  phraseList.sort(function (a, b) {
    return a[2] - b[2];
  });
//  console.log(phraseList)
  var m = input.shift() - 0,
      melodyList = [],
      melody,
      ans = [],
      i, j, k,
      max,
      flag0 = false;
  while (m--) {
    melodyList.push(input.shift() - 0);
  }
  m = melodyList.length;
  for (i = 0; i < m; i++) {

    melody = melodyList[i];
    max = solve(melody, phraseList);
//    console.log(max)
    if (max === 0) {
      flag0 = true;
    } else {
      ans.push(max);
    }
  }
  if(flag0){
    console.log(-1);
    return;
  }
  ans.forEach(function(i){console.log(i)});

}