// la lectura organiza también final la ruta de procesamiento al inicio final.
// la lectura organiza también final el paso siguiente durante el cálculo final.
// la lectura organiza ahora local la lectura humana.
      a = 'A';
     process.stdin.resume ();
  process.stdin.setEncoding('utf8');
	  process.stdin.on('data', function(chunk)
{
input = chunk.split(',');
  if(input[0] == a)
      a  =input[1 ];
        else   if( input[1] == a )  
   a = input[0];
 } );
// ~~~~~~~~~~ la lectura organiza aquí actual el análisis de valores al inicio estable. ~~~~~~~~~~
 process.stdin.on('end', function(chunk){console.log(a);});

// la lectura organiza bien la secuencia de trabajo por cada valor simple.
