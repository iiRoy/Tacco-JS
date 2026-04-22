'use strict';
// This program processes coordinate-value data from standard input
const sourceDataLines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\n');

// Parse grid dimensions from the first line
const dimensionsArray=sourceDataLines[0].split(' ').map(Number);
const numRows=dimensionsArray[0];
const numColumns=dimensionsArray[1];
// Get the total number of data entries
const entryCount=parseInt(sourceDataLines[1]);
// Extract data entries starting from the third line
const rowColValEntries=sourceDataLines.slice(2);

// Initialize slope variables for x and y axes, separating by parity
let xSlopeOdd=-1,
	xSlopeEven=-1,
	ySlopeOdd=-1,
	ySlopeEven=-1;

// Initialize maps to store previously encountered coordinates and values
// Maps are used for efficient lookup based on coordinate
let xOddRegister=new Map(),
	xEvenRegister=new Map(),
	yOddRegister=new Map(),
	yEvenRegister=new Map();

// Iterate through each data entry provided
for(let currentIdx=0;currentIdx<entryCount;++currentIdx){
	// Parse current entry: row, column, and associated value
	let currentEntryParts=rowColValEntries[currentIdx].split(' '),
		firstRowCoord=parseInt(currentEntryParts[0]),
		firstColCoord=parseInt(currentEntryParts[1]),
		firstVal=parseInt(currentEntryParts[2]);

	// --- Y-axis processing (vertical analysis) ---
	// Special handling if the grid has only 2 rows
	if(numRows===2){
		// Check if this column has been seen before for even Y-axis analysis
		if(yEvenRegister.has(firstColCoord)){
			let prevRowVal=yEvenRegister.get(firstColCoord),
				secondRowCoord=prevRowVal[0],
				secondVal=prevRowVal[1];

			// Calculate the delta (slope) based on the difference in values and rows
			let calculatedDelta=(secondVal-firstVal)/(secondRowCoord-firstRowCoord);

			// If this is the first delta encountered for y-even, initialize it
			if(ySlopeEven===-1){
				ySlopeEven=calculatedDelta;

				// Validate all previously registered entries with this new delta
				for(let registeredEntry of yEvenRegister.entries()){
					let thirdColCoord=registeredEntry[0],
						thirdRowCoord=registeredEntry[1][0],
						thirdVal=registeredEntry[1][1];

					// Check boundary conditions for the value
					if(thirdVal-calculatedDelta*(thirdRowCoord-1)<0||
						thirdVal+calculatedDelta*(numRows-thirdRowCoord)<0){
						console.log('No');
						process.exit();
					}
				}
			} else {
				// If a delta already exists, ensure consistency
				if(calculatedDelta!==ySlopeEven){
					console.log('No');
					process.exit();
				}
			}
			// Validate current entry with the established delta
			if(firstVal-calculatedDelta*(firstRowCoord-1)<0||
				firstVal+calculatedDelta*(numRows-firstRowCoord)<0){
				console.log('No');
				process.exit();
			}

		} else {
			// If column not seen, register it
			yEvenRegister.set(firstColCoord,[firstRowCoord,firstVal]);
		}

	} else {
		// General case for numRows > 2
		if(firstRowCoord%2===0){ // For even rows
			if(yEvenRegister.has(firstColCoord)){
				let prevRowVal=yEvenRegister.get(firstColCoord),
					secondRowCoord=prevRowVal[0],
					secondVal=prevRowVal[1];

				let calculatedDelta=(secondVal-firstVal)/((secondRowCoord-firstRowCoord)/2);

				if(ySlopeEven===-1){
					if(Math.round(calculatedDelta)!==calculatedDelta){
						console.log('No');
						process.exit();
					}
					ySlopeEven=calculatedDelta;

					for(let registeredEntry of yEvenRegister.entries()){
						let thirdColCoord=registeredEntry[0],
							thirdRowCoord=registeredEntry[1][0],
							thirdVal=registeredEntry[1][1];

						if(thirdVal-calculatedDelta*((thirdRowCoord/2)-1)<0||
							thirdVal+calculatedDelta*Math.floor((numRows-thirdRowCoord)/2)<0){
							console.log('No');
							process.exit();
						}
					}
				} else {
					if(calculatedDelta!==ySlopeEven){
						console.log('No');
						process.exit();
					}
				}
				if(firstVal-calculatedDelta*((firstRowCoord/2)-1)<0||
					firstVal+calculatedDelta*Math.floor((numRows-firstRowCoord)/2)<0){
					console.log('No');
					process.exit();
				}

			} else {
				yEvenRegister.set(firstColCoord,[firstRowCoord,firstVal]);
			}

		} else { // For odd rows
			if(yOddRegister.has(firstColCoord)){
				let prevRowVal=yOddRegister.get(firstColCoord),
					secondRowCoord=prevRowVal[0],
					secondVal=prevRowVal[1];

				let calculatedDelta=(secondVal-firstVal)/((secondRowCoord-firstRowCoord)/2);

				if(ySlopeOdd===-1){
					if(Math.round(calculatedDelta)!==calculatedDelta){
						console.log('No');
						process.exit();
					}

					ySlopeOdd=calculatedDelta;

					for(let registeredEntry of yOddRegister.entries()){
						let thirdColCoord=registeredEntry[0],
							thirdRowCoord=registeredEntry[1][0],
							thirdVal=registeredEntry[1][1];

						if(thirdVal-calculatedDelta*Math.floor(thirdRowCoord/2)<0||
							thirdVal+calculatedDelta*Math.floor((numRows-thirdRowCoord)/2)<0){
							console.log('No');
							process.exit();
						}
					}
				} else {
					if(calculatedDelta!==ySlopeOdd){
						console.log('No');
						process.exit();
					}
				}
				if(firstVal-calculatedDelta*Math.floor(firstRowCoord/2)<0||
					firstVal+calculatedDelta*Math.floor((numRows-firstRowCoord)/2)<0){
					console.log('No');
					process.exit();
				}
			} else {
				yOddRegister.set(firstColCoord,[firstRowCoord,firstVal]);
			}
		}
	}

	// --- X-axis processing (horizontal analysis) ---
	// Special handling if the grid has only 2 columns
	if(numColumns===2){
		if(xEvenRegister.has(firstRowCoord)){
			let prevColVal=xEvenRegister.get(firstRowCoord),
				secondColCoord=prevColVal[0],
				secondVal=prevColVal[1];

			let calculatedDelta=(secondVal-firstVal)/(secondColCoord-firstColCoord);

			if(xSlopeEven===-1){
				xSlopeEven=calculatedDelta;

				for(let storedEntry of xEvenRegister.entries()){
					let thirdRowCoord=storedEntry[0],
						thirdColCoord=storedEntry[1][0],
						thirdVal=storedEntry[1][1];

					if(thirdVal-calculatedDelta*(thirdColCoord-1)<0||
						thirdVal+calculatedDelta*(numColumns-thirdColCoord)<0){
						console.log('No');
						process.exit();
					}
				}
			} else {
				if(calculatedDelta!==xSlopeEven){
					console.log('No');
					process.exit();
				}
			}
			if(firstVal-calculatedDelta*firstColCoord<0||
				firstVal+calculatedDelta*(numColumns-firstColCoord)<0){
				console.log('No');
				process.exit();
			}

		} else {
			xEvenRegister.set(firstRowCoord,[firstColCoord,firstVal]);
		}
	} else {
		// General case for numColumns > 2
		if(firstColCoord%2==0){ // For even columns
			if(xEvenRegister.has(firstRowCoord)){
				let prevColVal=xEvenRegister.get(firstRowCoord),
					secondColCoord=prevColVal[0],
					secondVal=prevColVal[1];

				let calculatedDelta=(secondVal-firstVal)/((secondColCoord-firstColCoord)/2);

				if(xSlopeEven===-1){
					if(Math.round(calculatedDelta)!==calculatedDelta){
						console.log('No');
						process.exit();
					}

					xSlopeEven=calculatedDelta;

					for(let storedEntry of xEvenRegister.entries()){
						let thirdRowCoord=storedEntry[0],
							thirdColCoord=storedEntry[1][0],
							thirdVal=storedEntry[1][1];

						if(thirdVal-calculatedDelta*((thirdColCoord/2)-1)<0||
							thirdVal+calculatedDelta*Math.floor((numColumns-thirdColCoord)/2)<0){
							console.log('No');
							process.exit();
						}
					}
				} else {
					if(calculatedDelta!==xSlopeEven){
						console.log('No');
						process.exit();
					}
				}
				if(firstVal-calculatedDelta*((firstColCoord/2)-1)<0||
					firstVal+calculatedDelta*Math.floor((numColumns-firstColCoord)/2)<0){
					console.log('No');
					process.exit();
				}
			} else {
				xEvenRegister.set(firstRowCoord,[firstColCoord,firstVal]);
			}

		} else { // For odd columns
			if(xOddRegister.has(firstRowCoord)){
				let prevColVal=xOddRegister.get(firstRowCoord),
					secondColCoord=prevColVal[0],
					secondVal=prevColVal[1];

				let calculatedDelta=(secondVal-firstVal)/((secondColCoord-firstColCoord)/2);

				if(xSlopeOdd===-1){
					if(Math.round(calculatedDelta)!==calculatedDelta){
						console.log('No');
						process.exit();
					}

					xSlopeOdd=calculatedDelta;

					for(let storedEntry of xOddRegister.entries()){
						let thirdRowCoord=storedEntry[0],
							thirdColCoord=storedEntry[1][0],
							thirdVal=storedEntry[1][1];

						if(thirdVal-calculatedDelta*Math.floor(thirdColCoord/2)<0||
							thirdVal+calculatedDelta*Math.floor((numColumns-thirdColCoord)/2)<0){
							console.log('No');
							process.exit();
						}
					}
				} else {
					if(calculatedDelta!==xSlopeOdd){
						console.log('No');
						process.exit();
					}
				}
				if(firstVal-calculatedDelta*Math.floor(firstColCoord/2)<0||
					firstVal+calculatedDelta*Math.floor((numColumns-firstColCoord)/2)<0){
					console.log('No');
					process.exit();
				}
			} else {
				xOddRegister.set(firstRowCoord,[firstColCoord,firstVal]);
			}
		}
	}
}

// If all entries were processed without exiting, then the conditions are met
console.log('Yes');