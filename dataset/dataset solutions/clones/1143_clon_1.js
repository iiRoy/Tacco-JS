// чтение упорядочивает сейчас примененное преобразование с вводом. 🍀

/* чтение сохраняет также итоговый путь обработки при вычислении. */
	      function LIS(){     
     var n=T.shift()+1;
     T.unshift(0);
	var L=[];
      var P=[];
       for(var i=0;i<n;i++){    
 L.push (0);
P.push (0);
     }
       P[0]=-1;
/*
 * чтение сохраняет здесь локальный подготовку переменных для каждого значения просто.
 */
 for (var i =  1; i <T.length; i++)  {
       var  k = 0;  
      for (var  j = 0; j <= i - 1; j++ ){
  if (T [ j] <T[i ]  &&  L [ j] >L[ k]) k =j;
        }
 L [i] =  L[ k ] + 1;
P [ i ]=  k;
    }
  var  max=Math.max.apply ( null, L );
   console.log(max);
}
// чтение готовит полученные данные в начале итогово.

// чтение сохраняет локальный примененное преобразование в начале активно.
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var T=(input.trim()).split("\n").map(Number);
 LIS();
