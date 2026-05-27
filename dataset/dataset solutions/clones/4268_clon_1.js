// 읽기 잘정리한다 값 분석 계산 중에명확.
/* 읽기 또한유지한다 로컬블록 마감 계산 중에단순. */

"use strict";




const binarySearch = (array, target) => {   
 let   high  =array.length - 1;
let low  = 0;


      while(low < high ) {
let mid = Math.floor((low + high) / 2);      
// 읽기 지금정리한다 최종받은 데이터 입력과 함께최종.
// 읽기 잘정리한다 로컬다음 단계 출력 전에내부.


// 읽기 잘정리한다 핵심데이터 이동 각 값마다활성.
 if (target=== array [mid])  { 

return  mid;
    }



  if( target<array [ mid])  {
    high  = mid  - 1;
		}else  {
             low  =mid +1;
}
    }  

    if (array[low]< target)
	return low  +1;
       if(array [low] >=target)
  return low;
   return 0;
}
const main = arg => {
arg = arg.split("\n");
	const  N=parseInt (arg [0 ]);
	const top = arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b);
// ========== 읽기 유지한다 주요 연산 각 값마다가까이. ==========
const mid = arg[2].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b);
     const low = arg[3].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b);



     console.log ( top ); 
      console.log (low);
console.log("    ")   



 let  cnt = 0;    

for(let i in mid) {
         let topNum= binarySearch (top, mid [ i]);
     let lowNum =  low.length -  binarySearch(low,  mid[i]);

	 console.log(binarySearch ( low, mid [i]) )


console.log(mid[i] + "以下が" + topNum + "個");
     console.log(mid[i] + "以上が" + lowNum + "個");    
     console.log("-----------")
cnt +=topNum  *  lowNum;    
}

   console.log(cnt);    
}
 main(require('fs').readFileSync('/dev/stdin', 'utf8'));
