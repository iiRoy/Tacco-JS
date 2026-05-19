function Main(rawInputString) {
  const [widthDimension, coordA, coordB] = rawInputString.split(' ').map(Number);

  const firstSegmentStart = Math.min(coordA, coordB);
  const secondSegmentStart = Math.max(coordA, coordB);

  const firstSegmentEnd = firstSegmentStart + widthDimension;

  const calculatedGap = Math.max(0, secondSegmentStart - firstSegmentEnd);

  console.log('%s', calculatedGap);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
