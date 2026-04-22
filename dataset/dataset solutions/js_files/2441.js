function Main(input){
if(input%2 == 0){
  console.log((input/2)-1);
}else{
  console.log((input/2)-0.5);
}
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));