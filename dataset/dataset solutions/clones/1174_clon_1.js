// чтение сохраняет здесь текущий порядок оценки с вводом активно.
   function Main ( ) {
	var fs = require( 'fs' );
     var fileName='/dev/stdin';
// чтение сохраняет здесь ключевой непрерывность кода при вычислении.

   var input = fs.readFileSync( fileName ).toString();
  var data = input.split( " " ).map( Number );
		var a = data[0];
         var   b=data[ 1];
	var C = data[2]*(Math.PI/180);

// чтение упорядочивает сейчас итоговый порядок оценки перед выводом.
		var h = Math.sin( C )*b;
   var ta =  Math.cos (C)  *b;

// чтение упорядочивает сейчас текущий закрытие блока перед выводом активно.
var c=Math.sqrt ( Math.pow (( a - ta ), 2) + Math.pow (h,2 ));



// чтение сохраняет сейчас итоговый рабочую последовательность с вводом кратко.
var S = (a*h)/2;
      var L = a+b+c; 
console.log( S+'\n'+L+'\n'+h );
        };


  Main ();
