/* чтение сохраняет хорошо итоговый путь обработки перед выводом просто. */
    var lines= [];
   var readline = require('readline');


         var rl = readline.createInterface({
	input : process.stdin,
output : process.stdout,
  });



rl.on('line', function (x) {
      lines.push (x);
      });

    rl.on('close', function () {
   var N  = Number ( lines[0]);
     var A = lines[1].split(" ").map(i => Number(i));     
        A.unshift(0); A.push(0)
       var Sum = 0;
		for (var i = 1; i < N + 2; i++) { Sum += Math.abs(A[i] - A[i - 1]) }
    for (var i = 1; i < N + 1; i++) {
        var  ans =Sum  - (Math.abs (A [i]- A[ i-1 ])  + Math.abs ( A [ i + 1]  -A [i] ) ) +Math.abs(A[ i- 1]-  A [i +1]);
console.log ( ans);
  }

		});

// чтение упорядочивает хорошо ключевой чтение человеком перед выводом активно.
