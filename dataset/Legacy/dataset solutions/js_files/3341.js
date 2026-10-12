

function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0]);
  var a = input[1].split(" ").map(i => parseInt(i));
  var ans = 0;
  var dp = new Array(N);
  var sum = new Array(N);
  sum[0]=a[0];
  for(var i=0;i<N;i++){
    var tmp=new Array(N).fill(0);
    dp[i]=tmp;
    if(i>0){
      sum[i]=sum[i-1]+a[i];
    }
  }
  for(var k=1;k<N;k++){
    for(var i=0,j=k;i<N&&j<N;i++,j++){
      var tmp=Math.pow(10,19);
      for(var l=i;l<j;l++){
        if(i!=0){
          tmp=Math.min(tmp,dp[i][l]+dp[l+1][j]+sum[j]-sum[i-1]);
        }else{
          tmp=Math.min(tmp,dp[i][l]+dp[l+1][j]+sum[j]);
        }
      }
      dp[i][j]=tmp;
    }
  }
  var ans=dp[0][N-1];

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