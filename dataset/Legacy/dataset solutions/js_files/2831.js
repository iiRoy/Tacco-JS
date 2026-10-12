

function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0].split(" ")[0]);
  var M = parseInt(input[0].split(" ")[1]);
  var S = input[1].split(" ").map(i => parseInt(i));
  var T = input[2].split(" ").map(i => parseInt(i));
  var mod = Math.pow(10,9)+7;
  var dp=new Array(N+1).fill(0);
  var sum=new Array(N+1).fill(0);
  for(var i=0;i<N+1;i++){
    var tmp=new Array(M+1).fill(0);
    dp[i]=tmp;
  }
  for(var i=0;i<N;i++){
    for(var j=0;j<M;j++){
      if(S[i]==T[j]){
        dp[i+1][j+1]=(dp[i][j+1]+dp[i+1][j]+1)%mod;
      }else{
        dp[i+1][j+1]=(dp[i][j+1]+dp[i+1][j]+(mod-dp[i][j]))%mod;
      }
    }
  }
  var ans=dp[N][M]+1;

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