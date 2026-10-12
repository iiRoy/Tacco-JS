function myout(text){console.log(text);}//standard output
function Main(input) {
	//input = parseInt(input);
	//input = input.split(" ");
	input = input.split("\n");
	//input = input.split(" ").map((a)=>Number(a));
	//input = input.split("\n").map((a)=>Number(a));
  var output = "";
  for(var i = 0; i < input[0].length; i++){
    output += input[0].slice(i,i+1) + input[1].slice(i,i+1);
  }
  myout(output);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());