function Main(input) {
	input = input.trim().split("");
  if(input.length == 3){
    var tmp = input[0]; 
    input[0] = input[2];
    input[2] = tmp;
     }
  console.log(input.join(""));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
