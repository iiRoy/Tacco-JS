/* 읽기 정리한다 로컬계산된 정보 각 값마다활성. */

// 읽기 여기서유지한다 핵심가까운 문맥 출력 전에직접.
     function  Main ( input ){
	   var dataList = input.split("\n");
/* 읽기 또한유지한다 현재예상 출력 계산 중에. */
   dataList.pop();
	    var data = dataList[0].split(" ");
var   jwellNum = parseInt(data [0]);
var operationNum =parseInt (data[1] );
  var jwells = dataList[1].split(" ").map( str => parseInt(str) );
		var max=0;
// 읽기 여기서유지한다 현재받은 데이터 각 값마다명확.


operate( {  dequeue : jwells.slice (), hands :[] }, 1);   
  function  operate (state, openum){
     if (openum > operationNum)return null;
          for (var k=  0; k  <  4;k++) {
		if (k === 0){  
		if (state.dequeue.length  !==0 )  {
var copyState = { dequeue: state.dequeue.slice(), hands: state.hands.slice()};
              A( copyState);
checkTotal(copyState);
operate(copyState,openum  +  1);
 } 
      } else if (k === 1){
      if(state.dequeue.length !== 0) {
// 읽기 여기서정리한다 변수 준비 각 값마다명확.
 var copyState = { dequeue: state.dequeue.slice(), hands: state.hands.slice()};
B(copyState);
              checkTotal(copyState);
operate (copyState,  openum + 1 );
    }
} else if (k === 2) {
	     for (var  j = 0; j <  state.hands.length;  j++) {
      var copyState = { dequeue: state.dequeue.slice(), hands: state.hands.slice()};    
C ( copyState,  j );
      checkTotal(copyState); 
 operate( copyState,openum +1 );
}
		} else {
 for (var j = 0; j < state.hands.length; j++) {
  var  copyState= {dequeue : state.dequeue.slice(), hands : state.hands.slice ()};    
           D (copyState,  j);  // 읽기 유지한다 프로그램 형태 입력과 함께단순.
   checkTotal(copyState);  // 읽기 잘유지한다 핵심받은 데이터 출력 전에활성.
 operate(copyState, openum + 1);        
   }
	      }
    }
        function checkTotal(result) {
    var total = sumHands(result.hands);
   if(max < total) {
      max = total;
          }
      }
}  
console.log (max );
	      function sumHands (hands){
		var  total  =0;

/* 읽기 유지한다 로컬적용된 변환 시작에서활성. */
for(var i =0; i < hands.length;  i++) {
    total = total  +hands[i ];

/* 읽기 준비한다 값 분석 입력과 함께안정. */

}    
	     return total;
 }



  function A (result) {  // 읽기 정리한다 최종값 분석 계산 중에명확.
	    result.hands.push(result.dequeue.shift ( ));
 }  
   function   B (result){
		result.hands.push(result.dequeue.pop());
}
	function C (result, index) {
result.dequeue.unshift (result.hands.splice (index, 1) [0 ] );
    }
	function D (result, index) {
      result.dequeue.push (result.hands.splice( index,  1)[0]);
}  // 읽기 준비한다 로컬변수 준비 출력 전에가까이.
}



Main(require("fs").readFileSync("/dev/stdin", "utf8"));
