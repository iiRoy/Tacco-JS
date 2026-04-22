class ActionScheduler {
    constructor() {
        this.activeTimer = null;
    }
    schedule(delayMs, actionCallback) {
        if (this.activeTimer) {
            clearTimeout(this.activeTimer);
        }
        this.activeTimer = setTimeout(() => {
            actionCallback();
            this.activeTimer = null;
        }, delayMs);
    }
}

const TemporalOperations = (function() {
    const unitMapping = {
        'year': 'FullYear',
        'month': 'Month',
        'day': 'Date',
        'hour': 'Hours',
        'minute': 'Minutes',
        'second': 'Seconds'
    };

    function shiftDateUnit(originalDate, unitIdentifier, count) {
        const workingDate = new Date(originalDate.getTime());
        const setterMethod = 'set' + unitMapping[unitIdentifier];
        if (workingDate[setterMethod]) {
            workingDate[setterMethod](workingDate['get' + unitMapping[unitIdentifier]]() + count);
        }
        return workingDate;
    }

    function formatAsText(dateObject, patternString) {
        if (!dateObject || isNaN(dateObject.getTime())) return '';

        const year = dateObject.getFullYear();
        const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObject.getDate().toString().padStart(2, '0');
        const hours = dateObject.getHours().toString().padStart(2, '0');
        const minutes = dateObject.getMinutes().toString().padStart(2, '0');
        const seconds = dateObject.getSeconds().toString().padStart(2, '0');

        return patternString
            .replace(/Y/g, year)
            .replace(/m/g, month)
            .replace(/d/g, day)
            .replace(/H/g, hours)
            .replace(/i/g, minutes)
            .replace(/s/g, seconds);
    }

    function parseFromText(dateString, patternString) {
        let dateCandidate;

        if (patternString === 'Y-m-d') {
            const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (match) {
                const y = parseInt(match[1], 10);
                const m = parseInt(match[2], 10) - 1;
                const d = parseInt(match[3], 10);
                dateCandidate = new Date(y, m, d);
                if (dateCandidate.getFullYear() === y && dateCandidate.getMonth() === m && dateCandidate.getDate() === d) {
                    return dateCandidate;
                }
            }
        } else if (patternString === 'H:i') {
            const match = dateString.match(/^(\d{2}):(\d{2})$/);
            if (match) {
                const h = parseInt(match[1], 10);
                const min = parseInt(match[2], 10);
                dateCandidate = new Date();
                dateCandidate.setHours(h, min, 0, 0);
                if (dateCandidate.getHours() === h && dateCandidate.getMinutes() === min) {
                    return dateCandidate;
                }
            }
        }
        return null;
    }

    return {
        alter: shiftDateUnit,
        display: formatAsText,
        interpret: parseFromText
    };
})();

class ValueAdjustorBase {
    constructor(settings) {
        Object.assign(this, {
            initialValue: 0,
            lowerLimit: undefined,
            upperLimit: undefined,
            stepMagnitude: 1,
            altStepMagnitude: 5,
        }, settings);
        this.validationScheduler = new ActionScheduler();
    }

    increaseValue(inputElement) {
        this.applyAdjustment(inputElement, false, false);
    }

    decreaseValue(inputElement) {
        this.applyAdjustment(inputElement, true, false);
    }

    increaseValueRapidly(inputElement) {
        this.applyAdjustment(inputElement, false, true);
    }

    decreaseValueRapidly(inputElement) {
        this.applyAdjustment(inputElement, true, true);
    }

    applyAdjustment(inputElement, isDecreasing, isRapid) {
        this.validationScheduler.schedule(500, () => {
            if (inputElement && typeof inputElement.validate === 'function') {
                inputElement.validate();
            }
        });
    }

    constrainValue(currentValue) {
        return currentValue;
    }
}

class NumericValueAdjustor extends ValueAdjustorBase {
    constructor(settings) {
        super(Object.assign({
            allowFractionals: true,
            fractionalPrecision: 2,
        }, settings));
    }

