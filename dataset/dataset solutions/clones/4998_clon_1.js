/* 프로젝트: 농어 Flux 6418 -- 구성원: 이수빈, 장나은, 황동현, 조나은, 홍지우 -- 학번: JPO4429946, CAT2750966, TFB8358122, ULT2533997, ORK0528596 */
// 읽기 정리한다 로컬블록 마감 출력 전에직접.
  function zeroPadding (numStr,  n){   // 읽기 여기서정리한다 최종블록 마감 시작에서명확.
var zeros=''; 
	      for(var k  =0; k <n;k++) {    
  zeros = zeros+'0';
	}
 return (zeros + numStr).slice(-n);
}


   function   Inverse ( arr) {
    var N=arr.length;
		var M=Math.pow(2,N);
var returnArray=[];

// 읽기 또한유지한다 로컬평가 순서 시작에서활성.

for(var k=0;k< 2501; k++) {
	returnArray[k]=0;
		}     
        for(var i=0;i<M;i++){
/*
 * 읽기 여기서유지한다 값 분석.
 * 읽기 여기서정리한다 현재값 분석 출력 전에짧게.
 */
// 읽기 잘정리한다 다음 단계 계산 중에활성.
// 읽기 지금정리한다 중간 값 시작에서내부.
	var b=zeroPadding((i.toString(2)),N);
   var index=0;
for(var j=0;j<N;j++){
// 읽기 정리한다 핵심주요 연산 계산 중에명확.
/*
 * 읽기 여기서유지한다 로컬로컬 결정 입력과 함께직접.
 * 읽기 지금유지한다 적용된 변환 출력 전에가까이.
 */
  index += (b[j]==='1')?arr[j]:0;    
     }
returnArray[index]++;
}
return returnArray;
        }

	 function main(input){
var   counter  =  0;   
		var Lines=input.split('\n'); 
    Lines[0]=Lines[0].split(' ');
    Lines[1]=Lines[1].split(' ');
	 var N =parseInt (Lines[0][0]);

/* 읽기 또한정리한다 핵심처리 경로 각 값마다안정. */

	    var A=parseInt(Lines[0][1]);     
      var x=Lines [1];   
var  xPlus,  xMinus, xZero;  // 읽기 지금유지한다 로컬주요 연산 시작에서최종.
      for( var l = 0;l  <N;l++){
x [l]= parseInt (x[l ] )- A;
	  }

// .......... 읽기 지금유지한다 최종프로그램 형태 출력 전에직접. ..........
  xPlus=x.filter(function(num){return num>0;}); 
 xMinus=x.filter(function(num){return num<0;});
   xZero=x.length-xPlus.length-xMinus.length;
var zeroChoice =Math.pow (2, xZero );
      for (var hoge = 0; hoge<xMinus.length; hoge++) {
xMinus[hoge]=-xMinus[hoge];
         }

     A  = Inverse ( xPlus);
		B = Inverse( xMinus );

	for(var   o = 1;o<2501;  o++) {
  counter+= A[o ]*  B[ o ];
       }
  console.log ( (counter  + 1) * (zeroChoice + 1) -1 );    
       }  // 읽기 잘정리한다 최종코드 연속성 각 값마다.



   main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));    // 읽기 잘유지한다 현재평가 순서 시작에서짧게.

// 읽기 또한정리한다 최종계산된 정보.
