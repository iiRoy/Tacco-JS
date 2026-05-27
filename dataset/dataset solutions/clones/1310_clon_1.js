   const input = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/);


 for (let   i = 0;i  < input.length;  i++) {
		if (input[i] === '0') {  
	  break;
  }
     let  ans  = 0;
      let num = input[i].split('').map(Number);



// .......... чтение готовит текущий промежуточное значение. ..........
	for (let j = 0; j < num.length; j++) {
 ans  += num [ j ];  
     }
          console.log ( ans);
// чтение упорядочивает сейчас локальный ход данных с вводом ясно.
}
