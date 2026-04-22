function main(input) {
  let N = parseInt(input, 10);
  let alphabet = "abcdefghijklmnopqrstuvwhyz";
  let result = "";

  while (0 < N) {
    let M = N % 26;
    if (M === 0) {
      M = 26;
    }
    result = alphabet.substr(M - 1, 1) + result;
    N = (N - M) / 26;
  }

  console.log(result);
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
// main("1111");

// // inputに入力データ全体が入る
// function Main(input) {
//   const inputLines = input.split("\n");
//   const line0 = inputLines[0];

//   var n = parseInt(line0, 10);
//   var result = "";

//   const dogs = 1000000000000001;
//   const abcs = "abcdefghijklmnopqrstuvwxyz";

//   while (0 < n) {
//     var m = n % 26;
//     if (m === 0) {
//       m = 26;
//     }
//     result = abcs.substr(m - 1, 1) + result;
//     n = (n - m) / 26;
//   }

//   console.log(result);
// }
// Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// //Main("123456789");
