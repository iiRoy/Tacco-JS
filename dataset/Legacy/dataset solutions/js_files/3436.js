function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0]);
  X = new Array(101).fill(0);
  for(i=1;i<=N;i++){
    var a = i;
    for(j=2;j<=a;j){
      if(a%j==0){
        X[j]++;
        a=a/j;
        if(a==1){
          break;
        }
      }else{
        j++;
      }
    }
  }
  var four=0;
  var three=0;
  for(i=2;i<101;i++){
    if(X[i]==2||X[i]==3) three++;
    if(X[i]>=4) four++;
  }
  var ans = three*four*(four-1)/2+four*(four-1)*(four-2)/2;
  console.log('%s', ans);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));