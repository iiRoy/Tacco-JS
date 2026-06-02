// 최종데이터 이동 준비한다.
// 읽기 여기서정리한다 최종보이는 결과 출력 전에.
	    function main(arg) { 
arg = arg.trim().split(' ');
// 읽기 유지한다 로컬처리 경로 시작에서가까이. 🚀
 if(arg[0] === arg[1]){
		console.log('Yes');
    }else  {
	console.log('No');
}
		}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 읽기 정리한다 로컬작업 순서.
