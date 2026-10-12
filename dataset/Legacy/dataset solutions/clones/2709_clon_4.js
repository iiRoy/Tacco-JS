class LineProcessor {
    constructor(source) {
        this._sourceLines = source.trim().split('\n');
        this._currentLineIndex = 0;
        this._currentLineTokens = [];
    }

    getSingle(outputAsString = false) {
        if (this._currentLineTokens.length === 0) {
            if (this._currentLineIndex >= this._sourceLines.length) {
                throw new Error("No more input available for single value.");
            }
            this._currentLineTokens = this._sourceLines[this._currentLineIndex].split(' ').reverse();
            this._currentLineIndex++;
        }
        const val = this._currentLineTokens.pop();
        return outputAsString ? val : Number(val);
    }

    getLine(outputAsStrings = false) {
        if (this._currentLineIndex >= this._sourceLines.length) {
            throw new Error("No more input available for line.");
        }
        const lineParts = this._sourceLines[this._currentLineIndex].split(' ');
        this._currentLineIndex++;
        this._currentLineTokens = [];
        return outputAsStrings ? lineParts : lineParts.map(Number);
    }

    getMatrix(rowsCount, outputAsStrings = false) {
        if (this._currentLineIndex + rowsCount > this._sourceLines.length) {
            throw new Error("Not enough lines for matrix input.");
        }
        const matrixData = [];
        for (let i = 0; i < rowsCount; i++) {
            const rowParts = this._sourceLines[this._currentLineIndex].split(' ');
            matrixData.push(outputAsStrings ? rowParts : rowParts.map(Number));
            this._currentLineIndex++;
        }
        this._currentLineTokens = [];
        return matrixData;
    }

    getVector(elementsCount, outputAsStrings = false) {
        if (this._currentLineIndex + elementsCount > this._sourceLines.length) {
            throw new Error("Not enough lines for vector input.");
        }
        const vectorData = [];
        for (let i = 0; i < elementsCount; i++) {
            const element = this._sourceLines[this._currentLineIndex];
            vectorData.push(outputAsStrings ? element : Number(element));
            this._currentLineIndex++;
        }
        this._currentLineTokens = [];
        return vectorData;
    }
}

class MovementPathfinder {
    constructor(strideValue, targetCoordX, targetCoordY) {
        this.stride = strideValue;
        this.finalX = targetCoordX;
        this.finalY = targetCoordY;
        this.currentX = 0;
        this.currentY = 0;
        this.pathHistory = [];
    }

    measureDist(pX, pY) {
        return Math.abs(pX - this.finalX) + Math.abs(pY - this.finalY);
    }

    executeMove() {
        let remainingMovement = this.stride;
        const diffX = this.finalX - this.currentX;
        const diffY = this.finalY - this.currentY;

        if (diffX !== 0) {
            const moveAmtX = Math.min(remainingMovement, Math.abs(diffX));
            this.currentX += Math.sign(diffX) * moveAmtX;
            remainingMovement -= moveAmtX;
        }

        if (remainingMovement > 0) {
            if (diffY < 0) {
                this.currentY -= remainingMovement;
            } else {
                this.currentY += remainingMovement;
            }
        }
        this.pathHistory.push(`${this.currentX} ${this.currentY}`);
    }

    performInitialAdjustments() {
        let originToTargetDist = this.measureDist(0, 0);

        if (originToTargetDist === 0) {
            return;
        }

        if (originToTargetDist % this.stride !== 0) {
            const initialRemainder = originToTargetDist % this.stride;

            if (initialRemainder % 2 === 1) {
                this.executeMove();
            }

            let moveOffset = this.measureDist(this.currentX, this.currentY) % this.stride / 2;
            if (this.stride % 2 === 0) {
                moveOffset = this.stride - moveOffset;
            }

            const currentDiffX = this.finalX - this.currentX;
            const currentDiffY = this.finalY - this.currentY;

            if (Math.abs(currentDiffX) >= moveOffset) {
                this.currentX += Math.sign(currentDiffX) * moveOffset;
                this.currentY -= Math.sign(currentDiffY) * (this.stride - moveOffset);
            } else {
                this.currentY += Math.sign(currentDiffY) * moveOffset;
                this.currentX -= Math.sign(currentDiffX) * (this.stride - moveOffset);
            }
            this.pathHistory.push(`${this.currentX} ${this.currentY}`);
        }
    }

    determinePath() {
        if (this.finalX === 0 && this.finalY === 0) {
            return "0";
        }
        if (this.stride % 2 === 0 && (this.finalX + this.finalY) % 2 !== 0) {
            return "-1";
        }

        this.performInitialAdjustments();

        while (this.measureDist(this.currentX, this.currentY) > 0) {
            this.executeMove();
        }

        return `${this.pathHistory.length}\n${this.pathHistory.join("\n")}`;
    }
}

function applicationStart() {
    const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const dataStream = new LineProcessor(inputContent);

    const parameterK = dataStream.getSingle();
    const finalDestinationX = dataStream.getSingle();
    const finalDestinationY = dataStream.getSingle();

    const pathCalculator = new MovementPathfinder(parameterK, finalDestinationX, finalDestinationY);
    console.log(pathCalculator.determinePath());
}

applicationStart();