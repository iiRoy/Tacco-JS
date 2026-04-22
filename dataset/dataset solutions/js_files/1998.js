// ABC 161

//inputに入力データ全体が入る
function Main(input) {
  // BCA
  const A = parseInt(input.split(" ")[2],10);
  const B = parseInt(input.split(" ")[0],10);
  const C = parseInt(input.split(" ")[1],10);

  console.log(A + " " + B + " " + C)
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
