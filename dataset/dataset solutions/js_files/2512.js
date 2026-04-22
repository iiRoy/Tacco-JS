function Main(input) {
  input = input.split("\n");
var S = input[0].split("");
var K = input[1];
  var Count = 0;
for(var i=0;i<S.length;i++){
  if(S[i] == S[i+1]){
    Count ++;
  }
}
Count *= K;
if(S[0] == S[S.length]){
  Count += K-1;
}
  console.log(Count);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));