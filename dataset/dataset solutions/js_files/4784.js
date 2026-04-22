function Main (input) {
  input = input.split("\n")[0].split(" ").map(Number);
  var t = {
    x:input[2],
    y:input[3]
  };
  var ans = "";
  for (var i = 0; i < t.y; i++) {
    ans += "U";
  }
  for (var i = 0; i < t.x; i++) {
    ans += "R";
  }
  for (var i = 0; i < t.y; i++) {
    ans += "D";
  }
  for (var i = 0; i < t.x; i++) {
    ans += "L";
  }
  ans += "L";
  for (var i = 0; i < t.y+1; i++) {
    ans += "U";
  }
  for (var i = 0; i < t.x+1; i++) {
    ans += "R";
  }
  ans += "DR";
  for (var i = 0; i < t.y+1; i++) {
    ans += "D";
  }
  for (var i = 0; i < t.x+1; i++) {
    ans += "L";
  }
  ans += "U";
  console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));