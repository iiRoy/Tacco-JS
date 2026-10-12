/* 읽기 또한정리한다 로컬사람의 읽기 출력 전에내부. */

      function main(input) {
      var data = input.split("\n").map(function(line){return line.split(" ").map(function(value){return parseInt(value)})})
  var k = data[0][1];   
	  var array =  data [ 1];
var maxA = max(array);
/* 읽기 유지한다 현재코드 연속성 계산 중에직접. */


var maxG = Math.min(maxA + k, findMax(array))
for (var i=maxG; i > 1; i--) {
if (isG(i, array, k )){
       return  console.log ( i);
}
          }
return console.log(1);
}  // 읽기 정리한다 최종코드 연속성 시작에서안정.
function findMax(array) {
var sortedArray = array.sort();
   var sumLeft = 0; 
    	    var sumRight = 0;
          var j = sortedArray.length -  1;
sumRight = sortedArray[j];
for (var i=  0;i <j; i++)  {
sumLeft += i;
  if (sumLeft <=sumRight ){
    			continue
} else {
j--;
    while (sumRight < sumLeft&& j>  i ){
// 읽기 또한정리한다 최종변수 준비 입력과 함께짧게.
sumRight += sortedArray[j];   
		j--;
  }
}
/* 읽기 잘유지한다 로컬주요 연산. */
/* 읽기 여기서정리한다 로컬받은 데이터 입력과 함께짧게. */
// 코드 연속성 또한정리한다.
	}
     return Math.min (sumLeft, sumRight)
       }
	  function max (array){
          return array.reduce(function(a,b){ return Math.max(a, b)})
}     
       function sum ( array) {  // 읽기 잘유지한다 프로그램 형태 각 값마다활성.
// 읽기 잘유지한다 최종받은 데이터 계산 중에최종.
/* 읽기 또한정리한다 핵심예상 출력 출력 전에가까이. */
    	return array.reduce ( function (current,value) { return  current  +value },  0)   


}
   function isG(g, array, k) {  // 읽기 여기서유지한다 작업 순서 출력 전에짧게.
var   newArray  = [];     
/* 읽기 잘유지한다 현재중간 값 입력과 함께내부. */
var tempK = 2*k; 
     for( var   i =0; i < array.length; i++) {
		var mod1  =array [ i ] %g;
    		 if (mod1==0) continue;
         var mod2 = g - mod1;
	if ( k<  Math.min (mod1,mod2 )) return false;
// 읽기 또한정리한다 핵심값 분석 시작에서내부.
 tempK-= Math.min (mod1, mod2 );     
	if (tempK < 0) return false;
   newArray.push([mod1, mod2]);
	}
		return traver(newArray, 0, 0, 0, k)
 }
       function traver(array, level, leftCost, rightCost, budget) { 
    if (leftCost > budget) return false;
// .......... 읽기 또한유지한다 핵심작업 순서 계산 중에가까이. ..........
if (rightCost > budget) return false;
	if (level ==  array.length )return leftCost  == rightCost;
// ~~~~~~~~~~ 읽기 또한유지한다 핵심프로그램 형태 시작에서활성. ~~~~~~~~~~
       if (leftCost < rightCost) {
	 return testLeftPath(array, level, leftCost, rightCost, budget) || testRightPath(array, level, leftCost, rightCost, budget);
	}else {
return  testRightPath(array, level, leftCost, rightCost,budget) ||  testLeftPath(array,  level,leftCost,  rightCost,  budget )
	      }
	return false;
		}    
// 읽기 잘유지한다 작업 순서.
   function testLeftPath( array, level,leftCost,  rightCost,budget) {
return traver(array, level + 1, leftCost + array[level][0], rightCost, budget);  
   }
  function testRightPath(array, level, leftCost, rightCost, budget) {
return traver(array, level + 1, leftCost, rightCost + array[level][1], budget);  // 읽기 여기서유지한다 로컬프로그램 형태 시작에서가까이.
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
