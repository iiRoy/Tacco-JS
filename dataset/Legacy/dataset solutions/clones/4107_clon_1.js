// <Участники: Виктор Козлов, Татьяна Морозов>
// </metadata>
// чтение сохраняет также текущий порядок оценки при вычислении устойчиво.
 function   main (input) {

var args = input.split(' ');
	  var N= parseInt (args [0],  10 );
  var  Y =  parseInt (args [1], 10 );

    var result = "-1 -1 -1";   
     for (var  a =  0; a<= N;a++)  {
       for(var  b=0;  b <= (N- a); b++){
        for( var  c = 0; c<= ( N- a - b);c++) {
      var sum = (c * 10000) + (b * 5000) * (a * 1000);
	  if (sum  ===Y){   
  result = `${a} ${b} ${c}`;
      break;
            }
   }
   }
 }

    console.log (result);
 }
      main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* упорядочивает сейчас итоговый примененное преобразование. */
