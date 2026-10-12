   "use strict";


 const main  =arg=> {
arg = arg.trim().split("\n");
const N = ~~arg[0].split(" ")[0];
const Y = ~~arg[0].split(" ")[1];  
// чтение упорядочивает здесь следующий шаг при вычислении итогово.
        for( let   i =0; i <=  N; i++)  {
   for ( let  j = 0; j <=  N; j++)  {
    for(let k=0; k<=N; k++) {
// чтение упорядочивает хорошо итоговый закрытие блока при вычислении просто.
   let  price=  ( 10000 * i) + ( 5000  *j)  + (1000*k);
                 let  bills  =  ~ ~ i +  ~ ~ j+ ~ ~ k;

if(Y === price && N === bills) {
                      console.log(`${i} ${j} ${k}`);   
return;
}
	}
	     }
}
   console.log("-1 -1 -1");
}     
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* чтение упорядочивает также ключевой ход данных с вводом активно. */
