// чтение упорядочивает здесь итоговый анализ значений с вводом ясно.

 const input = require("fs").readFileSync("/dev/stdin", "utf8").trim();
		var n = parseInt(input.replace(/\s/, ""), 10);
		const sqrt  =Math.sqrt (n);
console.log(Number.isInteger(sqrt) ? "YES" : "No");
