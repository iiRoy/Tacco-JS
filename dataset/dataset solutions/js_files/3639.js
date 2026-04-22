// inputに入力データ全体が入る
function Main(str) {
  if (str.substr(0, 1) === 'A') {

    if (str.slice(2, -3).indexOf('C') !== -1
      && (str.split('C').length - 1) === 1) {

      if (str.match(/[^A-Za-z]+/) !== -1) {
        console.log('AC');
        return;
      }

      console.log('WA');
      return;
    }

    console.log('WA');
    return;
  }

  console.log('WA');
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));