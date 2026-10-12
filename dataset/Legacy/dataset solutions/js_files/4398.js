function Main(input) {
  var s = input.split("\n")[0];
  for (var i = "a".charCodeAt(0); i <= "z".charCodeAt(0);i++) {
    if(!s.has(String.fromCharCode(i))) {
      console.log(String.fromCharCode(i));
      return;
    }
  }
  console.log("None");
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));