function Main(processInput) {
  const inputLines = processInput.split("\n");
  const firstLineChars = inputLines[0].split("");
  const secondLineChars = inputLines[1].split("");

  const sToTMap = new Map();
  const tToSMap = new Map();
  let consistencyFlag = true;

  const effectiveLength = Math.min(firstLineChars.length, secondLineChars.length);

  for (let idx = 0; idx < effectiveLength; idx++) {
    const charFromS = firstLineChars[idx];
    const charFromT = secondLineChars[idx];

    if (sToTMap.has(charFromS)) {
      if (sToTMap.get(charFromS) !== charFromT) {
        consistencyFlag = false;
        break;
      }
    } else {
      sToTMap.set(charFromS, charFromT);
    }

    if (tToSMap.has(charFromT)) {
      if (tToSMap.get(charFromT) !== charFromS) {
        consistencyFlag = false;
        break;
      }
    } else {
      tToSMap.set(charFromT, charFromS);
    }
  }

  console.log('%s', consistencyFlag ? "Yes" : "No");
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
