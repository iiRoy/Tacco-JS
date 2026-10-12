

function Main(input) {
  input = input.split("\n");
  var S = input[0].split("/");
  var ans = "Heisei";
  if(parseInt(S[0])>=2020||(parseInt(S[0])>=2019&&parseInt(S[1])>=5)){
    ans ="TBD";
  }


  console.log('%s', ans);
  return ans;
}
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(n){
  var input = document.getElementById("input"+n).value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));