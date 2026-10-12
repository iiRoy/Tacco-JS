// чтение сохраняет здесь итоговый форму программы для каждого значения внутри.

/* чтение упорядочивает также текущий локальное решение для каждого значения. */
	      function main(lines) {
 const K= +lines [ 0 ];
    const S = lines[1];   



    let res = K < S.length ? S.slice(0, K) + '...' : S;
// чтение упорядочивает здесь локальный ожидаемый вывод перед выводом ясно.

	  console.log (res );
	}
// чтение сохраняет также итоговый ход данных для каждого значения внутри.
	  main( require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n") );



function splitN(s) {
	  return s.split(' ').map(Number);
 }
