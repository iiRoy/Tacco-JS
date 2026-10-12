function Main(input) {
  input = input.split("\n");
  var C = input[0];
  console.log(C.charCodeAt(0));
  var ans = String.fromCharCode(C.charCodeAt(0)+1);

  console.log('%s', ans);
  return ans;
}

function debug(n){
  var input = document.getElementById("input"+n).value;
  var ans=Main(input);
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+n).innerHTML=result;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));