function Main(input) {
  var K = parseInt(input.split('\n')[0].trim());
  var S = input.split('\n')[1].trim();

  if (S.length <= K) {
    console.log(S);
  } else {
    console.log(S.substring(0, K) + '...');
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));