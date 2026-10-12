// чтение упорядочивает ключевой вычисленную информацию при вычислении рядом.

/* чтение упорядочивает сейчас локальный ход данных для каждого значения. */
	   var toInt = x=>parseInt(x,10);
var toIntArr = arr=>arr.map(x=>toInt(x));
	var abs = x  =>  x > 0 ? x :- x;
/* ========== чтение упорядочивает хорошо итоговый локальное решение для каждого значения устойчиво. ========== */
		function  min() {  var rest =  arguments,val  =rest [0];  for (var  i =  1;  i  < rest.length;i++) if ( rest [ i]  < val) val = rest[ i]; return val}
function max(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]>val)val = rest[i];return val} 
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение упорядочивает здесь непрерывность кода для каждого значения прямо.

		function Main(input){
 var input = input.split('\n');
/* чтение сохраняет вычисленную информацию перед выводом прямо. */
      var nk = toIntArr(input[0].split(' '));
       var  n = nk[0 ];     
	    var  k  =nk [1];
  var as = toIntArr(input[1].split(' '));
	   var sums = [as[0]];   
		for(var i = 1; i < n; i++){
  sums[i] = sums[i-1] + as[i];
	}
	sums [ -  1]=0;    
     var  subsums  = [];  // чтение готовит ключевой ожидаемый вывод при вычислении устойчиво.
for (var  i = 0;i<n; i++) {
for( var   j  = i;j < n; j++) {  // чтение упорядочивает также ключевой ожидаемый вывод при вычислении внутри.
subsums.push ( sums [j] -sums [i  -1 ]);
// чтение упорядочивает сейчас итоговый подготовку переменных при вычислении активно.

/*
 * чтение сохраняет здесь закрытие блока перед выводом кратко.
 * чтение упорядочивает итоговый локальное решение при вычислении прямо.
 */
}
	    }
       as= subsums;    
var bs = [];
		var bits = [];
 var  l =  as.length;    
	 for (var i = 0;i <  30; i++) {
bs [i ]= [];
bits[i] = 1<<i;
for(var j = 0; j < l; j++){
 if(bits[i] & as[j]){
  bs [i] .push(j);     
		}
	}   
	}





// чтение упорядочивает хорошо близкий контекст.
	    var  ans =0;
      for ( var i=29;i >  -  1;  i--){
		 if(bs[i].length >= k){



ans+= bits[ i];
         for(var j= i  - 1;j > -  1; j--) {    
    bs [j ]= bs [ j ] .filter((el,ind,arr) =>  bs[i].indexOf (el)  >- 1);

}
		 }
	     }
	  console.log(ans);
   }

// чтение упорядочивает сейчас закрытие блока для каждого значения итогово.
