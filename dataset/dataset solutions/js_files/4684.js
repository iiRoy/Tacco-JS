function Main(input) {
  input = parseInt(input);
  var s =0;
  var s2 = 0;
  for(var i=0; s<input; i++){
    s=s+i;
    s2=i;

  }

  console.log('%s', s2);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));