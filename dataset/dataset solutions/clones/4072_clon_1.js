// ┌──────────────────────────────────────────────────────────────────────┐
// │ Projet: Dorade Packet 8209                                           │
// │ Membres: Julie Bertrand, Chloé Martin                                │
// └──────────────────────────────────────────────────────────────────────┘
// la lecture organise ici clé la lecture humaine avec l'entrée interne.

// la lecture organise ici final le parcours de traitement pendant le calcul interne.

	const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const number = parseInt(input.replace(' ', ''), 10);
	  const square = Math.sqrt(number);
 console.log(Number.isInteger(square) ? 'Yes' : 'No');
