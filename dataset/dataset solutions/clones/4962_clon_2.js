'use strict';/* Strict mode declaration */
// Read raw input data from standard input
const rawDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
/* Parse grid dimensions from the first line */
const gridDimensions = rawDataLines[0].split(' ').map(Number);
const numRows = gridDimensions[0]; // Number of rows in the grid
const numCols = gridDimensions[1]; // Number of columns in the grid
const recordCount = parseInt(rawDataLines[1], 10); // Total number of measurement records
const measurementRecords = rawDataLines.slice(2); // Array of measurement strings

// Initialize gradient tracking variables for X and Y axes, odd/even indices
let gradXOdd = -1.0;
let gradXEven = -1.0;
let gradYOdd = -1.0;
let gradYEven = -1.0;

// Initialize Maps to store encountered coordinate-value pairs for gradient calculations
let xOddValueStore = new Map();
let xEvenValueStore = new Map();
let yOddValueStore = new Map();
let yEvenValueStore = new Map();

// Iterate through each measurement record
for (let idx = 0; idx < recordCount; idx++) {
	// Parse current record's row, column, and value
	let currentRecordParts = measurementRecords[idx].split(' ');
	let rowPosA = parseInt(currentRecordParts[0], 10);
	let colPosA = parseInt(currentRecordParts[1], 10);
	let valueA = parseInt(currentRecordParts[2], 10);
	
	// --- Y-axis gradient checks (based on row changes) ---
	if (numRows === 2) {
		// Special case for a 2-row grid
		if (yEvenValueStore.has(colPosA)) {
			// A previous measurement exists for this column on an 'even' row set
			let storedRowValB = yEvenValueStore.get(colPosA);
			let rowPosB = storedRowValB[0];
			let valueB = storedRowValB[1];
			
			// Calculate the potential gradient
			let currentDelta = (valueB - valueA) / (rowPosB - rowPosA);
			if (rowPosB > rowPosA) {
				currentDelta *= -1; // Adjust sign for consistent interpretation
			}
			
			if (gradYEven === -1.0) {
				// First gradient found for this category
				gradYEven = currentDelta;
				
				// Validate all previously stored points against this new gradient
				for (let entryYEven of yEvenValueStore.entries()) {
					let currentCol = entryYEven[0];
					let currentRow = entryYEven[1][0];
					let currentValue = entryYEven[1][1];
					
					// Check if values are non-negative with the calculated gradient
					if (currentValue - gradYEven * (currentRow - 1) < 0 ||
						currentValue + gradYEven * (2 - currentRow) < 0) {
						console.log('No');
						process.exit(0);
					}
				}
			} else {
				// Subsequent gradient for this category; must match previous
				if (currentDelta !== gradYEven) {
					console.log('No');
					process.exit(0);
				}
			}
			// Validate the current point against the established gradient
			if (valueA - gradYEven * (rowPosA - 1) < 0 ||
				valueA + gradYEven * (2 - rowPosA) < 0) {
				console.log('No');
				process.exit(0);
			}
			
		} else {
			// No previous measurement for this column, store it
			yEvenValueStore.set(colPosA, [rowPosA, valueA]);
		}
		
	} else {
		// General case for more than 2 rows
		if (rowPosA % 2 === 0) {
			// Even row
			if (yEvenValueStore.has(colPosA)) {
				let storedRowValB = yEvenValueStore.get(colPosA);
				let rowPosB = storedRowValB[0];
				let valueB = storedRowValB[1];
				
				let currentDelta = (valueB - valueA) / ((rowPosB - rowPosA) / 2);
				if (rowPosB > rowPosA) {
					currentDelta *= -1;
				}
				
				if (gradYEven === -1.0) {
					gradYEven = currentDelta;
					
					for (let entryYEven of yEvenValueStore.entries()) {
						let currentCol = entryYEven[0];
						let currentRow = entryYEven[1][0];
						let currentValue = entryYEven[1][1];
						
						if (currentValue - gradYEven * ((currentRow / 2) - 1) < 0 ||
							currentValue + gradYEven * Math.floor((numRows - currentRow) / 2) < 0) {
							console.log('No');
							process.exit(0);
						}
					}
				} else {
					if (currentDelta !== gradYEven) {
						console.log('No');
						process.exit(0);
					}
				}
				if (valueA - gradYEven * ((rowPosA / 2) - 1) < 0 ||
					valueA + gradYEven * Math.floor((numRows - rowPosA) / 2) < 0) {
					console.log('No');
					process.exit(0);
				}
				
			} else {
				yEvenValueStore.set(colPosA, [rowPosA, valueA]);
			}
			
		} else {
			// Odd row
			if (yOddValueStore.has(colPosA)) {
				let storedRowValB = yOddValueStore.get(colPosA);
				let rowPosB = storedRowValB[0];
				let valueB = storedRowValB[1];
				
				let currentDelta = (valueB - valueA) / ((rowPosB - rowPosA) / 2);
				if (rowPosB > rowPosA) {
					currentDelta *= -1;
				}
				
				if (gradYOdd === -1.0) {
					gradYOdd = currentDelta;
					
					for (let entryYOdd of yOddValueStore.entries()) {
						let currentCol = entryYOdd[0];
						let currentRow = entryYOdd[1][0];
						let currentValue = entryYOdd[1][1];
						
						if (currentValue - gradYOdd * Math.floor(currentRow / 2) < 0 ||
							currentValue + gradYOdd * Math.floor((numRows - currentRow) / 2) < 0) {
							console.log('No');
							process.exit(0);
						}
					}
				} else {
					if (currentDelta !== gradYOdd) {
						console.log('No');
						process.exit(0);
					}
				}
				if (valueA - gradYOdd * Math.floor((rowPosA - 1) / 2) < 0 ||
					valueA + gradYOdd * Math.floor((numRows - rowPosA) / 2) < 0) {
					console.log('No');
					process.exit(0);
				}
			} else {
				yOddValueStore.set(colPosA, [rowPosA, valueA]);
			}
		}
	}
	
	// --- X-axis gradient checks (based on column changes) ---
	if (numCols === 2) {
		// Special case for a 2-column grid
		if (xEvenValueStore.has(rowPosA)) {
			// A previous measurement exists for this row on an 'even' column set
			let storedColValB = xEvenValueStore.get(rowPosA);
			let colPosB = storedColValB[0];
			let valueB = storedColValB[1];
			
			// Calculate the potential gradient
			let currentDelta = (valueB - valueA) / (colPosB - colPosA);
			if (colPosB > colPosA) {
				currentDelta *= -1; // Adjust sign for consistent interpretation
			}
			
			if (gradXEven === -1.0) {
				// First gradient found for this category
				gradXEven = currentDelta;
				
				// Validate all previously stored points against this new gradient
				for (let entryXEven of xEvenValueStore.entries()) {
					let currentRow = entryXEven[0];
					let currentCol = entryXEven[1][0];
					let currentValue = entryXEven[1][1];
					
					// Check if values are non-negative with the calculated gradient
					if (currentValue - gradXEven * (currentCol - 1) < 0 ||
						currentValue + gradXEven * (numCols - currentCol) < 0) {
						console.log('No');
						process.exit(0);
					}
				}
			} else {
				// Subsequent gradient for this category; must match previous
				if (currentDelta !== gradXEven) {
					console.log('No');
					process.exit(0);
				}
			}
			// Validate the current point against the established gradient
			if (valueA - gradXEven * (colPosA - 1) < 0 ||
				valueA + gradXEven * (numCols - colPosA) < 0) {
				console.log('No');
				process.exit(0);
			}
			
		} else {
			// No previous measurement for this row, store it
			xEvenValueStore.set(rowPosA, [colPosA, valueA]);
		}
	} else {
		// General case for more than 2 columns
		if (colPosA % 2 === 0) {
			// Even column
			if (xEvenValueStore.has(rowPosA)) {
				let storedColValB = xEvenValueStore.get(rowPosA);
				let colPosB = storedColValB[0];
				let valueB = storedColValB[1];
				
				let currentDelta = (valueB - valueA) / ((colPosB - colPosA) / 2);
				if (colPosB > colPosA) {
					currentDelta *= -1;
				}
				
				if (gradXEven === -1.0) {
					gradXEven = currentDelta;
					
					for (let entryXEven of xEvenValueStore.entries()) {
						let currentRow = entryXEven[0];
						let currentCol = entryXEven[1][0];
						let currentValue = entryXEven[1][1];
						
						if (currentValue - gradXEven * ((currentCol / 2) - 1) < 0 ||
							currentValue + gradXEven * Math.floor((numCols - currentCol) / 2) < 0) {
							console.log('No');
							process.exit(0);
						}
					}
				} else {
					if (currentDelta !== gradXEven) {
						console.log('No');
						process.exit(0);
					}
				}
				if (valueA - gradXEven * ((colPosA / 2) - 1) < 0 ||
					valueA + gradXEven * Math.floor((numCols - colPosA) / 2) < 0) {
					console.log('No');
					process.exit(0);
				}
			} else {
				xEvenValueStore.set(rowPosA, [colPosA, valueA]);
			}
			
		} else {
			// Odd column
			if (xOddValueStore.has(rowPosA)) {
				let storedColValB = xOddValueStore.get(rowPosA);
				let colPosB = storedColValB[0];
				let valueB = storedColValB[1];
				
				let currentDelta = (valueB - valueA) / ((colPosB - colPosA) / 2);
				if (colPosB > colPosA) {
					currentDelta *= -1;
				}
				
				if (gradXOdd === -1.0) {
					gradXOdd = currentDelta;
					
					for (let entryXOdd of xOddValueStore.entries()) {
						let currentRow = entryXOdd[0];
						let currentCol = entryXOdd[1][0];
						let currentValue = entryXOdd[1][1];
						
						if (currentValue - gradXOdd * Math.floor(currentCol / 2) < 0 ||
							currentValue + gradXOdd * Math.floor((numCols - currentCol) / 2) < 0) {
							console.log('No');
							process.exit(0);
						}
					}
				} else {
					if (currentDelta !== gradXOdd) {
						console.log('No');
						process.exit(0);
					}
				}
				if (valueA - gradXOdd * Math.floor(colPosA / 2) < 0 ||
					valueA + gradXOdd * Math.floor((numCols - colPosA) / 2) < 0) {
					console.log('No');
					process.exit(0);
				}
			} else {
				xOddValueStore.set(rowPosA, [colPosA, valueA]);
			}
		}
	}
}

// If all checks pass for all records, output 'Yes'
console.log('Yes');