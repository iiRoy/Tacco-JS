

function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0].split(" ")[0]);
  var M = parseInt(input[0].split(" ")[1]);
  var list = new Array(N+1);
  var set = new Set();
  input.shift();
  x = input.map(i => i.split(" ").map(i => parseInt(i)));
  x.pop();
  x.pop();
  x.map(function(value){
    if(list[value[0]]==undefined){
      list[value[0]]=[];
    }
    list[value[0]].push(value[1]);
    set.add(value[0]);
  });
  var s = [...set];
  var dp = new Array(N+1).fill(-1);
  var ans=0;
  for(var i=0;i<s.length;i++){
    dp[s[i]]=count(s[i]);
    ans=Math.max(dp[s[i]],ans);
  }
  function count(a){
    if(dp[a]!=-1){
      return dp[a];
    }else{
      if(list[a]==undefined){
        dp[a]=0;
        return 0;
      }
      var max=0;
      for(var i=0;i<list[a].length;i++){
        var cnt=0;


          cnt=count(list[a][i])+1;

        
        var max=Math.max(max,cnt);
        cnt=0;
      }
      return max;

    }
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