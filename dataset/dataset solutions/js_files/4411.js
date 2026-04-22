function myout(text){console.log(text);}//standard output
function Main(input) {
	//input = parseInt(input);
	//input = input.trim().split(" ");
	input = input.trim().split("\n");
	//input = input.trim().split(" ").map((a)=>Number(a));
	//input = input.trim().split("\n").map((a)=>Number(a));
  var N = parseInt(input[0]);
  var output = 1;
  for(var i = 0; i < N; i++){
    if(i % 3 == 0){
       output = (output * 3) % 1000000007;
    }else if(i % 3 == 1){
       output = (output * 2) % 1000000007;
    }
  }
  myout(output);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
