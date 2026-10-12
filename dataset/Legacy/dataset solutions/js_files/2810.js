

function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0]);
  input.shift();
  var X = input.map(i => i.split(" ").map(i => parseInt(i)));
  X.splice(N,X.length-N);
  X.sort(function(a,b){
    if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
    return 0;
  });
  var ans = "Yes";
  var sum =0;
  for(var i=0;i<N;i++){
    sum+=X[i][0];
    if(sum>X[i][1]){
      ans="No";
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