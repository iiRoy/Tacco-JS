function main(){

var seats = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var groupMembers = [2,5,2,2,2];
var eatTimes = [19,39,25,36,22,42];

var headGroup = -1;
var pastMinutes = 0;
var waitTime = [];

while(waitTime.length < 100){
  // たべおわる
  for(var i = 0; i < seats.length; i++){
    seats[i] = seats[i] == 0 ? 0 : seats[i] - 1;
  }

  // 来店
  if(headGroup == -1 && pastMinutes % 5 == 0){
    headGroup = pastMinutes / 5;
  }

  // ちゃくせき
  while(headGroup != -1){
    var needsSequencialSeats = groupMembers[headGroup % 5];
    var sequencialSeats = 0;
    var startIndex = -1;
    for(var i = 0; i < seats.length; i++){
      sequencialSeats = seats[i] == 0 ? sequencialSeats + 1 : 0;

      if(sequencialSeats == needsSequencialSeats){
        startIndex = i - (needsSequencialSeats - 1);
        break;
      }
    }

    if(startIndex != -1){
      // すわれたみたい
      waitTime[headGroup] = pastMinutes - (headGroup * 5);
      for(var i = startIndex; i < (needsSequencialSeats + startIndex); i++){
        seats[i] = eatTimes[headGroup % 6];
      }
      
      headGroup = (((headGroup + 1) * 5) <= pastMinutes) ? headGroup + 1 : -1;
    }else{
      // すわれなかったみたい
      break;
    }

  }

  pastMinutes++;

}

for(var i = 0; i < (input.length - 1); i++){
  console.log(waitTime[parseInt(input[i], 10)]);
}

}

var
input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main();
});