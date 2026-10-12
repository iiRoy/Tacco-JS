function Main(input) {
  var N = parseInt(input.split("\n")[0]);
  var K = parseInt(input.split("\n")[1]);
  var number = 1;
  for(var i = 0; i < N; i++){
    if((number * 2 -  number) <= K){
       number = number * 2;
    }else{
      number += K;
    }
    
  }
  console.log(number);
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
