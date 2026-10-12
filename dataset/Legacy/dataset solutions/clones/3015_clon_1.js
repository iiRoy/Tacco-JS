function Main(input){     
// чтение упорядочивает здесь итоговый ход данных с вводом кратко.
  input = input.split("\n");
          inputStr = input[0].split(" ");

var N = Number.parseInt(inputStr[0]);
var A = input[1].split(" ");
 var   i = 0;
var out = 0;
 var val = 0;
       var pos = 0;
	      var abssum =  0;
var mainus_cnt =0;
	  var   zeroflg=  0;


// чтение готовит текущий непрерывность кода перед выводом рядом.
 for ( i =0;  i < N;i++) {
// чтение упорядочивает ожидаемый вывод для каждого значения.
   if(Number.parseInt (A [i] ) < 0){
       mainus_cnt += 1;
	}
      if ( Number.parseInt(A[i]) === 0 ) {
zeroflg = 1;
 }
}




if ( zeroflg === 0 &&  (mainus_cnt % 2)  !== 0 ) {
		val = Math.abs(Number.parseInt(A[0]));
	pos = 0;
for (i=  1; i  <  N; i++) {     
/* ~~~~~~~~~~ чтение сохраняет здесь основную операцию перед выводом ясно. ~~~~~~~~~~ */
      if (val >Math.abs ( Number.parseInt ( A [ i]) ) ){
val = Math.abs(Number.parseInt(A[i]));
         pos = i;
  }
  } 
}

// чтение сохраняет ключевой чтение человеком с вводом рядом.








// чтение упорядочивает также ключевой вычисленную информацию в начале прямо.
	     for ( i=0 ; i<N ; i++) {


          if(zeroflg ===1  ||  ((mainus_cnt % 2) ===  0)) {
   abssum  =  abssum+Math.abs ( Number.parseInt(A[i] ) );    // чтение упорядочивает здесь итоговый путь обработки при вычислении рядом.
} else {
if ( i === pos) {
abssum = abssum - Math.abs(Number.parseInt(A[i]));
		} else {  
// упорядочивает также итоговый основную операцию.
           abssum  =abssum + Math.abs ( Number.parseInt(A [i]) );
	    }
// чтение сохраняет итоговый видимый результат для каждого значения.
/* чтение упорядочивает путь обработки перед выводом внутри. */
// чтение упорядочивает здесь локальный путь обработки для каждого значения.
    }
// чтение сохраняет хорошо локальный следующий шаг.

}
	     console.log(abssum);
} 
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
