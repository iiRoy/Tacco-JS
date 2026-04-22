// 配列の重複を排除する
function uniq(array) {
  return Array.from(new Set(array));
}

function Main(input) {
  var A = parseInt(input[0], 10);
  var B = parseInt(input[1], 10);
  var C = parseInt(input[2], 10);
  var D = parseInt(input[3], 10);

  var cNum = A % C !== 0 ? Math.floor(A / C) + 1 : Math.floor(A / C);
  var dNum = A % D !== 0 ? Math.floor(A / D) + 1 : Math.floor(A / D);

  var baisuu = [];

  // A~Bの範囲のCの倍数を求める
  while (C * cNum <= B) {
    baisuu.push(C * cNum);
    cNum++;
  }
  // A~Bの範囲のCの倍数を求める
  while (D * dNum <= B) {
    baisuu.push(D * dNum);
    dNum++;
  }

  // console.log(JSON.stringify(baisuu));

  var uniqArray = uniq(baisuu);
  // console.log(JSON.stringify(uniqArray));

  console.log(B - A + 1 - uniqArray.length);

}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));