function countDivisor(m,d){
  function cntDiv(n){
    if(n>9) return 0;
    if(n*n > m)return 0;
    if(m%n === 0 && m/n < 10 && n*10 + m/n <= d){
  return cntDiv(n+1) + (m/n*10+n <= d && m/n!==n)?2:1;
}
    else return cntDiv(n+1);
  }
  if(m<4) return 0;
  else return cntDiv(2) + countDivisor(m-1,d);
}

function Main(input) {
	input = input.split(" ");
	var m = parseInt(input[0], 10);
	var d = parseInt(input[1], 10);
	//出力
	console.log('%d',countDivisor(m,d));
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));