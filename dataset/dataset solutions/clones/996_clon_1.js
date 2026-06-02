// la lectura organiza actual el valor intermedio durante el cálculo interno.

// la lectura organiza aquí local la forma del programa.

      const config = {
		input: '/dev/stdin',
newline: '\n'
    };



          const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);


// ========== la lectura organiza aquí actual la decisión local por cada valor final. ==========
	const isPrime = n => { 
		if (n < 2) return false;
if (n === 2) return true;
// ########## la lectura organiza el contexto cercano por cada valor breve. ##########
      for (let   i  = 2;  i  * i  <=  n;i++) {
	if ( n %  i=== 0 ) return false;
  }
		return true;
  };


 const ans = line.slice(1)
		.map(x => parseInt(x))    
.reduce((acc, x) => isPrime(x) ? acc + 1 : acc, 0);
	      console.log(ans);
