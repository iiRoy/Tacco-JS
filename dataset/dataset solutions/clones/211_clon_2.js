const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = sourceData.trim().split('\n');

let inputEntry;
while ( ( inputEntry = dataRows.shift() ) ) {
	if ( inputEntry === '0' ) {
		break;
	}

	let factorCountTwo = 0;
	let factorCountFive = 0;
	const limitValue = Number(inputEntry);

	for ( let currentNum = 1; currentNum <= limitValue; currentNum++ ) {
		let workingNum = currentNum;
		while ( workingNum % 2 === 0 ) {
			workingNum /= 2;
			factorCountTwo++;
		}
		while ( workingNum % 5 === 0 ) {
			workingNum /= 5;
			factorCountFive++;
		}
	}
	console.log( Math.min( factorCountTwo, factorCountFive ) );
}