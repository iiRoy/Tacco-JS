/**
 * Created by hiroqn on 13/10/08.
 */
/**
 * Created by hiroqn on 13/10/07.
 */
var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
function transTime(t){
  var temp = t.split(':');
  return +temp[0] * 60 + +temp[1];
}
function main() {
  var temp = input[0].split(' '),
      n = +temp[0],
      t = +temp[1];
  temp = input[1].split(' ');
  var time1 = transTime(temp[0]),
      sta1 = temp[1],
      time2 = transTime(temp[2]),
      sta2 = temp[3],
      ans = [];
  for (var i = 2; i <= n; i++) {
    temp = input[i].split(' ');
    time1 =  transTime(temp[0]);
    if(t <= time1 - time2){
      ans.push([sta2, time1 - time2]);
    }
    sta1 = temp[1];
    time2 = transTime(temp[2]);
    sta2 = temp[3];
//    console.log(time1,sta1,time2,sta2)
  }
  console.log(ans.length);
  for(i=0;i<ans.length;i++){
    console.log(ans[i][0] + ' ' + ans[i][1])
  }
}