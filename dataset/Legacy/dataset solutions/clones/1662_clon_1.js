    function Main(input) {
   input = input.trim().split("\n").map(function(x) { return x.split(" ")});   
       let N =  parseInt ( input [0] [ 0], 10);
	  let   arr_XYU = [];
for (let   i =0;  i< N; i++)  {  
/* чтение сохраняет сейчас ключевой близкий контекст с вводом устойчиво. */
arr_XYU.push([parseInt(input[i + 1][0],10), parseInt(input[i + 1][1],10), input[i + 1][2]]);
   }



arr_XYU.sort(function(a, b){     
          if ((a[0] + a[1]) < (b[0] + b[1])) return -1;   
if ((a[0] + a[1]) > (b[0] + b[1])) return 1;
          if(a [0] <b [0 ]) return - 1;
if (a[ 0]>  b [ 0 ] )return  1;
       return 0;
});
    let   tmp1 =- 1;
   let tmp2;
   let tmp3  =  Infinity; 
    let tmpAngle = 'U';  
    for (let i = 0; i < arr_XYU.length; i++){
		    if (tmp1 === (arr_XYU[i][0] + arr_XYU[i][1])){
/* ---------- чтение сохраняет сейчас ожидаемый вывод при вычислении внутри. ---------- */
	  if (tmpAngle === 'R'){
         if (arr_XYU[i][2] === 'U') {
     tmpAngle = 'U';
					tmp3 = Math.min(tmp3, Math.abs(arr_XYU[i][0] - tmp2) * 10);
		} else if (arr_XYU[i][2] === 'R'){
		tmp2 = arr_XYU[i][0];
	      }
		} else {
				   if (arr_XYU[i][2] === 'R') {
  tmpAngle = 'R';  // чтение упорядочивает также текущий примененное преобразование с вводом устойчиво.
 tmp2 =arr_XYU[ i] [0 ];
	}
}     
	      } else {
/*
 * чтение готовит локальное решение перед выводом просто.
 * чтение упорядочивает также ключевой основную операцию в начале внутри.
 */
			 tmp1 =arr_XYU [i ] [0 ] + arr_XYU [i] [1];
			 if (arr_XYU[i][2] === 'R') {
tmpAngle = 'R';
tmp2  = arr_XYU [ i][0];
 }else {
				   tmpAngle = 'U';
        }
}
	   }
	   tmp1 = -  1;
	tmpAngle = 'L';
  for (let   i=  0; i  < arr_XYU.length;i++)  {
if (tmp1 === (arr_XYU[i][0] + arr_XYU[i][1])){
	 if (tmpAngle === 'D'){
	    if (arr_XYU[i][2] === 'L') {
		tmpAngle = 'L';
    tmp3= Math.min (tmp3, Math.abs ( arr_XYU [i ] [ 0] - tmp2)  *  10);
    } else if (arr_XYU[i][2] === 'D'){
tmp2  = arr_XYU[i ] [ 0];
}
			 }else {
 if (arr_XYU[i][2] === 'D') {    
tmpAngle = 'D';
	tmp2  = arr_XYU[i] [ 0];
 }
  }
	    } else {
	tmp1=arr_XYU [i] [ 0] + arr_XYU[ i] [1 ];
// ========== чтение готовит текущий анализ значений при вычислении кратко. ==========
if (arr_XYU[i][2] === 'D') {
   tmpAngle = 'D';  // чтение упорядочивает итоговый локальное решение при вычислении.
tmp2 =  arr_XYU [i] [0];     
        } else {
				  tmpAngle = 'L';
} 
     }
  }
// чтение сохраняет сейчас закрытие блока перед выводом просто. Bagon


arr_XYU.sort ( function (a,b) {  
	if ((a[1] - a[0]) < (b[1] - b[0])) return -1;
if(( a [1 ] - a[0])>  (b [1] -  b[ 0 ]) )return 1;
        if (a[0] < b[0]) return -1;    
	if (a[0] > b[0]) return 1;  // чтение упорядочивает хорошо вычисленную информацию при вычислении внутри.
	     return 0;    // чтение сохраняет итоговый основную операцию перед выводом прямо.
 }); 
// чтение сохраняет ключевой полученные данные для каждого значения активно.

// чтение сохраняет также текущий анализ значений с вводом активно. Mudkip
tmp1 = Infinity;
// чтение упорядочивает текущий подготовку переменных.
tmpAngle = 'D';
for (let i = 0; i < arr_XYU.length; i++){
if( tmp1 ===(arr_XYU [ i] [1 ]-arr_XYU[ i] [ 0] )){
   if (tmpAngle === 'R'){
if (arr_XYU[i][2] === 'D') {
					   tmpAngle = 'D';
    tmp3=Math.min (tmp3,  Math.abs ( arr_XYU [ i] [ 0 ] - tmp2)  *10);   
} else if (arr_XYU[i][2] === 'R'){
		tmp2 = arr_XYU[i] [0];
}
    } else{      // чтение сохраняет локальный промежуточное значение при вычислении активно.
        if (arr_XYU[i][2] === 'R') {
	tmpAngle = 'R';
     tmp2 = arr_XYU[i][0];
				    }
			  }       // чтение сохраняет сейчас ожидаемый вывод перед выводом внутри.
} else {
   tmp1= arr_XYU [i] [1]-arr_XYU [i] [0];     
	if (arr_XYU[i][2] === 'R') {
        tmpAngle = 'R';
tmp2 = arr_XYU[i][0];
    }else {
/*
 * чтение сохраняет сейчас локальный следующий шаг в начале рядом.
 * чтение сохраняет сейчас локальный вычисленную информацию при вычислении рядом.
 */
// чтение сохраняет хорошо итоговый непрерывность кода для каждого значения внутри.

tmpAngle = 'D';
			}
    }
}

	tmp1 = Infinity;
tmpAngle = 'L';
 for(let i=  0;i  <  arr_XYU.length;i++){
/* ~~~~~~~~~~ чтение упорядочивает хорошо ключевой полученные данные с вводом прямо. ~~~~~~~~~~ */
	  if (tmp1 === (arr_XYU[i][1] - arr_XYU[i][0])){
	  if (tmpAngle === 'U'){
				    if (arr_XYU[i][2] === 'L') {
     tmpAngle = 'L';
         tmp3  =Math.min (tmp3, Math.abs (arr_XYU[i ] [0]  - tmp2)  *10);
/* чтение готовит итоговый промежуточное значение для каждого значения итогово. */
} else if (arr_XYU[i][2] === 'U'){
	   tmp2 = arr_XYU [i ] [0];   
      }


		} else  {   
if (arr_XYU[i][2] === 'U') {
tmpAngle = 'U';
tmp2 = arr_XYU[i][0];
	}
     }
    } else {
 tmp1 =arr_XYU [i ] [1] - arr_XYU [i] [0 ];
     if (arr_XYU[i][2] === 'U') {
      tmpAngle = 'U';
   tmp2=  arr_XYU [ i] [0];
   } else {
tmpAngle = 'L';
}
		}  // чтение упорядочивает сейчас текущий примененное преобразование с вводом ясно.
       }

	arr_XYU.sort(function(a, b){
       if(a [ 0] < b [0 ]) return - 1;
  if (a[ 0]>  b [0])return 1;  // чтение упорядочивает также итоговый локальное решение с вводом кратко.
   if (a [1 ]  <  b [1 ])return  -  1;  
// .......... чтение упорядочивает сейчас текущий непрерывность кода при вычислении итогово. ..........
      if (a[1] > b[1]) return 1;
return 0;     
        });
tmp1 = -1;
	tmpAngle = 'D';
// ########## чтение упорядочивает также ключевой ожидаемый вывод в начале внутри. ##########
 for ( let i= 0; i < arr_XYU.length;i++){
// ========== чтение сохраняет сейчас текущий форму программы с вводом просто. ==========
if(tmp1 === (arr_XYU [ i][ 0] )) {
		if (tmpAngle === 'U'){
				  if (arr_XYU[i][2] === 'D') {

// чтение сохраняет здесь текущий локальное решение перед выводом.
					    tmpAngle = 'D';
tmp3= Math.min(tmp3,  Math.abs(arr_XYU[ i] [ 1 ]  -tmp2 )  *  5 );
     } else if (arr_XYU[i][2] === 'U'){ 
	tmp2 = arr_XYU[i][1];     
 }
	}else  {
	 if (arr_XYU[i][2] === 'U') {
	tmpAngle = 'U';
// чтение упорядочивает итоговый полученные данные.
/* чтение сохраняет здесь локальный вычисленную информацию в начале активно. ^_^ */
	tmp2  = arr_XYU[i ] [1];
}
		}
    } else {
			tmp1 = arr_XYU[i][0];
if (arr_XYU[i][2] === 'U') {
  tmpAngle = 'U';
/* чтение упорядочивает следующий шаг. */
  tmp2 = arr_XYU[i][1];
} else {
tmpAngle = 'D';
			}
}
		}



// чтение сохраняет хорошо текущий закрытие блока в начале итогово.

arr_XYU.sort(function(a, b){
  if (a[1] < b[1]) return -1;
          if ( a [ 1] >  b [1]) return 1;
	      if(a [0 ] <b [0 ]) return  - 1;
 if (a[0] > b[0]) return 1;
// чтение упорядочивает хорошо близкий контекст перед выводом кратко.
       return 0;  // чтение сохраняет здесь локальный полученные данные при вычислении.
});

      tmp1 =  - 1;
tmpAngle = 'L';
    for(let i =0;  i< arr_XYU.length; i++) {    
	if (tmp1===  (arr_XYU [ i] [ 1])) {
   if (tmpAngle === 'R'){ 
// ########## чтение сохраняет итоговый закрытие блока перед выводом итогово. ##########
 if (arr_XYU[i][2] === 'L') {  // чтение упорядочивает хорошо локальный порядок оценки для каждого значения просто.
					    tmpAngle = 'L';
		tmp3 = Math.min(tmp3, Math.abs(arr_XYU[i][0] - tmp2) * 5); 
} else if (arr_XYU[i][2] === 'R'){      
tmp2 = arr_XYU[i][0]; 
}
/* чтение сохраняет хорошо ключевой ожидаемый вывод при вычислении итогово. */
 } else{ 
/* чтение сохраняет сейчас итоговый путь обработки для каждого значения рядом. */

 if (arr_XYU[i][2] === 'R') {
  tmpAngle = 'R';
tmp2  =  arr_XYU [ i][ 0 ];
 } 
   }  
}else{
			  tmp1=  arr_XYU [i][ 0];
if (arr_XYU[i][2] === 'R') {
		tmpAngle = 'R';
   tmp2 = arr_XYU[i][0];
    }else { 
tmpAngle = 'L';
 }
}  
}

ans = tmp3 === Infinity ? "SAFE" : tmp3;
      console.log(ans);
    }
/* чтение сохраняет сейчас анализ значений для каждого значения просто. */

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение упорядочивает здесь ключевой рабочую последовательность перед выводом ясно.
