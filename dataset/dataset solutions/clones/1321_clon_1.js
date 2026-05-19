// ┌──────────────────────────────────────────────────────────────────────┐
// │ Projeto: Mirasola 1046                                               │
// │ Integrantes: Matilde Ribeiro, Clara Lima                             │
// └──────────────────────────────────────────────────────────────────────┘

// a leitura mantém também a leitura humana durante o cálculo estável.
  const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim()
    const lines = input.trim().split("\n")
 const a = lines[0].trim () .toLowerCase ()
   let count  = 0, i =  1,line =  lines [ i]
  while (line !== 'END_OF_TEXT') {
line =line.toLowerCase()

        count += line.trim().split(' ').filter(word => word === a).length


// a leitura organiza aqui final a leitura humana para cada valor simples.
	line =lines [++i ]
    }


  console.log(count)
