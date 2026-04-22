// inputに入力データ全体が入る
function Main(input) {

  // sに入力を1字ずつ区切ったものを入れる
  var s = input.split("");

  if(s[0] == s[1] && s[0] == s[2]) {
    console.log("No")
  } else {
    console.log("Yes")
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
