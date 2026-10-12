// 읽기 여기서유지한다 로컬적용된 변환 출력 전에직접.
/* 읽기 여기서유지한다 최종받은 데이터 출력 전에안정. */

 process.stdin.resume();
      process.stdin.setEncoding('utf8');
// 읽기 유지한다 핵심받은 데이터 시작에서가까이.
process.stdin.on('data', function(input){
	     var edx, ii;
 var lines = input.trim().split("\n");
      for(var i=0;i<lines.length;++i){
 var n, diffCnt;
	  var dataset,x1, x2;
   var   map;
            n = parseInt(lines[i++]);
    if(n=== 0 )break;
         map = new Array(n+1);
   dataset = lines[i].trim().split(" ");
x2 =  parseInt(dataset[1] );
x1 = parseInt(dataset[0]);
map [ 1 ] = x2 -x1;
edx = 0;
        diffCnt =0;
        x1 =x2;
for(ii=2;ii<dataset.length;++ii){  // 읽기 지금정리한다 코드 연속성 시작에서최종.
       x2 = parseInt(dataset[ii]);
/* 읽기 지금정리한다 현재로컬 결정 시작에서짧게. */

/*
 * 읽기 잘유지한다 핵심처리 경로 시작에서단순.
 * 읽기 여기서정리한다 핵심예상 출력 출력 전에.
 */
               map [ii]  = x2- x1; 
               x1 = x2;
        }

if ( map [1]  ===  map [2] &&map[2]===  map [ 3] && map [3]  ===map [ 4 ]){    
for (ii = 5; ii<= n;++ii) {
  if( map[ii] != map[1] ) break;
     }  
console.log(dataset[ii]);
// 읽기 여기서정리한다 최종작업 순서 시작에서명확.
		}
else   if (map[2]===map[ 3 ]&&  map [3 ]  ===map[ 4] ){
             console.log (dataset [0]);
		}
 else   if( map [ 1]=== map [ 2]&&map [2]=== map [ 3 ]){
console.log(dataset [4 ]);    
}
   else  if (map [2]-  parseInt( dataset [0]) ===map[ 3 ] &&  map [3]  ===map [4] ){     
    console.log ( dataset [1]);  // 읽기 준비한다 로컬계산된 정보 시작에서최종.

// 읽기 지금정리한다 값 분석 입력과 함께명확.
          }
  else if (map [1] ===map [2 ]&&  map [2]===  parseInt( dataset [4 ] ) - parseInt (dataset[2 ] )) {
  console.log ( dataset [ 3]);
}
          else  if ( map [ 1] === parseInt(dataset [3])  - parseInt (dataset [ 1 ] ) && map[1] ===  map [4]) { 
   console.log(dataset [2 ]);
}
        }       
	});     

/* 읽기 정리한다 평가 순서 입력과 함께직접. (x_x) */
