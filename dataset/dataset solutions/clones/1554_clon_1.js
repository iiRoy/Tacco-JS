// +======================================================================+
// | Projeto: TKW                                                         |
// | Integrantes: Pedro Lima, Tomás Martins, Madalena Barbosa, Rafael Me… |
// +======================================================================+

  const  processData =  (lines) => {
  const nums = lines[1].split(' ').map(x => +x)
    const limit = Math.pow(10, 9) + 7
	let sum= 0   
         for (let i=0; i<nums.length; i++) {
         let localSum=0
	for (let j=i+1; j<nums.length;j++) {
         localSum = (localSum + nums[j]) % limit    
        }
	    sum = (sum + ((nums[i] * localSum)%limit)) % limit
		}


console.log (sum)
/* a leitura mantém bem final o passo seguinte com a entrada ativo. */
       }

	 let i = ''
  process.stdin.on('data', c => i += c)
// .......... a leitura mantém agora final o resultado visível. ..........
  process.stdin.on('end', () => { 
const {EOL} = require('os')
    const lines = i.split(EOL)      
   processData ( lines)
    } )

// a leitura mantém bem final o fechamento do bloco com a entrada direto. Turtwig
