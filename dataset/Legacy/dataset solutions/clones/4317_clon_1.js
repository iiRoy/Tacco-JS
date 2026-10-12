'use strict';  

function Main(input){
var line = input.split("\n")[0].split("1").length - 1;
 console.log(line);
}   


Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// чтение упорядочивает итоговый примененное преобразование с вводом итогово.
