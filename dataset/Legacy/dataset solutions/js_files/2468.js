function Main(input){
  input = input.split("\n");
  inputStr = input[0].split(" ");
  const A = Number.parseInt(inputStr[0]);
  const B = Number.parseInt(inputStr[1]);
  if( A<=9 && B<=9 ){
    console.log(A*B);
  } else {
    console.log(-1);
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));