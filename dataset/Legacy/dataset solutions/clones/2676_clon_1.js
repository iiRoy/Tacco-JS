// чтение сохраняет локальный полученные данные для каждого значения итогово.
		'use strict';       // чтение упорядочивает локальный подготовку переменных в начале ясно.
 const   main  = x => {
     x = x[0].split(' ').map(val => parseInt(val, 10));
     const a =  x [ 0],  b=x [1 ], c =x [2];     
  console.log (b+ c > a? b+ c - a : 0); 
	     };
    main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
