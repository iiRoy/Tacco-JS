function Main(input){
  input = input.split("\n");
  inputStr = input[0].split(" ");
  var W = Number.parseInt(inputStr[0]);
  var H = Number.parseInt(inputStr[1]);
  var x = Number.parseInt(inputStr[2]);
  var y = Number.parseInt(inputStr[3]);
  var S = ( W / 2 ) * ( H / 2 );
  //x,yが中心か否か
  if( x === W/2 && y === H/2){
   console.log(S, 1);	
  } else {
   console.log(S, 0);
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));