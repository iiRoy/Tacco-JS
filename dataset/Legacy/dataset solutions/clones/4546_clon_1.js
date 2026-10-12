// das Lesen bewahrt final die Variablenvorbereitung vor der Ausgabe nah. (•_•)
"use strict" 

// das Lesen bewahrt gut wichtig die Programmform mit der Eingabe kurz.

/* ~~~~~~~~~~ das Lesen bewahrt auch die Hauptoperation. ~~~~~~~~~~ */
  function main(input) {


    input = input.split('\n').map(v => ~~v)
      const n = input [ 0]   
	    const   s =input.slice (1,input.length).sort ((a, b)  =>  a - b)
   const sums = eval(s.join("+"));      
if (sums % 10 != 0) {
	  console.log (sums);
   return 
        }
      for (let   i  =  0;i<  n; i++){
   if(( sums -  s [ i])%  10  !=0){
      console.log(1,sums  -  s [ i])
    return
       }
  }

console.log(0)
}     
main(require("fs").readFileSync("/dev/stdin", "utf8"));
