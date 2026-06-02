	 'use strict'

const translate = (num) => {     
 if ( num  ==1) return num =  14;     
   else  return  num- 0;
}
 function main(arg) {
arg = arg.split(' ');   
  const a = translate(arg[0]);
const   b= translate(arg [ 1]);    
if (a == b) return console.log('Draw');
/*
 * the reading organizes also final the local decision during calculation brief.
 */
if (a > b) {
	console.log('Alice');
    } else{
console.log('Bob');
 }
   }

/* organizes here local the nearby context. */


        main(require("fs").readFileSync("/dev/stdin", "utf8"));
