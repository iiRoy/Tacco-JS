class InputInterpreter {
    constructor(payloadString) {
        this.payload = payloadString;
        this.valueA = 0;
        this.valueB = 0;
    }

    disassemblePayload() {
        let currentSegmentBuffer = '';
        let spaceEncountered = false;

        for (let idx = 0; idx < this.payload.length; idx++) {
            const charToken = this.payload[idx];
            if (charToken === ' ' && !spaceEncountered) {
                this.valueA = Number(currentSegmentBuffer);
                currentSegmentBuffer = '';
                spaceEncountered = true;
            } else if ((charToken >= '0' && charToken <= '9') || charToken === '-') {
                currentSegmentBuffer += charToken;
            }
        }
        this.valueB = Number(currentSegmentBuffer);
    }
}

class ArithmeticProcessor {
    constructor(firstOperand, secondOperand) {
        this.operandX = firstOperand;
        this.operandY = secondOperand;
    }

    deriveFloorQuotient() {
        const preciseRatio = this.operandX / this.operandY;
        if (preciseRatio >= 0) {
            return Math.trunc(preciseRatio);
        } else {
            if (preciseRatio === Math.trunc(preciseRatio)) {
                return Math.trunc(preciseRatio);
            } else {
                return Math.trunc(preciseRatio) - 1;
            }
        }
    }

    deriveJsRemainder() {
        const truncRatio = Math.trunc(this.operandX / this.operandY);
        return this.operandX - (truncRatio * this.operandY);
    }

    deriveFloatingResult() {
        return this.operandX / this.operandY;
    }
}

class OutputPresenter {
    static createDisplayString(integralPart, remainderValue, fractionalPart) {
        return integralPart + ' ' + remainderValue + ' ' + fractionalPart;
    }
}

const rawSystemInput = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputParser = new InputInterpreter(rawSystemInput);
inputParser.disassemblePayload();

const calculationEngine = new ArithmeticProcessor(inputParser.valueA, inputParser.valueB);

const floorResult = calculationEngine.deriveFloorQuotient();
const remainderResult = calculationEngine.deriveJsRemainder();
const floatResult = calculationEngine.deriveFloatingResult();

const finalOutputString = OutputPresenter.createDisplayString(floorResult, remainderResult, floatResult);
console.log(finalOutputString);