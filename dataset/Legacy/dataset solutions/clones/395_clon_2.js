// input reader
var io = require("fs"),
size = io.fstatSync(process.stdin.fd).size,
buf = new Buffer(size),
count = io.readSync(process.stdin.fd, buf, 0, size, 0),
rows = buf.toString("utf8", 0, count).split("\n");
run();

function run(){
  var waits = build();
  for(var idx = 0, total = rows.length - 1; idx < total;idx++){
    console.log(waits[parseInt(rows[idx], 10)]);
  }
}

function build(){
  var chairs = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var parties = [2,5,2,2,2];
  var durations = [19,39,25,36,22,42];
  
  var front = -1;
  var minute = 0;
  var waits = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var remaining = 100;
  
  while(true){
    // finish eating
    var pos;
    for(pos = 17; pos--;){
      chairs[pos] = larger(--chairs[pos], 0);
    }
    
    // arrival
    if(front == -1 && minute % 5 == 0){
      front = minute / 5;
    }
    
    // seating
    while(front != -1 && pos != 17){
      var needed = parties[front % 5];
      var consecutive = 0;
      var start = -1;
      
      for(pos = 0; pos < chairs.length; pos++){
        consecutive = chairs[pos] == 0 ? consecutive + 1 : 0;
        
        if(consecutive == needed){
          start = pos - (needed - 1);
          // can sit
          waits[front] = minute - (front * 5);
          for(var next = start; next < (needed + start); next++){
            chairs[next] = durations[front % 6];
          }
          
          front = (((front + 1) * 5) <= minute) ? front + 1 : -1;
          if(!(--remaining)){
            // 100 groups seated
            return waits;
          }
          break;
        }
      }
    }
    
    minute++;
  }
  
}

function larger(left, right){
  var diff = (left - right);
  return left - (diff & (diff >> 31));
}
