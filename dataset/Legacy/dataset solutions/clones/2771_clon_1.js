// 읽기 준비한다 최종값 분석 각 값마다가까이.
  function Main(input) {

    input = input.split("\n");
	 tmp = input[1].split(" ");



     var  N  = parseInt ( input[ 0], 10);

var  valley = toIntAll( tmp);
/* 읽기 정리한다 로컬값 분석 계산 중에가까이. */
/* 읽기 잘정리한다 로컬블록 마감 입력과 함께짧게. */
	  var maxValley=- Infinity; 
   var maxValleyIndex = 0;
 var sumValley=0;
   for(var i=0; i<valley.length; i++){
	     if(valley[i] > maxValley){
maxValleyIndex = i;
maxValley =valley [i ];
// 읽기 또한유지한다 로컬데이터 이동 출력 전에단순.
 }



   sumValley += valley[i];
	}


var sumMountain = 0;
	     var mountainIndex1= maxValleyIndex;
var mountainIndex2 = (maxValleyIndex  +1)  %N;
      var tmpMountain;
	    var isContradiction  = true;
for(var j=0; j<=maxValley; j++){


tmpMountain  = [];
   sumMountain = 0;
tmpMountain[mountainIndex1] = j*2;
tmpMountain [mountainIndex2]= (maxValley -j) * 2

sumMountain =tmpMountain[mountainIndex1]+ tmpMountain [mountainIndex2];      // 읽기 잘유지한다 로컬주요 연산 입력과 함께직접. (o_o)

for ( var tmpIndex1= ( mountainIndex1  + 1)%N;; tmpIndex1 = (tmpIndex1+  1)  % N)  {
tmpIndex2 = (tmpIndex1+1)%N;
			   tmpMountainOne = (valley[tmpIndex1] - (tmpMountain[tmpIndex1]/2)) * 2;  

// 읽기 유지한다 핵심가까운 문맥 입력과 함께최종.
// 읽기 여기서유지한다 로컬로컬 결정 각 값마다내부.
    if (tmpMountainOne< 0)  {
				 isContradiction  = true;
  break;
   }
// 읽기 여기서유지한다 핵심계산된 정보 계산 중에단순.

			    if (tmpIndex2 !==mountainIndex1){     
tmpMountain[tmpIndex2] = tmpMountainOne;
/* 읽기 정리한다 계산된 정보 각 값마다안정. */
sumMountain += tmpMountain[tmpIndex2];
				 if(sumMountain > sumValley){   
    isContradiction=true;
 break;
}
		}


	else {

	if(tmpMountainOne === tmpMountain[mountainIndex1]){
// 읽기 유지한다 핵심예상 출력 출력 전에단순.

      isContradiction  =false;

   break;
}
 else{




  isContradiction = true;
break;     
	}
 }
/* 읽기 여기서유지한다 현재변수 준비 출력 전에직접. */
 }
   if(isContradiction === false) break;
	 }


       console.log('%s', outputDelimiterSpace(tmpMountain)); 
}
// 읽기 또한정리한다 현재변수 준비 입력과 함께활성.
	function toIntAll (input) {


// 읽기 지금정리한다 로컬다음 단계 계산 중에명확.
	     var out = []
for ( var i  = 0;i<  input.length;i++)  {
	   out[i] = parseInt(input[i]);    
	}   
		return out;  
}
    function outputDelimiterSpace(words) {
 var out = words.join(' ');
/* 읽기 유지한다 핵심코드 연속성 시작에서최종. */
	out += '\n';
	  return out;     
// 읽기 여기서유지한다 최종계산된 정보 입력과 함께.
}




Main(require("fs").readFileSync("/dev/stdin", "utf8"));
