'use strict';
const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const rowColCounts = inputLines[0].split(' ').map(Number);
const numRows = rowColCounts[0];
const numCols = rowColCounts[1];
const numPoints = parseInt(inputLines[1]);
const pointDataStrings = inputLines.slice(2);

let diffXOdd = -1;
let diffXEven = -1;
let diffYOdd = -1;
let diffYEven = -1;

const xOddMap = new Map();
const xEvenMap = new Map();
const yOddMap = new Map();
const yEvenMap = new Map();

const signalNoAndExit = () => {
    console.log('No');
    process.exit();
};

const validateBounds = (valA, valB) => {
    if (valA < 0 || valB < 0) {
        signalNoAndExit();
    }
};

const ensureIntegerDiff = (diffVal) => {
    if (Math.round(diffVal) !== diffVal) {
        signalNoAndExit();
    }
};

for (let i = 0; i < numPoints; i++) {
    const currentPointStrParts = pointDataStrings[i].split(' ');
    const currR = parseInt(currentPointStrParts[0]);
    const currC = parseInt(currentPointStrParts[1]);
    const currA = parseInt(currentPointStrParts[2]);

    // --- Y-axis processing (rows) ---
    if (numRows === 2) {
        if (yEvenMap.has(currC)) {
            const prevRA = yEvenMap.get(currC);
            const prevR = prevRA[0];
            const prevA = prevRA[1];
            
            const deltaR = prevR - currR;
            const calculatedDiff = (prevA - currA) / deltaR;
            
            if (diffYEven === -1) {
                diffYEven = calculatedDiff;
                
                for (const mapEntry of yEvenMap.entries()) {
                    const iterC = mapEntry[0];
                    const iterR = mapEntry[1][0];
                    const iterA = mapEntry[1][1];
                    
                    validateBounds(iterA - calculatedDiff * (iterR - 1), iterA + calculatedDiff * (numRows - iterR));
                }
            } else {
                if (calculatedDiff !== diffYEven) {
                    signalNoAndExit();
                }
            }
            validateBounds(currA - calculatedDiff * (currR - 1), currA + calculatedDiff * (numRows - currR));
            
        } else {
            yEvenMap.set(currC, [currR, currA]);
        }
        
    } else { // numRows > 2
        if (currR % 2 === 0) { // Even row
            if (yEvenMap.has(currC)) {
                const prevRA = yEvenMap.get(currC);
                const prevR = prevRA[0];
                const prevA = prevRA[1];
                
                const deltaRHalf = (prevR - currR) * 0.5;
                const calculatedDiff = (prevA - currA) / deltaRHalf;
                
                if (diffYEven === -1) {
                    ensureIntegerDiff(calculatedDiff);
                    diffYEven = calculatedDiff;
                    
                    for (const mapEntry of yOddMap.entries()) { // Original iterates over yOddMap here
                        const iterC = mapEntry[0];
                        const iterR = mapEntry[1][0];
                        const iterA = mapEntry[1][1];
                        
                        validateBounds(iterA - calculatedDiff * ((iterR * 0.5) - 1), iterA + calculatedDiff * Math.floor((numRows - iterR) * 0.5));
                    }
                } else {
                    if (calculatedDiff !== diffYEven) {
                        signalNoAndExit();
                    }
                }
                validateBounds(currA - calculatedDiff * ((currR * 0.5) - 1), currA + calculatedDiff * Math.floor((numRows - currR) * 0.5));
                
            } else {
                yEvenMap.set(currC, [currR, currA]);
            }
            
        } else { // Odd row
            if (yOddMap.has(currC)) {
                const prevRA = yOddMap.get(currC);
                const prevR = prevRA[0];
                const prevA = prevRA[1];
                
                const deltaRHalf = (prevR - currR) * 0.5;
                const calculatedDiff = (prevA - currA) / deltaRHalf;
                
                if (diffYOdd === -1) {
                    ensureIntegerDiff(calculatedDiff);
                    diffYOdd = calculatedDiff;
                    
                    for (const mapEntry of yOddMap.entries()) {
                        const iterC = mapEntry[0];
                        const iterR = mapEntry[1][0];
                        const iterA = mapEntry[1][1];
                        
                        validateBounds(iterA - calculatedDiff * Math.floor(iterR * 0.5), iterA + calculatedDiff * Math.floor((numRows - iterR) * 0.5));
                    }
                } else {
                    if (calculatedDiff !== diffYOdd) {
                        signalNoAndExit();
                    }
                }
                validateBounds(currA - calculatedDiff * Math.floor(currR * 0.5), currA + calculatedDiff * Math.floor((numRows - currR) * 0.5));
            } else {
                yOddMap.set(currC, [currR, currA]);
            }
        }
    }
    
    // --- X-axis processing (columns) ---
    if (numCols === 2) {
        if (xEvenMap.has(currR)) {
            const prevCA = xEvenMap.get(currR);
            const prevC = prevCA[0];
            const prevA = prevCA[1];
            
            const deltaC = prevC - currC;
            const calculatedDiff = (prevA - currA) / deltaC;
            
            if (diffXEven === -1) {
                diffXEven = calculatedDiff;
                
                for (const mapEntry of xEvenMap.entries()) {
                    const iterR = mapEntry[0];
                    const iterC = mapEntry[1][0];
                    const iterA = mapEntry[1][1];
                    
                    validateBounds(iterA - calculatedDiff * (iterC - 1), iterA + calculatedDiff * (numCols - iterC));
                }
            } else {
                if (calculatedDiff !== diffXEven) {
                    signalNoAndExit();
                }
            }
            validateBounds(currA - calculatedDiff * currC, currA + calculatedDiff * (numCols - currC));
            
        } else {
            xEvenMap.set(currR, [currC, currA]);
        }
    } else { // numCols > 2
        if (currC % 2 === 0) { // Even column
            if (xEvenMap.has(currR)) {
                const prevCA = xEvenMap.get(currR);
                const prevC = prevCA[0];
                const prevA = prevCA[1];
                
                const deltaCHalf = (prevC - currC) * 0.5;
                const calculatedDiff = (prevA - currA) / deltaCHalf;
                
                if (diffXEven === -1) {
                    ensureIntegerDiff(calculatedDiff);
                    diffXEven = calculatedDiff;
                    
                    for (const mapEntry of xEvenMap.entries()) {
                        const iterR = mapEntry[0];
                        const iterC = mapEntry[1][0];
                        const iterA = mapEntry[1][1];
                        
                        validateBounds(iterA - calculatedDiff * ((iterC * 0.5) - 1), iterA + calculatedDiff * Math.floor((numCols - iterC) * 0.5));
                    }
                } else {
                    if (calculatedDiff !== diffXEven) {
                        signalNoAndExit();
                    }
                }
                validateBounds(currA - calculatedDiff * ((currC * 0.5) - 1), currA + calculatedDiff * Math.floor((numCols - currC) * 0.5));
            } else {
                xEvenMap.set(currR, [currC, currA]);
            }
            
        } else { // Odd column
            if (xOddMap.has(currR)) {
                const prevCA = xOddMap.get(currR);
                const prevC = prevCA[0];
                const prevA = prevCA[1];
                
                const deltaCHalf = (prevC - currC) * 0.5;
                const calculatedDiff = (prevA - currA) / deltaCHalf;
                
                if (diffXOdd === -1) {
                    ensureIntegerDiff(calculatedDiff);
                    diffXOdd = calculatedDiff;
                    
                    for (const mapEntry of xOddMap.entries()) {
                        const iterR = mapEntry[0];
                        const iterC = mapEntry[1][0];
                        const iterA = mapEntry[1][1];
                        
                        validateBounds(iterA - calculatedDiff * Math.floor(iterC * 0.5), iterA + calculatedDiff * Math.floor((numCols - iterC) * 0.5));
                    }
                } else {
                    if (calculatedDiff !== diffXOdd) {
                        signalNoAndExit();
                    }
                }
                validateBounds(currA - calculatedDiff * Math.floor(currC * 0.5), currA + calculatedDiff * Math.floor((numCols - currC) * 0.5));
            } else {
                xOddMap.set(currR, [currC, currA]);
            }
        }
    }
}

console.log('Yes');
