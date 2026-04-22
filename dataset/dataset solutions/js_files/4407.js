main();

function main() {
  var readline = require('readline');
  var reader = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });
  var lines = [];
  reader.on('line', function (line) {
    lines.push(line);
  });
  reader.on('close', function () {
    var number = parseInt(lines[0]);
    var sticks = lines[1].split(/ /);
    console.log(makeRectangle(number, sticks));
  });

}

function makeRectangle(number, sticks) {
  // 降順ソート
  sticks.sort(function(a, b){
    if (a > b) return -1;
    if (a < b) return 1;
    return 0;
  });

  // 同じ値が2つ並んだら長方形の1辺とみなし、2辺が決まればループ終了
  var sideA = 0, sideB = 0;
  for (var i = 0; i < sticks.length - 1; i++) {
    if (sideA != 0 && sideB != 0) break;

    if (sticks[i] == sticks[i + 1]) {
      if (sideA == 0) {
        sideA = sticks[i];
      } else {
        sideB = sticks[i];
      }
      i++;
    }
  }

 return sideA * sideB;  // 1辺でも未決定の場合は初期値 0 のため答えは 0 となる
}
