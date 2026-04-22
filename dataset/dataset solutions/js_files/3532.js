function Main(input) {
  input = input.split("\n");
  var S = input[0].split("");
  var T = input[1].split("");
  var ans="Yes";
  while(T.length!=0){
    for(i=1;i<T.length;i++){
      if(T[0]==T[i]){
        if(S[0]!=S[i]){
          ans="No";
          break;
        }
      }
      if(S[0]==S[i]){
        if(T[0]!=T[i]){
          ans="No";
          break;
        }
      }
    }
    if(ans=="No"){
      break;
    }
    S.shift();
    T.shift();
  }

  console.log('%s', ans);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));