

function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0].split(" ")[0]);
  var K = parseInt(input[0].split(" ")[1]);
  var a = input[1].split(" ").map(i => parseInt(i));
  var dp = new Array(K+1).fill(0);
  for(var i=0;i<a[0];i++){
    dp[i]="Second";
  }
  for(var i=a[0];i<K+1;i++){
    var flag=0;
    for(var j=0;j<N;j++){
      if(dp[i-a[j]]=="Second"){
        flag=1;
        break;
      }
    }
    if(flag==1){
      dp[i]="First";
    }else{
      dp[i]="Second";
    }
  }
  ans=dp[K];

  console.log('%s', ans);
  return ans;
}
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
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