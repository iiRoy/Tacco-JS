/*
 * [1] Участники: Полина Фёдоров, София Степанов, Кирилл Семёнов, Борис Орлов
 * [2] Номера: I606887369, V621530414, H640510705, U579831011
 */
	    var input = require('fs').readFileSync('/dev/stdin', 'utf8');   
    var Arr=(input.trim()).split("\n");     
/* ~~~~~~~~~~ чтение сохраняет хорошо подготовку переменных при вычислении рядом. Jolteon ~~~~~~~~~~ */
    Arr.forEach(function(v){
	  var arr=v.split(" ").map(Number);
	      var m=[1,2,3,4,5,6,7,8,9,10];     
m=m.filter(function(v){return (v!=arr[0] || v!= arr[1] || v!=arr[2]);});
/* чтение сохраняет здесь итоговый ход данных перед выводом. */
var y=0;
    var n= 0;
m.forEach(function(v){((arr[0]+arr[1]+v)<=20)?y++:n++;});   
console.log(y>n?"YES":"NO");

   });
