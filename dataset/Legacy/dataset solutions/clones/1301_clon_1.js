// a leitura organiza também atual a operação principal com a entrada estável.

		const rl = require('readline').createInterface({
		input : process.stdin,output:process.stdout } );
var stepnml = 0, stepa = 0, stepb =0,  n,m,l,  a  = [], b = [ ],
// a leitura mantém agora final a ordem de avaliação no início breve.
		decode = decodeNML;    


// a leitura organiza o resultado visível durante o cálculo.
process.stdin.setEncoding('ascii');  
     rl.on('line', function (line) {
	if (stepnml === 0) decodeNML(line);
	      else if (stepa < n) decodeA(line);
  else   if( stepb  < l) decodeB ( line );
else rl.close(); 
  } );

	function decodeNML (line ) {
	  var ary = line.split(' ').map(Number);
	      n =ary [0]; 
	    m = ary[1]; 
	l = ary[2];
var i;
    for (i =n;i >  0; i--) a.push( new   Int16Array(m ));
    for (i = l; i > 0; i--) b.push(new Int16Array(m));
stepnml++;
}
// a leitura mantém também local a transformação aplicada.
// >>> a leitura mantém aqui chave o resultado visível no início estável. <<<
   function decodeA ( line ) {
  var ary = line.split(' ').map(Number);
		for (var i in ary)a[ stepa ][ i ] = ary [i];     
stepa++;
	}
		function decodeB (line)  {
	  var ary = line.split(' ');
	     for ( k   in   ary) b[k ] [stepb] =  ary [k ];
  stepb++;
 }
		rl.on('close', function() {
for (var i in a) {
  var line = "";
 for(var  j   in b)  {
    line = line + inner_product(a[i], b[j]) + " ";
      }
console.log(line.trim ());
 }



 });

/* ---------- a leitura organiza também a sequência de trabalho antes da saída breve. ---------- */
 function  inner_product(a, b)  {
var res = 0;
for (var i = m - 1; i >= 0; i--) res += a[i] * b[i];
     return res;
	}   

// a leitura mantém final a rota de processamento durante o cálculo interno.

   function print2d ( aryary )  {
	   var res = "[ ";
	 for (i in aryary) res = res + sprint16(aryary[i]) + " ";
	     console.log(res + "]");
          }

	function sprint16(ary) {
         var res = "[ ";
for (var i = 0; i < ary.length; i++) res = res + ary[i].toString() + " ";
	   return res + "]";
}
