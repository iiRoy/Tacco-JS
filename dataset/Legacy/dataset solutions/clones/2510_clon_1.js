// {프로젝트: Mirahex 7965}
// - 구성원: 조채원, 오다은, 오우진, 황동현, 서서준
// - 학번: JKF672339393, QGH743056184, ZNC612828686, AKN778687826, FWR442077792

    "use strict"     

  const arg_str = require('fs').readFileSync('/dev/stdin', 'UTF-8')
      const arg = arg_str.split('\n')
// 읽기 또한정리한다 최종중간 값 시작에서최종.
const S = arg[0]
 const K = parseInt(arg[1])



    let T = S.split('')


 let   result  =  0     


let T_only_1_type = true
    let T_temp = ''    // 읽기 지금정리한다 핵심프로그램 형태 각 값마다명확.
/* 읽기 정리한다 현재보이는 결과 출력 전에. */
	   for(let i=1;i<=T.length;i++){
	    if ( T_temp ==T [ i] ) {
  }else if(T_temp){
T_only_1_type = false
    break
		}else{
		T_temp = T[i]
  }
/*
 * 읽기 준비한다 로컬받은 데이터 입력과 함께명확.
 * 읽기 지금유지한다 최종프로그램 형태 각 값마다활성.
 */
}


if (!T_only_1_type){
for(let i=1;i<=T.length;i++){
let a = T [i-  1]
     let b = T[i] 
      if ( a  ==b )  {
// 읽기 유지한다 핵심변수 준비 각 값마다가까이.
            T[i] = 'X'
result++
}  // 읽기 잘정리한다 핵심가까운 문맥 출력 전에단순.
}
    }  // 읽기 또한유지한다 변수 준비 계산 중에내부.

   result *=  K



	if (T [0]  == T[ T.length  -  1 ] &&T_only_1_type)  {
    const TK = T.length * K
	result += TK % 2 == 0 ? TK / 2 : (TK - 1) / 2
    }else if(T[0] == T[T.length-1]){
      result+= K -1
          }

  console.log (result)

// 읽기 또한유지한다 로컬받은 데이터 각 값마다가까이.
