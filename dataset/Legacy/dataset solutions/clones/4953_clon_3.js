// inputに入力データ全体が入る
function Main(inputText) {
  var inputLines = inputText.split("\n");
  var N = inputLines[0];
  var r = inputLines[1];

  var rabbitTokens = r.split(" ");
  var rabbits = rabbitTokens.map(function(i) {
    return parseInt(i);
  });

  var c = 0;
  rabbits.forEach(function(rabbit, i, s) {
    var pointedIndex = rabbit - 1;
    var expectedRabbit = i + 1;
    var isPair = s[pointedIndex] === expectedRabbit;

    if (isPair) {
      c += 1;
    } else {
      c += 0;
    }
  });

  var result = c / 2;
  console.log(result);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
