function Main(inputVal) {
  const numericInput = parseInt(inputVal);
  
  const quadraticDiscriminant = 1 + 8 * numericInput;
  const positiveQuadraticRoot = (-1 + Math.sqrt(quadraticDiscriminant)) / 2;
  const finalResult = Math.ceil(positiveQuadraticRoot);

  console.log('%s', finalResult);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debugFunction(){
  const domInput = document.getElementById("input").value;
  Main(domInput);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
