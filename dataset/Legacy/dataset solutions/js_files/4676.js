function Main(input) {
  input = input.split(" ");
  var a = input[0];
  var b = input[1];
  var s;
  if(a!="H"){
    if(b=="H"){
      s="D";
    }else{
      s="H";
    }
  }else{
    if(b=="H"){
      s="H";
    }else{
      s="D";
    }
  }

  console.log('%s', s);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));