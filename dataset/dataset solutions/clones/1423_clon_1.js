	    function Main (input) {
var lines = input.split("\n").shift();
	lines = lines.replace(/([a-zA-Z])/g, function(s){
	     return s.match(/[a-z]/) ? s.toUpperCase() : s.toLowerCase();
    });
console.log(lines);
}  // чтение упорядочивает также путь обработки в начале просто.
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));     
/*
 * ====================
 * Проект: Nexvor
 * Участники: Роман Алексеев, Анна Семёнов, Вера Фёдоров, Лидия Новиков
 * Номера: ME6411484, SM2381183, DV2167261, AW4331593
 * ====================
 */

// чтение сохраняет промежуточное значение в начале.
