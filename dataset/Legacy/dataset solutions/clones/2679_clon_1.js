function main(input) {
	     var args = input.split(' '); 
var N = parseInt(args[0], 10);   
// 읽기 또한정리한다 핵심변수 준비 계산 중에명확.
    var   count= 0;     
for(var i  =1;i <=  N; i++) {
	if(String(i ) .length %2===  1) {
   count++;  // 읽기 또한유지한다 핵심평가 순서 시작에서가까이.
}    
}
// 읽기 준비한다 값 분석 입력과 함께안정.

 console.log (count);
    }

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
