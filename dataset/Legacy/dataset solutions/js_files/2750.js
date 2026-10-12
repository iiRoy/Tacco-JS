function myOut(text){console.log(text);}//standard output
function Main(input) {
	input = input.trim();
	//input = input.split(" ");
	input = input.split("\n");
	//input = input.split(" ").map((a)=>Number(a));
	//input = input.split("\n").map((a)=>Number(a));
  var N = parseInt(input[0].split(" ")[0]);
  var M = parseInt(input[0].split(" ")[1]);
  input.shift();
  var list = {};
  for(var i = 1; i <= N; i++){
    list[i] = [];
  }
  for(var i = 0; i < M; i++){
    var tmp1 = input[i].split(" ")[0];
    var tmp2 = input[i].split(" ")[1];
    list[tmp1].push(tmp2);
    list[tmp2].push(tmp1);
  }
  for(var i = 1; i <= N; i++){
    if(list[i].length % 2 == 1){
       console.log("-1");
      return;
    }
  }
  for(var i = 1; i <= M; i++){
    
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
