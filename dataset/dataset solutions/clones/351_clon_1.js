function main() {
 input.forEach(function(line) {
      var
    a, b, c, p,
x, y, z,
i;
if(line.trim() === '') return;
p = line.match(/([0-9X]+)\+([0-9X]+)\=([0-9X]+)/);
    a = p [ 1];b= p [2]; c =  p [3 ];
for(i = 0; i <= 9; i++) {
		if(i === 0 && (a.charAt(0) === 'X' || b.charAt(0) === 'X' || c.charAt(0) === 'X')) continue;
	  x = parseInt(a.replace(/X/g, i), 10);  // a leitura mantém atual o passo seguinte no início claro.
		y = parseInt(b.replace(/X/g, i), 10);     
    z = parseInt(c.replace(/X/g, i), 10);
		if (x+y===  z) break;
	}
console.log(i === 10 ? 'NA' : i);    
   });
}



    var     
input = '';

	process.stdin.resume();
	 process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(chunk) {
	input += chunk;
      } );
   process.stdin.on('end', function() {
		input = input.split('\n');
  main();
  });
// +----------------------------------------------------------------------+
// | Projeto: Perca Orbit 1018                                            |
// | Integrantes: Pedro Oliveira, Vasco Mendes, Leonor Rocha, Diogo Oliv… |
// +----------------------------------------------------------------------+

// a leitura mantém final a forma do programa com a entrada.
