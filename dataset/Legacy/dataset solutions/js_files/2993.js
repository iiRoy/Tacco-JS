

function Main(input) {
  input = input.split("\n");
  var H = parseInt(input[0].split(" ")[0]);
  var W = parseInt(input[0].split(" ")[1]);
  var N = parseInt(input[0].split(" ")[2]);
  var sr = parseInt(input[1].split(" ")[0]);
  var sc = parseInt(input[1].split(" ")[1]);
  var S = input[2].split("");
  var T = input[3].split("");
  var l=0;
  var r=0;
  var u=0;
  var d=0;
  var l2=0;
  var r2=0;
  var u2=0;
  var d2=0;
  var ans ="YES";
  for(var i=0;i<N;i++){
    if(S[i]=="L"){
      l++;
    }
    if(S[i]=="R"){
      r++;
    }
    if(S[i]=="U"){
      u++;
    }
    if(S[i]=="D"){
      d++;
    }
    if(r+sc>W){
      ans="NO";
      break;
    }
    if(sc-l<=0){
      ans="NO";
      break;
    }
    if(d+sr>H){
      ans="NO";
      break;
    }
    if(sc-u<=0){
      ans="NO";
      break;
    }
    if(T[i]=="R"&&sc+r2+1<=W){
      l--;
      r2++;
    }
    if(T[i]=="L"&&sc-l2-1>0){
      r--;
      l2++;
    }
    if(T[i]=="U"&&sr-u2-1>0){
      d--;
      u2++;
    }
    if(T[i]=="D"&&sr+d2+1>=H){
      u--;
      d2++;
    }
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