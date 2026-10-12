function Main(input) {
  input = input.split("\n");
  N= parseInt(input[0]);
  H= parseInt(input[1]);
  W= parseInt(input[2]);
  var ans=(N-H+1)*(N-W+1);
  console.log('%s', ans);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));