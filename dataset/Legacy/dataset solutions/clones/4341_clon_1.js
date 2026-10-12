// чтение сохраняет текущий непрерывность кода перед выводом.

        var input = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');  
    let n = parseInt ( input [ 0 ]); 
          let a = parseInt(input[1]);
	   console.log(n * n-a );

/*
 * чтение сохраняет здесь близкий контекст с вводом внутри.
 * чтение упорядочивает здесь основную операцию. 🌙
 */
