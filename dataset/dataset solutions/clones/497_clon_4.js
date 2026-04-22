const acquireRawData = () => {
    const fileDescriptor = global.process.stdin.fd;
    const bufferSize = 1024;
    let totalData = '';
    let bytesRead;
    const dataBuffer = Buffer.alloc(bufferSize);

    while (true) {
        try {
            bytesRead = require('fs').readSync(fileDescriptor, dataBuffer, 0, bufferSize, null);
        } catch (inputError) {
            break;
        }
        if (bytesRead === 0) {
            break;
        }
        totalData += dataBuffer.toString('utf8', 0, bytesRead);
    }
    return totalData;
};

class Hypercomplex {
    constructor(scalarComponent, iUnit, jUnit, kUnit) {
        this.scalarComponent = scalarComponent;
        this.iUnit = iUnit;
        this.jUnit = jUnit;
        this.kUnit = kUnit;
    }

    static fromNumericArray(componentSource) {
        if (componentSource.length !== 4) {
            throw new Error("Input array must provide four components.");
        }
        return new Hypercomplex(
            componentSource[0],
            componentSource[1],
            componentSource[2],
            componentSource[3]
        );
    }

    performProduct(otherHypercomplex) {
        const productScalar =
            this.scalarComponent * otherHypercomplex.scalarComponent -
            this.iUnit * otherHypercomplex.iUnit -
            this.jUnit * otherHypercomplex.jUnit -
            this.kUnit * otherHypercomplex.kUnit;

        const productI =
            this.scalarComponent * otherHypercomplex.iUnit +
            this.iUnit * otherHypercomplex.scalarComponent +
            this.jUnit * otherHypercomplex.kUnit -
            this.kUnit * otherHypercomplex.jUnit;

        const productJ =
            this.scalarComponent * otherHypercomplex.jUnit -
            this.iUnit * otherHypercomplex.kUnit +
            this.jUnit * otherHypercomplex.scalarComponent +
            this.kUnit * otherHypercomplex.iUnit;

        const productK =
            this.scalarComponent * otherHypercomplex.kUnit +
            this.iUnit * otherHypercomplex.jUnit -
            this.jUnit * otherHypercomplex.iUnit +
            this.kUnit * otherHypercomplex.scalarComponent;

        return new Hypercomplex(productScalar, productI, productJ, productK);
    }

    getFormattedOutput() {
        return `${this.scalarComponent} ${this.iUnit} ${this.jUnit} ${this.kUnit}`;
    }
}

const executeOperations = () => {
    const rawDataContent = acquireRawData();
    const allTextLines = rawDataContent.trim().split(/\r?\n/);

    const operationCount = Number(allTextLines[0]);

    const finalOutputs = allTextLines.slice(1).reduce((resultsCollection, currentDataLine, lineIndex) => {
        if (currentDataLine === '0' || lineIndex >= operationCount) {
            return resultsCollection;
        }

        const numericalElements = currentDataLine.split(' ').map(element => Number(element));

        const firstHypercomplex = Hypercomplex.fromNumericArray(numericalElements.slice(0, 4));
        const secondHypercomplex = Hypercomplex.fromNumericArray(numericalElements.slice(4, 8));

        const resultantHypercomplex = firstHypercomplex.performProduct(secondHypercomplex);

        resultsCollection.push(resultantHypercomplex.getFormattedOutput());
        return resultsCollection;
    }, []);

    global.console.log(finalOutputs.join('\n'));
};

executeOperations();