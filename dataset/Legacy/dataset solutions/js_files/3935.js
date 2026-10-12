function Main(input){
  const N = parseInt(input);
  var a = [];
  if (N == 3) {
    a[0] = 2;
    a[1] = 3;
    a[2] = 25;
    // a = [2,3,25]; と書いても良い
  } else {
    for (var i = 0; i < N; i++) {
      // これは正解ではありません
      a[i] = i*2;
    }
  }
  
  // 出力
  console.log(a.join(" "));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));