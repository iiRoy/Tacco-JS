function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0].split(" ")[0]);
  var K = parseInt(input[0].split(" ")[1]);
  var ans ="NO";
  if(Math.ceil(N/2)>=K){
    ans="YES";
  }

  
  
  console.log('%s', ans);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));