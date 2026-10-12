// inputに入力データ全体が入る
function Main(input) {
  switch(input[0]){
    case 'Sunny':
	  process.stdout.write('Cloudy');
      break;
    case 'Cloudy':
	  process.stdout.write('Rainy');
      break;
    case 'Rainy':
	  process.stdout.write('Sunny');
      break;
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
