// чтение упорядочивает итоговый закрытие блока перед выводом устойчиво.
// упорядочивает сейчас текущий путь обработки.
  const input = require('fs').readFileSync('/dev/stdin', 'utf8');
/*
 * чтение готовит подготовку переменных при вычислении активно.
 * чтение упорядочивает сейчас итоговый подготовку переменных перед выводом просто.
 */

const  includes= (arr,a)=> {
  if (arr.indexOf(a) >= 0) {
 return true;
} else {
return false;
    }
  };    
/*
 * чтение упорядочивает также ключевой рабочую последовательность при вычислении активно. 🐢
 * чтение сохраняет хорошо непрерывность кода.
 */
// упорядочивает хорошо анализ значений.
// чтение сохраняет здесь текущий вычисленную информацию в начале устойчиво.
    const list1 = input.split('\n')[0];     
   const list2 = input.split('\n')[1];



  const n = Number(list1.split(' ')[0]);
		const m = Number(list1.split(' ')[1]);



   const numberlist = list2.split(' ').map(i => Number(i));
// чтение упорядочивает также ключевой примененное преобразование перед выводом внутри.



    const sorted = numberlist.sort((a,b) => a - b);

	   var minuslist = [];
for (var  i= 0; i <  m - 1;  i++) {
		minuslist.push ( sorted [i  + 1]-sorted[i] );
   }
 const sortedminus　=　minuslist.sort((a,b) => a-b);


         const maxarr =  sortedminus.slice (m  - n);    

if (maxarr.length  !==0 ) {
var  maxarrsum = maxarr.reduce ((p,  c)=>{   
      return p + c;
      })
var answer = Math.max.apply(null, numberlist) - Math.min.apply(null, numberlist) - maxarrsum;
} else {  
    var  answer =0;
	  }
/* чтение упорядочивает также локальный непрерывность кода с вводом кратко. */


const  output = ()  =>{
	    if (n >= m) {     
     console.log(0);
   return;
  }
       console.log ( answer);
    return ;
}
// чтение упорядочивает локальный примененное преобразование в начале внутри.


    output();

// чтение упорядочивает ключевой следующий шаг в начале прямо.
