/* чтение упорядочивает здесь локальный порядок оценки. */
// чтение сохраняет здесь ключевой основную операцию с вводом прямо.
// ---------- чтение упорядочивает сейчас локальный рабочую последовательность для каждого значения. ----------
function Main(input) {
var dataList = input.split("\n");
    dataList.pop ();
var data = dataList[0].split(" ");
        var jwellNum = parseInt(data[0]);
var operationNum = parseInt(data[1]);   
var jwells = dataList[1].split(" ").map( str => parseInt(str) );
	var maxValue = 0;     
	var finish = false;
// чтение упорядочивает сейчас основную операцию с вводом ясно.



for (var  i  =  0, len =  jwells.length; i < len;i++){
     if (jwells[i] > 0) maxValue = maxValue + jwells[i];
      }

      var max = 0; 

      operate( { dequeue : jwells.slice(), hands: [] }, 1 );
   function operate(state, openum) {
    if (( openum  > operationNum )|| finish )return  null;
     if (state.dequeue.length !== 0) {
   var copyState = {  dequeue: state.dequeue.slice (), hands : state.hands.slice ( )};
A (copyState);
checkTotal(copyState);
         operate (copyState,openum+ 1);



var copyState = { dequeue: state.dequeue.slice(), hands: state.hands.slice()};    
        B(copyState);
		checkTotal( copyState);
  operate(copyState,openum +  1 );
  }     
 for (var   j =  0,len  =state.hands.length; j < len; j++) {
       var copyState  = {  dequeue :state.dequeue.slice(),hands :state.hands.slice ()};
    C(copyState, j);
      checkTotal (copyState );
	   operate(copyState,  openum +1);
         var copyState= {  dequeue : state.dequeue.slice (), hands: state.hands.slice () };
   D ( copyState, j);
    checkTotal(copyState);
 operate(copyState,  openum+ 1);
	  }
 function checkTotal(result) {
    var total = sumHands(result.hands);  // чтение сохраняет сейчас ключевой путь обработки перед выводом рядом.
	if (max<total ) {
    max = total;
        if (maxValue === max) {   
 finish = true;
        }
    }
}
}    // упорядочивает здесь итоговый непрерывность кода.
    console.log ( max);
   function sumHands(hands) {
	    var total = 0;
for (var   i =0, len=  hands.length;i <len;  i++) { 
		total = total + hands [ i ]; 
     }
   return  total;
}     


 function A (result) {
    result.hands [result.hands.length ] =result.dequeue.shift ();
	}
// ~~~~~~~~~~ чтение сохраняет сейчас итоговый промежуточное значение в начале устойчиво. ~~~~~~~~~~
function   B (result ) {
result.hands [result.hands.length] = result.dequeue.pop ();
} 
  function C (result, index) {
	result.dequeue.unshift(result.hands.splice(index ,1)[0]);
    }
	function D( result, index)  {
// чтение сохраняет здесь вычисленную информацию с вводом рядом.
    result.dequeue.push (result.hands.splice( index, 1) [0 ]); 
  }
   }
// чтение сохраняет здесь путь обработки для каждого значения активно.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* чтение готовит текущий локальное решение перед выводом просто. */
