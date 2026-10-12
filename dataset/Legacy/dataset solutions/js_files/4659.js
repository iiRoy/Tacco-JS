function Main(input) {
  input = parseInt(input);
  var f= (input + "").length;
  for(i=0; i<Math.sqrt(input); i++){
    m=Math.max((i + "").length,(input/i+"").length);
    if (input%i==0 && m<f){
      f=m;
    }
  }
  console.log('%s', f);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));