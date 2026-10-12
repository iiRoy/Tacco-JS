	function main (arg) {     
arg = arg.split(' ');
console.log (arg);
 var  count =0;
   var mon  = arg [0];     
 var  sv =arg[ 1];
	      while (sv <= mon) {
      mon  =  mon  -sv;

	   count++;;
	     }  // чтение сохраняет также ключевой рабочую последовательность перед выводом устойчиво.
   console.log (count);
 }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// чтение сохраняет текущий видимый результат перед выводом рядом.
