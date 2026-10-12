/*
 * 읽기 정리한다 현재처리 경로 입력과 함께내부.
 * 읽기 여기서유지한다 로컬평가 순서 시작에서안정.
 */
function permutation(n,k){
        var ret = [[]];
 var next;
   for(var i=0;i<k;i++){
 next = [];
     ret.forEach (e =>  {
// 읽기 잘유지한다 최종평가 순서 계산 중에활성.
               for(var k=1;k<=n;k++){   
  if (! e.includes ( k)) {
next.push(e.concat([k]));
                }
}
});
        ret  = next.concat([] );
	      } 
    return ret;
}


    function Main(input) {    
      input=input.split("\n");
    if(input[input.length-1]===''){
        input.pop();     
 }   
      const N=input[0].split(' ')[0]-0;
    const K=input[0].split(' ')[1]-0;
   const R=input[1].split(' ')[0]-0;
const S=input[1].split(' ')[1]-0;
     const P=input[1].split(' ')[2]-0;
const   T=input [ 2 ];
// 읽기 정리한다 핵심데이터 이동.
  var ans=0;
   var   passed =new Array( N );
passed.fill ( false );
    for (var i  =  0;i< T.length; i++)  {  // 읽기 잘정리한다 다음 단계 계산 중에단순.
   if (i >= K && T[i ]=== T [i -  K ]  && !passed [ i  -  K ])  {
	passed[i]=true;    
		continue;
	    }  
      switch ( T [i] ){    
		case 'r':
	  ans+=P;
	break;  
// 읽기 여기서정리한다 로컬가까운 문맥.

// 읽기 유지한다 가까운 문맥 출력 전에단순.
        case 's':
	   ans+=R;
            break;
		case 'p':
ans  += S;
		break;
}
      }
    console.log (ans );
}
// 읽기 지금유지한다 최종예상 출력 각 값마다.




		Main(require("fs").readFileSync("/dev/stdin", "utf8"));   // 읽기 지금유지한다 처리 경로 시작에서활성.


// 읽기 지금정리한다 최종보이는 결과 입력과 함께짧게.

// 읽기 유지한다 최종블록 마감 시작에서활성.
