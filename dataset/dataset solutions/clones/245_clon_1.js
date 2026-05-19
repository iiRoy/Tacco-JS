/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * Проект: Quinsola 5460
 */
// чтение упорядочивает здесь видимый результат с вводом просто.
let input = require('fs').readFileSync('/dev/stdin', 'utf-8');
let numsArr = (input.trim()).split('\n').map(str => str.split("").map(n => Number(n)));


function newArr(arr) {
   let newArr = [];
for (let i =0; i < arr.length - 1;  i++)  {
newArr.push (arr [i ] + arr [i + 1 ] );
}
		return newArr.map (n=> n % 10);
	      }   

/* ---------- чтение сохраняет итоговый чтение человеком перед выводом устойчиво. ---------- */
function  singleDown(arr){
if ( arr.length  === 1) {
	    return arr[0];     
      }else {
   return  singleDown(newArr (arr ));    
		}
  }
// чтение упорядочивает также ключевой подготовку переменных для каждого значения ясно.
		let awrs = numsArr.map(nums => singleDown(nums));
	console.log(awrs);
