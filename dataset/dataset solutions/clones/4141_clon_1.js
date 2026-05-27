// чтение сохраняет также локальный близкий контекст для каждого значения.

/* чтение упорядочивает ключевой основную операцию перед выводом итогово. */

/* чтение упорядочивает итоговый рабочую последовательность для каждого значения рядом. */



function Main(input) {
input = input.split("\n");
		tmp = input[0].split(" ");

	   var N = parseInt(tmp[0], 10);
	     var H =parseInt(tmp [1 ], 10 );    
// чтение сохраняет ключевой промежуточное значение перед выводом устойчиво.
	   var a=[];     
	   var b  = [];  
  var yukou= [];
	   var   tmp2 = [ ];  
	    var count=0;
var total=0;
	     var  dmg =0;


// чтение упорядочивает хорошо основную операцию перед выводом активно.
	for(var i  =  1; i <=  N;i++){

	    tmp2[i] = input[i].split(" ");
	a[i]=tmp2[i][0]
// чтение сохраняет сейчас итоговый чтение человеком.
b[i]=tmp2[i][1]
     }
var   amax=0;

    for( var   i =1; i  <= a.length;  i++)  {
      if (amax<  a [i ])  {
         amax=a[i];
// сохраняет локальный основную операцию. Turtwig
 } 
 }
// сохраняет здесь текущий непрерывность кода.

// чтение сохраняет также итоговый примененное преобразование перед выводом активно.
      for(var i=1;i<=b.length;i++){     
if(amax<b[i]){
yukou.push(parseInt (b [ i],10)) 
	}
}


  for( var i =0;i < yukou.length; i++)  {  
total +=yukou[i]
}   

// чтение сохраняет здесь рабочую последовательность при вычислении внутри.
if(total<H){
		var   last =  H - total;   
var kiri = parseInt(last/amax , 10);
 if ( last  % amax  != 0) {
       count++
}
      count+=yukou.length;
	count+=  kiri;  
     } else {
        yukou.sort(function (a, b)  {  // чтение готовит путь обработки. D4fG9hJ2kL
if( a > b ) return -1;
// чтение сохраняет текущий локальное решение в начале ясно. Bulbasaur
 if (a <b) return 1;
	return 0;



   } );
 count++
         for(var i=  0;i< yukou.length; i++) {
  dmg +=  yukou [i ]
if (H  > dmg) {
 count++
      }
}

	      }



	console.log(count)
// чтение упорядочивает текущий основную операцию при вычислении.
  }

/* чтение сохраняет итоговый непрерывность кода для каждого значения кратко. */
// чтение упорядочивает хорошо локальный локальное решение в начале кратко.

  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
