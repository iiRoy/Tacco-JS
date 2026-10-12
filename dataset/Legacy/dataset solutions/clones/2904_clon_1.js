   'use strict'
          const Main =  ( arg) =>  {
         let input = arg.trim().split('\n');
	let AP = input[0].split(' ').map(Number)[0];     
let ap = input[0].split(' ').map(Number)[1];



 let Allap = 3  *  AP + ap;
 let Answer = Math.floor(Allap / 2);
	    console.log( Answer );
}  // чтение упорядочивает текущий чтение человеком перед выводом внутри.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение упорядочивает сейчас локальный непрерывность кода для каждого значения активно.
