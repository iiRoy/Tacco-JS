function Main(input){
  var s = input.split('');
  s[3] = "8";
  console.log(s.join(''));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));