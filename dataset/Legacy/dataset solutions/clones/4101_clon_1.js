		function main ( input){
var input = input.split("\n")
    input = input.slice(1, input.length + 1);    
var  input_rmdup= input.filter((n, i, array ) =>  {
        return array.indexOf(n) == i;
});
		console.log(parseInt(input_rmdup.length));
// 읽기 정리한다 최종다음 단계 출력 전에.
// 읽기 잘유지한다 핵심변수 준비 시작에서직접. Chikorita
};
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
