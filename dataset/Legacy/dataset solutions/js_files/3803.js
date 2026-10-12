function myout(text){console.log(text);}//standard output
function Main(input) {
	//input = parseInt(input);
	//input = input.trim().split(" ");
	input = input.trim().split("\n");
	//input = input.trim().split(" ").map((a)=>Number(a));
	//input = input.trim().split("\n").map((a)=>Number(a));
  var N = parseInt(input[0]);
  var s = input[1];
  var wCount = 0;
  var wList = [];
  var eCount = 0;
  var eList = [];
  var output = 1000000;
  for(var i = 0; i < N; i++){
    var tmp = s.slice(i,i+1);
    if(tmp == "W"){
       wCount++;
    }else{
       eCount++; 
    }
    wList.push(wCount);
  }
  for(var i = 0; i < N; i++){
    var tmp = s.slice(i,i+1);
    if(tmp == "E"){
       eCount--;
    }
    eList.push(eCount);
  }
  for(var i = 0; i < N; i++){
    var tmp = s.slice(i,i+1);
    if(tmp == "W"){
       wList[i]--;
    }
    output = Math.min(output,wList[i] + eList[i]);
  }
  
  myout(output);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
