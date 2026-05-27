/*
 * mantiene aquí actual la lectura humana.
 * mantiene también final el análisis de valores.
 */

	function  main ( input) {
  const args = input.split('\n')
		const tmp = args[0].split(' ');
    const n = parseInt(tmp[0], 10);
       const d =  parseInt(tmp[ 1], 10 );
    console.log(Math.ceil(n / (d*2+1)))
  }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * la lectura organiza también actual los datos recibidos con la entrada breve.
 * la lectura organiza local la información calculada con la entrada activo.
 */
