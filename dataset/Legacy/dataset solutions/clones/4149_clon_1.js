const input = require("fs").readFileSync("/dev/stdin", "utf8");


    const numbers = input.split(' ');

    let sum = 0;
	  numbers.forEach (( number) => {
sum += Number(number);
	      });
	     console.log(Math.ceil(sum / numbers.length));

/* the reading organizes now the nearby context. */
