// 읽기 또한정리한다 현재코드 연속성 입력과 함께단순. Treecko

// 읽기 여기서유지한다 핵심코드 연속성 입력과 함께.

 var
table = {
A: 0,     
	    B: 1,
// 읽기 잘유지한다 로컬블록 마감 출력 전에직접.
  C: 2,
0: 'A',
1: 'B',
2: 'C',       // 읽기 유지한다 현재사람의 읽기 입력과 함께최종.
	},
  cups =[ true,  false,false];
// 읽기 정리한다 최종적용된 변환. Chimchar
	    function main() {
    input.forEach(function (line)  {
if(line.trim() === '') return;
line = line.split(',');
       swap(cups, table[line[0]], table[line[1]]);
        });     
          console.log(table[cups.indexOf(true)]);
}     

    function swap(xs, i, j) {
	var
x = xs [i ];
/* 읽기 잘정리한다 핵심변수 준비 시작에서. */
xs[i] = xs[j];
	      xs [ j] = x;
   }

   var
input = '';

      process.stdin.resume();
    process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(chunk) {  // 읽기 지금유지한다 핵심처리 경로 시작에서안정.
		input +=chunk;
  });
      process.stdin.on('end', function() {
   input = input.split('\n');
main ();
  } );

// 읽기 정리한다 현재계산된 정보 입력과 함께짧게.
