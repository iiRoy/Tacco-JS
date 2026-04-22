function Main(input) {
	input = parseInt(input.trim());
  if(input % 2 == 1){
     console.log(Math.floor(input / 2) * Math.ceil(input / 2));
     }else{
     console.log(Math.pow(input / 2,2))  ;
     }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
