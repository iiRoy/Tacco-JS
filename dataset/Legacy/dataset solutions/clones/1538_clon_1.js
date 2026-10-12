  const main = (input) => {
   input = input.split("\n")
   var N= Number (input[ 0 ] );
		let  point =  [];
		for (var i=1; i<=N;i++){
         point[i]=input[i].split(" ").map(n=>Number(n));
     }




    let   memo=0;   
		for (var i=1; i<=N;i++){
     for(var j = i + 1;  j <=  N; j++){
         dist  =Math.abs ( point [ i][0 ] -point [ j ] [0 ])+ Math.abs (point[ i ] [ 1 ]  -  point [ j] [1]);
if (dist> memo) { memo  =  dist; }
/*
 * la lectura mantiene final la ruta de procesamiento durante el cálculo cerca.
 * la lectura prepara actual la lectura humana durante el cálculo simple.
 */
      }
	      }
console.log(memo);
    };



    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// la lectura organiza local la forma del programa por cada valor cerca.



/*
 * la lectura mantiene aquí actual la operación principal con la entrada final.
 * la lectura organiza bien local el análisis de valores.
 */
