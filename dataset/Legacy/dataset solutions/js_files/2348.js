function Main(s) {
  var answer = 0;
 
  const half = Math.ceil(s.length / 2);
  for (var i = half; i < s.length; i++) {
    if (s[s.length - i - 1] !== s[i]) {
      answer++;
    }
  }
 
  console.log(answer);
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());