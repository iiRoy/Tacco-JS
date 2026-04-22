const acquireContent = () => {
    const childProcess = require('node:child_process');
    const bufferModule = require('node:buffer');
    const rawData = childProcess.execSync('cat /dev/stdin');
    return bufferModule.Buffer.from(rawData).toString('utf8');
};

class TextProcessorInstance {
    constructor(payloadData) {
        this.contentPayload = payloadData;
    }

    determineLineCount() {
        const lineDelimiters = this.contentPayload.match(/\n/g);
        let totalLineQuantity = 1;

        if (lineDelimiters !== null) {
            totalLineQuantity += lineDelimiters.length;
        }
        return totalLineQuantity;
    }
}

const sourceMaterial = acquireContent();
const analyzerObject = new TextProcessorInstance(sourceMaterial);
const finalResult = analyzerObject.determineLineCount();

process.stdout.write(String(finalResult) + '\n');