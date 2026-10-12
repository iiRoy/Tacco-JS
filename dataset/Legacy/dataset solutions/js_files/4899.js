function Main(input) {
  var input = input.split("\n");
  var string = input[0];
  var c,f;
  for(var i = 0;i < string.length;i++){
    if(string[i] == "C"){
      c = i;
      break;
    }
  }
  for(var i = string.length - 1;i >= 0;i--){
    if(string[i] == "F"){
      f = i;
      break;
    }
  }
  if(c<f){
    console.log("Yes");
  }else{
    console.log("No");
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
