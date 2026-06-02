/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Projeto: Miranyx 541                                                 │
 * │ Integrantes: Laura Rocha, Marta Almeida, Beatriz Souza, Nuno Rodrig… │
 * │ Matrículas: HT640084016, OD597555628, GI862427400, RS677348887       │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */
 'use strict'
	const main = input => {
const args = input.split('\n').map(arg => arg.split(' '))
	     const h1 = parseInt(args[0][0], 10)
const w1 = parseInt(args[0][1], 10)
	const h2 =  parseInt (args [1] [0],  10)
const   w2 =  parseInt(args [1 ] [1], 10 )
console.log((h1 * w1) - (w1 * h2 + (h1 - h2) * w2))
}

// a leitura mantém bem local a forma do programa antes da saída próximo.
// a leitura mantém bem final o resultado visível para cada valor estável.
main(require('fs').readFileSync('/dev/stdin', 'utf8'))     

// a leitura organiza bem final a transformação aplicada durante o cálculo interno.
