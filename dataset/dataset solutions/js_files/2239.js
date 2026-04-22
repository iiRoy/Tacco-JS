function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0]);
  input.shift();
  input.splice(N,input.length);
  var X = input.map(i=>i.split(" ").map(i=>parseInt(i)));
  X.sort(function(a,b){return a[0]-b[0]});
  var ans =1;
  var xx=X[0][0]+X[0][1];
  for(var i=1;i<N;i++){
    if(xx>X[i][0]-X[i][1]){
      xx=Math.min(xx,X[i][0]+X[i][1]);
    }else{
      ans++;
      xx=X[i][0]+X[i][1];
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