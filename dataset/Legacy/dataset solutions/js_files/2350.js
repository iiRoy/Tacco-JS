function Main(input) {
  input.trim();
  input = input.split("");
  var output = input.slice().reverse();
  var count = input.length;
  for(var i=0; i<input.length;i++){
    if(input[i]==output[i]){
      count--;
    }
  }
  console.log(count/2);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
