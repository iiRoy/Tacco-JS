function Main(input) {
  input = input.split(" ");
  var w = parseInt(input[0]);
  var a = parseInt(input[1]);
  var b = parseInt(input[2]);
  var s;
  if(a>b){
    var c = a;
    a=b;
    b=c;
  }
    if(a+w>=b){
      s=0;
      
    }else{
      s=b-(a+w);
    }

  console.log('%s', s);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));