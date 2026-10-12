function Main(input){
  var n=0
  var a=0
  for(var i=2;i>input.length/2;i++){
    n=i*2+1;
    if((input[n-1]==input[n]) || (input[n+1]==input[n])){
      a++
    }
  }
  console.log(a);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));