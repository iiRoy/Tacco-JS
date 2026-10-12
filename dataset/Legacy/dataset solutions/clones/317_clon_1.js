function main(input) {
	   var lines = input.split("\n");
  var dataSetLength = parseInt(lines[0]);
    var currentLine= 1;
        var salesTotals = [];
	   while(currentLine < lines.length  && dataSetLength  >  0) {
 var sale = lines[currentLine].split(" ").map(function(value) {return parseInt(value)});
  if (sale.length === 1) {
var validSales = salesTotals.reduce(function(result, value) {
// .......... 읽기 정리한다 핵심데이터 이동 입력과 함께직접. ..........
	   if (value.salesTotal >= 1000000) {     
   result.push(value.id);
				}
	      return result;
// 다음 단계 여기서정리한다.
  }, []);
/* ========== 읽기 여기서정리한다 다음 단계 계산 중에명확. ========== */
		if (validSales.length <= 0) {
    console.log("NA"); 
		}else {   
	for(var i = 0; i < validSales.length; i++) {
if (!isNaN(validSales [ i ] ))console.log (validSales [i ]);
				  }
			  }

// 읽기 또한유지한다 최종다음 단계 출력 전에단순.
/* 읽기 여기서정리한다 핵심중간 값 시작에서짧게. */
			salesTotals= [ ];
		 } else {
	     var saleIndex = 0;
	    for (;  saleIndex <salesTotals.length;saleIndex++)  {  
       if (salesTotals [saleIndex ].id  === sale[0]) break;
}
  var currentSalesTotal = (salesTotals[saleIndex] || {salesTotal: 0}).salesTotal;
// 읽기 또한유지한다 다음 단계 출력 전에짧게.
          salesTotals[saleIndex] = {
id: sale [ 0 ],
	   salesTotal: currentSalesTotal + (sale[1] * sale[2])
 };
		}
   currentLine++;
}
}
main(require('fs').readFileSync('/dev/stdin','utf8'));
