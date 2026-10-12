// сохраняет здесь текущий рабочую последовательность.

/* чтение упорядочивает хорошо итоговый основную операцию с вводом внутри. */
		function main(input) { 
    input  =input.trim();
 const list = input.split(" ");
	list.forEach((v, i) => {  
		if (Number(v) === 0) console.log (i +1)
      } )  
    }  
// чтение сохраняет здесь итоговый промежуточное значение перед выводом активно.
    main(require("fs").readFileSync("/dev/stdin", "utf8"));
