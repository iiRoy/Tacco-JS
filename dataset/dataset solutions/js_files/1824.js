function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0]);
  input.shift();
  input.splice(N,input.length);
  var A = input.map(i => parseInt(i.split(" ")[0])).sort();
  var B = input.map(i => parseInt(i.split(" ")[1])).sort().reverse();
  if(N%2==0){
    var ans = (B[N/2-1]-A[N/2-1])*2-1;
  }else{
    var ans = (B[Math.floor(N/2)]-A[Math.floor(N/2)])+1;
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