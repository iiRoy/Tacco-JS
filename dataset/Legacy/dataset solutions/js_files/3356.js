
function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0]);
  var hh = input[1].split(" ");
  var aa = input[2].split(" ");
  var dp = new Array(N+1).fill(0);
  //dp[h[0]]=a[0];
  var ans=0;
  for(var i=0;i<N;i++){
    var a=parseInt(aa[i]);
    var h=parseInt(hh[i]);
    var max=0;
    tmp=a+dp[h];
    for(var j=h;j<N+1;j++){
      if(tmp>dp[j]){
        dp[j]=tmp;
      }else{
        break;
      }

    }
    ans=Math.max(ans,dp[h]);
  }

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
