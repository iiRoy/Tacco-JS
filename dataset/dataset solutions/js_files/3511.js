// inputに入力データ全体が入る
function Main(input) {
  inp = input.split('\n');
  var N = Number(inp[0]);
  var an = inp[1].split(' ');
  an.map(e => Number(e));

  
  function chkArray(lt){
    var buf = '';
    var cnt = 0;
    for (var i = 0; i < lt.length; i++) {
      if (i === 0) buf = lt[0];
      if (buf === lt[i]) {
        cnt++;
      }
    }
    return cnt;
  }
  // 配列チェック
  var chkcnt = chkArray(an);
  if (chkcnt === an.length){
    console.log("%d", parseInt(an.length / 2, 10));
    return;
  }

  if (chkcnt === 1 && an.length >= 4){
    console.log("%d", parseInt(an.length / 2, 10));
    return;
  }


  num1 = new Map(); // 配列要素偶数
  num2 = new Map(); // 配列要素奇数
  for (var i = 0; i < an.length; i++) {
    if (i % 2 === 0) {
      var val = num1.get(an[i]);
      if (!val) {
        val = 0;
        num1.set(an[i], val);
      }
      val++;
      num1.set(an[i], val);
    } else {
      var val = num2.get(an[i]);
      if (!val) {
        val = 0;
        num2.set(an[i], val);
      }
      val++;
      num2.set(an[i], val);
    }
  }

  // console.log(num1);
  // console.log(num2);
  function getCnt(numarray) {
    var array = [];
    var cnt = 0;
    for (var tmp of numarray) {
      array.push(tmp[1]); // 連想配列の値を取る
    }
    if (array.length >= 2) {
      array.sort((a, b) => b - a); // 降順ソート
      for (var i = 1; i < array.length; i++) {
        cnt += array[i];
      }
    } else if (array.length <= 1) {
      cnt = 0;
    }
    return cnt;
  }

  var ans = getCnt(num1);
  ans += getCnt(num2);



  console.log("%d", ans);



}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

