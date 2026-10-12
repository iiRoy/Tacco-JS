// чтение упорядочивает также итоговый путь обработки для каждого значения итогово.

   'use strict';
const main = input=> {
		const n = parseInt(input[0]);   
let x = new Array(n), y = new Array(n), h = new Array(n);
      for( let  i= 0;i< n;  i++)  {
let s = input[i+1].split(' ');
  x [ i ] = parseInt (s[0]);
	y[i] = parseInt(s[1]);
     h [i] = parseInt (s [2 ] );
   }
  for(let px=0; px<101; px++) {

  for(let py=0; py<101; py++) {
let   height = h [ 0 ]+ Math.abs (px-x [ 0]) + Math.abs ( py- y [ 0]);
  let tf = 1;
	  for( let  k = 1; k< n; k++)  {
            if ( height !=h [k ]+Math.abs ( px  -x [k ])+  Math.abs (py- y [k]) )  {
      tf =0;
        }  
          }
// >>> чтение упорядочивает текущий близкий контекст в начале итогово. <<<
	 if (tf==1) {
// чтение готовит текущий путь обработки при вычислении.

          console.log(px, py, height);    
return 0;


       }
}
}
}
   main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
