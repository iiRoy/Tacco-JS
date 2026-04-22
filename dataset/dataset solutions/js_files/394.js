// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
 
function main(){
  var waitTime = calc();
  for(var i = 0, len = input.length - 1; i < len;i++){
    console.log(waitTime[parseInt(input[i], 10)]);
  }
}
 
function calc(){
  var seats = new Int32Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
  var groupMembers = new Int32Array([2,5,2,2,2]);
  var eatTimes = new Int32Array([19,39,25,36,22,42]);
   
  var headGroup = -1;
  var pastMinutes = 0;
  var waitTime = new Int32Array(100);
  var lastMembers = 100;
   
  while(true){
    // たべおわる
    var i;
    for(i = 17; i--;){
      seats[i] = max(--seats[i], 0);
    }
     
    // 来店
    if(headGroup == -1 && pastMinutes % 5 == 0){
      headGroup = pastMinutes / 5;
    }
     
    // ちゃくせき
    while(headGroup != -1 && i != 17){
      var needsSequencialSeats = groupMembers[headGroup % 5];
      var sequencialSeats = 0;
      var startIndex = -1;
       
      for(i = 0; i < 17; i++){
        sequencialSeats = seats[i] == 0 ? sequencialSeats + 1 : 0;
         
        if(sequencialSeats == needsSequencialSeats){
          var eatTime = eatTimes[headGroup % 6];
 
          startIndex = i - (needsSequencialSeats - 1);
          // すわれるみたい
          waitTime[headGroup] = pastMinutes - (headGroup * 5);
          for(var j = startIndex, len = (needsSequencialSeats + startIndex); j < len; j++){
            seats[j] = eatTime;
          }
           
          headGroup = (((headGroup + 1) * 5) <= pastMinutes) ? headGroup + 1 : -1;
          if(!(--lastMembers)){
            // 100グループ着席
            return waitTime;
          }
          break;
        }
      }
    }
     
    pastMinutes++;
  }
   
}
 
function max(a, b){
  var t = (a - b);
  return a - (t & (t >> 31));
}