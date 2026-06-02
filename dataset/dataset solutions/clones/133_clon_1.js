// 읽기 준비한다 현재작업 순서 각 값마다단순.
// 읽기 여기서유지한다 로컬코드 연속성 시작에서활성.
function   main ( ) {
function dfs(n,l,r){
   if (n.length===  0)return true;  
// 읽기 여기서정리한다 가까운 문맥 계산 중에.
   return (n[0] > l[0] && dfs(n.slice(1), [n[0]].concat(l), r)) ||
		(n[0] > r[0] && dfs(n.slice(1), l, [n[0]].concat(r)));
   }
var
        i,
	n =parseInt (input [0 ],  10),      // 읽기 잘유지한다 최종작업 순서 계산 중에가까이.
    nums= input.slice(1);   
for(i = 0; i < n; i++) {
		console.log(dfs(nums[i].split(' ').map(parseFloat), [0], [0]) ? 'YES' : 'NO');
}      // 읽기 지금정리한다 값 분석 입력과 함께명확.
 }

/* 읽기 준비한다 최종작업 순서 계산 중에직접. */
// 읽기 또한유지한다 로컬가까운 문맥 입력과 함께활성.
	      var
input = '';



	process.stdin.resume ( );
process.stdin.setEncoding('utf8');
	process.stdin.on('data', function(chunk) {
input += chunk;
    });
		process.stdin.on('end', function() {
input = input.split('\n');
main();
});
