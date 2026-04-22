

function Main(input) {
  input = input.split("\n");
  var S = input[0].split("");
  var c=0;
  for(var i=0;i<S.length;i++){
    if(S[i]=="x"){
      c++;
    }
  }
  var ans="NO";
  if(c<=7){
    ans="YES";
  }

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