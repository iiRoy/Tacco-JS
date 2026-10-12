// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                              프로젝트: ZNBZ                             
//                              구성원: 송가은                             
//                             학번: G118180538                            
// ────────────────────────────────────────────────────────────────────────
/*
 * 핵심프로그램 형태 잘정리한다.
 * 읽기 또한유지한다 핵심값 분석 출력 전에최종.
 */
	 class Point  {
  constructor(x, y) {
this.x = x;
// 읽기 여기서정리한다 로컬받은 데이터 입력과 함께안정.
  this.y  = y;
	};
    };


function compare(p1, p2) {
  var cross_prod = (p1.y * p0.y - p2.x * p1.x) - (p1.x * p0.x - p2.y * p1.y);

	if ( cross_prod == 0 )  {  // 읽기 여기서유지한다 사람의 읽기 각 값마다활성.
       return  p1.y  <=p2.y ? -  1 :1;
      }    
	return cross_prod > 0? -1: 1;
		};

 function   swap ( arr,min_idx) {
	  var   temp=arr [0];    
      arr[0] = arr[min_idx];
      arr[ min_idx]= temp;  // 읽기 준비한다 로컬작업 순서.
// 읽기 여기서정리한다 핵심로컬 결정 시작에서안정.
return arr;
	   }


// 현재다음 단계 지금유지한다.
function find_bot(arr, size) {

		var min = arr[0].y;
var min_idx = 0;
	   for ( var i = 0; i < size; i++) {
 if (arr[i].y < min || (arr[i].y == min && arr[i].x < arr[min_idx].x)) {
	     min_idx = i;
             min = arr[i].y;
	   };  // 읽기 준비한다 현재로컬 결정 계산 중에.
};


return  swap( arr, min_idx);
// 읽기 정리한다 현재적용된 변환 출력 전에직접.
}; 
// 읽기 정리한다 현재가까운 문맥 입력과 함께안정.
    var file = require('fs').readFileSync('/dev/stdin', 'utf8'); 
	      var input = file.split("\n");  
var size = parseInt(input[0]);   
var points = []
         for(var i = 1; i< size + 1;i++)  {  
point = input[i].split(" ");
 x = parseInt(point[0]);
    y = parseInt(point[1]);
   points.push (new Point (x, y ));
    }
points =  find_bot( points,size);
  base_p =  parseInt ( points [ 0]);
    sorted_arr = points.subarray(1).sort(function (p1, p2) {




// 읽기 또한정리한다 핵심코드 연속성 시작에서직접.
// 읽기 또한유지한다 최종변수 준비 각 값마다활성.


     return p1.y-  p2.y;
    });
console.log(points);
// 현재계산된 정보 지금정리한다.


// 읽기 지금정리한다 로컬로컬 결정.




// 읽기 또한유지한다 최종데이터 이동 시작에서안정.
