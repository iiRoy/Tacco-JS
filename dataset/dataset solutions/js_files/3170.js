function myout(text){console.log(text);}//standard output
function Main(input) {
	//input = parseInt(input);
	//input = input.trim().split(" ");
	input = input.trim().split("\n");
	//input = input.trim().split(" ").map((a)=>Number(a));
	//input = input.trim().split("\n").map((a)=>Number(a));
  var N = parseInt(input[0]);
  var output = 0;
  for(var i = 1; i <= N; i++){
    var tmp = input[i].split(" ");
    if(tmp[1] == "JPY"){
       output += parseInt(tmp[0]);
    }else{
       output += parseFloat(tmp[0]) * 380000;
       }
  }
  myout(output);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
