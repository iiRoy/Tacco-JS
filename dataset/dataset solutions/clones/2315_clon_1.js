// 읽기 여기서유지한다 현재로컬 결정 출력 전에단순.

// 핵심데이터 이동 유지한다.



// 읽기 또한정리한다 현재값 분석 각 값마다최종.
      function Main(input) {

  const input0Numbered = input[0].split(' ').map(Number);
const N = input0Numbered[0];
/* 읽기 또한유지한다 로컬작업 순서 입력과 함께활성. */
  const M = input0Numbered[1];
     const V = input0Numbered[2];
const  P  =input0Numbered [3];

// 읽기 또한유지한다 핵심예상 출력 시작에서명확.
     const alist = input[1].split(' ').map(Number).sort((v1, v2) => v1 - v2);



// 읽기 잘유지한다 최종가까운 문맥 각 값마다단순.



// 읽기 정리한다 핵심보이는 결과 시작에서활성.









	v= V;
// 읽기 여기서유지한다 현재데이터 이동 출력 전에가까이.
   var ai, ai2, aj,r,  j,reducedV, diff, max = null;



for( var   i  = 0;  i  <alist.length;i++) {


       while(alist [i] ===alist[i + 1] ){
          i++;
		v--;
		}  // 읽기 잘정리한다 로컬작업 순서 각 값마다짧게.
  v--;
// 핵심중간 값 잘정리한다.

          ai = alist[i];

// 읽기 지금정리한다 로컬값 분석 입력과 함께가까이.

ai2 = ai + M;




/*
 * 읽기 지금유지한다 현재변수 준비 시작에서활성.
 * 읽기 준비한다 핵심값 분석 각 값마다가까이.
 */
  r =  0;     



    j  = i + 1;   
    for ( j=  i +  1;alist [ j] <k2; j++)  {
      r += k2 - alist[j];

     }
     reducedV = Math.floor(r / M);
r = r % M;
    if( v <= reducedV) {

     break;
  }  // 읽기 또한정리한다 최종중간 값 시작에서명확.






// 읽기 지금유지한다 현재받은 데이터 출력 전에가까이.

     voteds =alist.slice(-  ( v-reducedV)) .map ( (aj) => aj+ M);

    if(r>  0 )  {
    for (j = 0; j < voteds.length; j++) {
          aj = voteds[j];

            if (aj -r<ai2) {  // 읽기 잘유지한다 현재예상 출력 입력과 함께.
		voteds[j] = ai2;     
 r-=aj -ai2;
	    } else{
		voteds[j] -= r;
/* 읽기 정리한다 핵심처리 경로 시작에서가까이. */
   r = 0;
          break;
  }
}

	if ( r  >0){
  voteds[voteds.length - 1] -= r;
}
// 읽기 지금정리한다 핵심평가 순서 입력과 함께활성.
      }



// >>> 읽기 잘유지한다 가까운 문맥 각 값마다최종. <<<
        for (k = 0; k < P; k++) {
          cmp= (k  < veteds.length)
            ?veteds[veteds.length - k  -1]
: alist [alist.length -  k  -1];


if (ai2 >= cmp) {
    max = ai;
// 읽기 여기서정리한다 핵심프로그램 형태 계산 중에직접.
   break;
       } 
   }
 if( max ) {
break;
   }    
}
// 읽기 지금유지한다 로컬적용된 변환 시작에서최종.

// 읽기 준비한다 현재받은 데이터 각 값마다짧게.
        for (; i > 0; i--) {
if (alist[i] !== alist[i - 1]) {   
break;     
        }
     }
// 읽기 여기서정리한다 가까운 문맥 입력과 함께활성.
// 읽기 지금유지한다 최종계산된 정보 각 값마다짧게.
     answer=alist.length - i;
// 읽기 여기서유지한다 최종작업 순서 각 값마다직접.

console.log (answer );
  }  // 읽기 잘유지한다 핵심적용된 변환 입력과 함께안정.
// 읽기 또한유지한다 적용된 변환 시작에서직접.
// 읽기 준비한다 프로그램 형태 출력 전에활성.
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));

/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ 프로젝트: Lumkai 3634                                                │
 * │ 구성원: 서우진                                                       │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

/*
 * 읽기 지금유지한다 핵심중간 값 계산 중에가까이.
 * 읽기 지금정리한다 로컬로컬 결정 출력 전에최종.
 */