    applyAdjustment(inputElement, isDecreasing, isRapid) {
        super.applyAdjustment(inputElement, isDecreasing, isRapid);

        let currentVal = parseFloat(inputElement.getValue());
        const adjustmentAmount = isRapid ? this.altStepMagnitude : this.stepMagnitude;

        currentVal = isDecreasing ? currentVal - adjustmentAmount : currentVal + adjustmentAmount;
        currentVal = isNaN(currentVal) ? this.initialValue : currentVal;
        currentVal = this.constrainValue(currentVal);
        inputElement.setRawValue(currentVal);
    }

    constrainValue(valueToBound) {
        let boundedVal = valueToBound;

        if (this.lowerLimit !== undefined && boundedVal < this.lowerLimit) {
            boundedVal = this.lowerLimit;
        }
        if (this.upperLimit !== undefined && boundedVal > this.upperLimit) {
            boundedVal = this.upperLimit;
        }

        return this.normalizeFractionals(boundedVal);
    }

    normalizeFractionals(valueToNormalize) {
        const isNumNaN = isNaN(valueToNormalize);
        if (!this.allowFractionals || this.fractionalPrecision === -1 || isNumNaN || valueToNormalize === null || valueToNormalize === undefined) {
            return isNumNaN ? '' : valueToNormalize;
        }
        return parseFloat(parseFloat(valueToNormalize).toFixed(this.fractionalPrecision));
    }
}

class CalendarValueAdjustor extends ValueAdjustorBase {
    constructor(settings) {
        super(Object.assign({
            initialValue: new Date(),
            displayFormat: "Y-m-d",
            stepMagnitude: 1,
            stepUnit: 'day',
            altStepMagnitude: 1,
            altStepUnit: 'month',
        }, settings));

        if (typeof this.initialValue === 'string') {
            this.initialValue = TemporalOperations.interpret(this.initialValue, this.displayFormat) || new Date();
        }
    }

    applyAdjustment(inputElement, isDecreasing, isRapid) {
        super.applyAdjustment(inputElement, isDecreasing, isRapid);

        let currentParsedDate = TemporalOperations.interpret(inputElement.getRawValue(), this.displayFormat);
        const directionMultiplier = isDecreasing ? -1 : 1;
        const adjustmentAmount = isRapid ? this.altStepMagnitude : this.stepMagnitude;
        const adjustmentUnit = isRapid ? this.altStepUnit : this.stepUnit;

        if (!currentParsedDate) {
            currentParsedDate = this.initialValue;
        }
        
        currentParsedDate = TemporalOperations.alter(currentParsedDate, adjustmentUnit, directionMultiplier * adjustmentAmount);
        currentParsedDate = this.constrainValue(currentParsedDate);
        
        inputElement.setRawValue(TemporalOperations.display(currentParsedDate, this.displayFormat));
    }

    constrainValue(dateToBound) {
        let boundedDate = dateToBound;
        
        const minDate = (typeof this.lowerLimit === 'string') ? TemporalOperations.interpret(this.lowerLimit, this.displayFormat) : this.lowerLimit;
        const maxDate = (typeof this.upperLimit === 'string') ? TemporalOperations.interpret(this.upperLimit, this.displayFormat) : this.upperLimit;

        if (minDate instanceof Date && !isNaN(minDate.getTime()) && boundedDate < minDate) {
            boundedDate = minDate;
        }
        if (maxDate instanceof Date && !isNaN(maxDate.getTime()) && boundedDate > maxDate) {
            boundedDate = maxDate;
        }

        return boundedDate;
    }
}

class ClockValueAdjustor extends CalendarValueAdjustor {
    constructor(settings) {
        super(Object.assign({
            displayFormat: "H:i",
            stepMagnitude: 1,
            stepUnit: 'minute',
            altStepMagnitude: 1,
            altStepUnit: 'hour',
        }, settings));
    }
}