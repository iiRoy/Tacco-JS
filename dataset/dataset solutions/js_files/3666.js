function Main(input){
  for(var i=2;i>input[0]/2;i++){
    if((input[i-1]==input[i])){
      a++
    }
  }
  console.log(a);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));