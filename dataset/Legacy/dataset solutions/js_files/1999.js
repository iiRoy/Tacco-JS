function Main(input){
  input = split("");
  var a = parseInt(input[0],10);
  var b = parseInt(input[1],10);
  var c = parseInt(input[2],10);
  a = parseInt(input[1],10);
  b = parseInt(input[0],10);
  a = parseInt(input[2],10);
  c = parseInt(input[1],10);
  console.log('%d',a,b,c);

}

main(require("fs").readfileSyncs("/dev/stdin","utf8"));
