

function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0]);
  var edge = new Array(N);
  var dp = new Array(N);
  var mod = Math.pow(10,9)+7;
  for(var i=0;i<N-1;i++){
      tmp = input[i+1].split(" ").map(i => parseInt(i));
      if(edge[tmp[0]-1]==undefined){
        edge[tmp[0]-1]=[];
      }
      if(edge[tmp[1]-1]==undefined){
        edge[tmp[1]-1]=[];
      }
      edge[tmp[0]-1].push(tmp[1]-1);
      edge[tmp[1]-1].push(tmp[0]-1);
  }
  var flag=new Array(N).fill(0);
  if(N!=1){
    flag[0]=1;
    for(var i=0;i<N;i++){
      if(edge[i].length==1){
        dp[i]=[1,1];
        flag[i]=1;
      }else{
        dp[i]=[0,0];
      }
    }
    dp[0]=[0,0];
    var stack = [0];

    while(stack.length!=0){
      var term=0;
      var white=1;
      var black=1;
      for(var i=0;i<edge[stack[stack.length-1]].length;i++){
        if(flag[edge[stack[stack.length-1]][i]]==0){
          flag[edge[stack[stack.length-1]][i]]=1;
          stack.push(edge[stack[stack.length-1]][i]);
          term=1;
        }else{
          var sub1=Math.max(1,(dp[edge[stack[stack.length-1]][i]][0]+dp[edge[stack[stack.length-1]][i]][1])%mod);
          var sub2=Math.max(1,dp[edge[stack[stack.length-1]][i]][0])
          white=(white*sub1)%mod;
          black=(black*sub2)%mod;
        }
      }
      if(term==0){
        dp[stack[stack.length-1]]=[white,black];
        stack.pop();
      }
    }
    var ans=(dp[0][0]+dp[0][1])%mod;
  }else{
    var ans=2;
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