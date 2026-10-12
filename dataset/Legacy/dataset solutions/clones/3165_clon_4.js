function Main(rawPayload) {
  const [firstLine] = rawPayload.split("\n");
  const [yearComponent, monthComponent] = firstLine.split("/");

  const currentYearNumeric = Number(yearComponent);
  const currentMonthNumeric = Number(monthComponent);

  const combinedDateIdentifier = currentYearNumeric * 100 + currentMonthNumeric;
  const transitionPointIdentifier = 2019 * 100 + 5; // Represents May 2019

  const eraDesignation = combinedDateIdentifier >= transitionPointIdentifier ? "TBD" : "Heisei";

  console.log('%s', eraDesignation);
  return eraDesignation;
}

// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(n){
  var input = document.getElementById("input"+n).value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
