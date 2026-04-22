'use strict';
const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const layoutMetrics = sourceData[0].split(' ').map(Number);
const rowCount = layoutMetrics[0];
const columnCount = layoutMetrics[1];
const entryCount = parseInt(sourceData[1]);
const inputEntries = sourceData.slice(2);

class PathIntegrityUnit {
    constructor(totalExtent, isForEvenParity) {
        this.stableRate = null;
        this.registeredNodes = new Map();
        this.totalExtent = totalExtent;
        this.extentIsDual = (totalExtent === 2);
        this.isEvenNumbered = isForEvenParity;
    }

    determineRateFactor(prevDynamicCoord, currentDynamicCoord) {
        if (this.extentIsDual) {
            return currentDynamicCoord - prevDynamicCoord;
        } else {
            return (currentDynamicCoord - prevDynamicCoord) / 2;
        }
    }

    calculateStartSpan(dynamicCoord) {
        if (this.extentIsDual) {
            return dynamicCoord - 1;
        } else {
            return this.isEvenNumbered ? ((dynamicCoord / 2) - 1) : Math.floor(dynamicCoord / 2);
        }
    }

    calculateEndSpan(dynamicCoord) {
        if (this.extentIsDual) {
            return this.totalExtent - dynamicCoord;
        } else {
            return Math.floor((this.totalExtent - dynamicCoord) / 2);
        }
    }

    validateAndRegister(identityCoord, dynamicCoord, pointValue) {
        const previousDatum = this.registeredNodes.get(identityCoord);

        if (previousDatum) {
            const prevDynamicCoord = previousDatum.dynamicCoord;
            const prevPointValue = previousDatum.actualValue;

            const rateDivisor = this.determineRateFactor(prevDynamicCoord, dynamicCoord);

            let computedRate;

            if (rateDivisor === 0) {
                if (prevPointValue !== pointValue) {
                    console.log('No');
                    process.exit();
                }
                computedRate = 0;
            } else {
                computedRate = (prevPointValue - pointValue) / rateDivisor;

                if (!this.extentIsDual && Math.round(computedRate) !== computedRate) {
                    console.log('No');
                    process.exit();
                }
            }

            if (this.stableRate === null) {
                this.stableRate = computedRate;
                for (const [key, storedPair] of this.registeredNodes.entries()) {
                    const storedDynamicCoord = storedPair.dynamicCoord;
                    const storedActualValue = storedPair.actualValue;

                    const startConstraint = storedActualValue - this.stableRate * this.calculateStartSpan(storedDynamicCoord);
                    const endConstraint = storedActualValue + this.stableRate * this.calculateEndSpan(storedDynamicCoord);

                    if (startConstraint < 0 || endConstraint < 0) {
                        console.log('No');
                        process.exit();
                    }
                }
            } else {
                if (computedRate !== this.stableRate) {
                    console.log('No');
                    process.exit();
                }
            }

            const startConstraintCurrent = pointValue - this.stableRate * this.calculateStartSpan(dynamicCoord);
            const endConstraintCurrent = pointValue + this.stableRate * this.calculateEndSpan(dynamicCoord);

            if (startConstraintCurrent < 0 || endConstraintCurrent < 0) {
                console.log('No');
                process.exit();
            }

        } else {
            this.registeredNodes.set(identityCoord, { dynamicCoord: dynamicCoord, actualValue: pointValue });
        }
    }
}

const verticalEvenUnit = new PathIntegrityUnit(rowCount, true);
const verticalOddUnit = new PathIntegrityUnit(rowCount, false);
const horizontalEvenUnit = new PathIntegrityUnit(columnCount, true);
const horizontalOddUnit = new PathIntegrityUnit(columnCount, false);

for (let i = 0; i < entryCount; i++) {
    const currentEntry = inputEntries[i].split(' ');
    const entryRow = parseInt(currentEntry[0]);
    const entryColumn = parseInt(currentEntry[1]);
    const entryValue = parseInt(currentEntry[2]);

    if (rowCount === 2) {
        verticalEvenUnit.validateAndRegister(entryColumn, entryRow, entryValue);
    } else {
        if (entryRow % 2 === 0) {
            verticalEvenUnit.validateAndRegister(entryColumn, entryRow, entryValue);
        } else {
            verticalOddUnit.validateAndRegister(entryColumn, entryRow, entryValue);
        }
    }

    if (columnCount === 2) {
        horizontalEvenUnit.validateAndRegister(entryRow, entryColumn, entryValue);
    } else {
        if (entryColumn % 2 === 0) {
            horizontalEvenUnit.validateAndRegister(entryRow, entryColumn, entryValue);
        } else {
            horizontalOddUnit.validateAndRegister(entryRow, entryColumn, entryValue);
        }
    }
}

console.log('Yes');