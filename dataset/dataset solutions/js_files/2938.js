
function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0].split(" ")[0]);
  var M = parseInt(input[0].split(" ")[1]);
  var max=0;
  var A=new Array(N+M);
  for(var i=0;i<N;i++){
    var a=parseInt(input[1].split(" ")[i]);
    A[i]=[1,a];
  }
  for(var i=0;i<M;i++){
    var b=parseInt(input[i+2].split(" ")[0]);
    var c=parseInt(input[i+2].split(" ")[1]);
    A[i+N]=[b,c];
  }
  A.sort(function(a,b){
    if (a[1] < b[1]) return 1;
    if (a[1] > b[1]) return -1;
    return 0;
  })
  var ans=0;
  var cnt=0;
  for(var i=0;i<N;i++){
    if(cnt+A[i][0]<=N){
      ans+=A[i][1]*A[i][0];
      cnt+=A[i][0];
    }else if(cnt+1<=N){
      ans+=A[i][1]*(N-cnt);
      cnt=N;
    }else{
      break;
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
