function Main(input) {
	input = input.trim().split(" ");
  var mae = parseInt(input[0]);
  var ato = parseInt(input[2]);
  if(input[1] == "+"){
     console.log(mae + ato);
     }else{
     console.log(mae - ato);
     }
  
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
