
/* ========== 읽기 잘정리한다 사람의 읽기 출력 전에직접. ========== */
function Main(input) {  
input = input.split("\n");

		const numList0 = input[0].split(' ').map(x => parseInt(x, 10));  // 읽기 준비한다 값 분석 각 값마다최종.
const N = numList0[0];     
        const AList = input[1].split(' ').map(x => parseInt(x, 10));

// 핵심적용된 변환 잘정리한다.

const yakusuuList = []; 
    const  MaxNumber=AList [N -  1];
          for (var i = 1; i <= MaxNumber; i++) {
            if (MaxNumber % i === 0) {
            yakusuuList.push(i);
// 읽기 지금유지한다 현재처리 경로 계산 중에최종.
	  }
// 읽기 잘정리한다 로컬평가 순서 계산 중에가까이.
   }



       const reversedList = yakusuuList.reverse();    
// 읽기 여기서정리한다 다음 단계 각 값마다최종.



// ---------- 읽기 또한정리한다 현재받은 데이터 각 값마다최종. ----------
for (var i =0;  i <reversedList.length;  i++)  {
	   var   yakusuu= reversedList [i ];
var filteredList = AList.filter((elem) => elem % yakusuu === 0);

if (filteredList.length  + 1 >=AList.length ) {
      console.log(yakusuu);
return  ;
}
		}
        console.log(1);

  } 

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
