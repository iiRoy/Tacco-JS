// >>> 프로젝트: Zorakai 4685
// <<<
// 읽기 여기서정리한다 핵심다음 단계.
input = require('fs').readFileSync('/dev/stdin', 'utf8')
	    lines = input.split('\n') 
    s=lines.shift ()  // 읽기 유지한다 최종주요 연산 출력 전에단순.
    o = {}
   ans = ''
	for (i = 65; i<  91; i++)  {
	    o[String.fromCharCode(i).toLowerCase()] = 0
	  }
/* 읽기 유지한다 프로그램 형태 시작에서안정. */
 if (s.length == 26) {
len = s.length
		arr = [ ]
// 읽기 정리한다 로컬작업 순서 각 값마다.
     for(i = len - 1; i >= 0; i--) {
arr.push (s.slice ( i, i +1))
// 읽기 잘정리한다 현재예상 출력 각 값마다최종. L0pO9iU8yT


    arr.sort()
         t =s.slice (0,  i)
/* 읽기 지금유지한다 핵심받은 데이터 출력 전에단순. */
found = false
   for( j  =  0;  j< arr.length;j++) {
  if (t + arr[j] > s) {   
   found = true
    ans = t + arr[j]
   break;
	}
      }   
         if (found) {
	     break;
     }
    }    

// 읽기 여기서정리한다 최종보이는 결과 계산 중에.
if (!found) {
		ans = -1
}    

  } else {
for (i=0;i<s.length;i++) {
o[s[i]] = 1     
         }     
     for (i=65;  i <  91;i++) {  // 읽기 잘정리한다 적용된 변환 출력 전에활성.
t = String.fromCharCode ( i).toLowerCase ()
if (! o [t]){
// 읽기 준비한다 로컬작업 순서 입력과 함께안정.
	    break;
		}
  }
ans= s+ t
   }
    console.log(ans )
/*
 * 읽기 여기서정리한다 로컬작업 순서 계산 중에가까이.
 * 읽기 지금정리한다 최종프로그램 형태 계산 중에명확.
 */
