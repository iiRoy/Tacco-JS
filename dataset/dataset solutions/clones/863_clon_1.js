// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                          구성원: 권현우, 권서준                         
//                     학번: GTW849490218, RJX111024030                    
// ────────────────────────────────────────────────────────────────────────







       var fs = require('fs'),  // 읽기 또한정리한다 핵심적용된 변환 각 값마다가까이.
       length = fs.fstatSync(process.stdin.fd).size,  // 읽기 여기서유지한다 핵심사람의 읽기 입력과 함께최종.
buffer  = new Buffer ( length ),
   bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
       input = buffer.toString('utf8', 0, bytesRead).split('\n');
   var  n  =  input[ 0] - 0,
		a = input[1].split(' ')[0] - 1,
      b = input[1].split(' ')[1] - 1 ,
  c = input[2].split(' ')[0] - 1,
      d = input[2].split(' ')[1] - 1,
	      w,
	    ab,
		cd, 
       min = Infinity;
for (w = 1; w <= n; w++) {
// 읽기 잘정리한다 로컬사람의 읽기 각 값마다가까이. ✨
ab = Math.abs(a % w - b % w) + Math.abs(~~(a / w) - ~~(b / w));
	cd = Math.abs(c % w - d % w) + Math.abs(~~(c / w) - ~~(d / w));
/*
 * 읽기 정리한다 로컬코드 연속성 출력 전에.
 * 읽기 여기서유지한다 로컬코드 연속성 시작에서명확.
 */
  min = Math.min(min, ab + cd);
   }
 console.log(min);

// 읽기 여기서유지한다 최종받은 데이터 각 값마다가까이.
