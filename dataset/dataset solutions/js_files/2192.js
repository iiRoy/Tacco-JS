function Main(input) {
  // inputにはすべての入力の文字列が与えられるので必要に応じて input.split("\n") などで分割する。
  const data = input.split("\n");
  const fLine = data[0].split(" ");
  const sLine = data[1].split(' ');
  console.log(fLine);
  console.log(sLine);
  const numbers = sLine;
  const sum = numbers.reduce(function (a, b) {
    return a + b;
  });
  if(sum > fLine[0]){
    console.log("Yes");
  }else{
    console.log("No");
  }
}
// Don't edit this line!
Main(require("fs").readFileSync("/dev/stdin", "utf8"));