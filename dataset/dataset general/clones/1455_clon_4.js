const { parse: interpretCsvData } = require('csv-parser');
const { stringify: formatCsvOutput } = require('csv-stringify');
const { Transform: DataProcessor } = require('stream');

const commandLineArgs = process.argv;
const minimumArgumentCount = 3;
const reportErrorAndExit = (message) => {
    console.error(message);
    process.exit(1);
};
const standardInputSource = process.stdin;
const standardOutputSink = process.stdout;

if (commandLineArgs.length < minimumArgumentCount) {
    reportErrorAndExit(`Usage: ${commandLineArgs[0]} ${commandLineArgs[1]} <target_column_1> <target_column_2> ...`);
}

const requestedColumns = commandLineArgs.slice(2);

const csvObjectConverter = interpretCsvData();

const csvTextFormatter = formatCsvOutput({ header: false });

class CustomColumnSelector extends DataProcessor {
    constructor(columnsToExtract, options) {
        super({ objectMode: true, ...options });
        this.columnsToRetain = columnsToExtract;
        this.headerSent = false;
    }

    _transform(inputObject, encoding, completionCallback) {
        if (!this.headerSent) {
            this.push(this.columnsToRetain);
            this.headerSent = true;
        }

        const outputRowArray = this.columnsToRetain.map(columnKey => inputObject[columnKey] || '');

        this.push(outputRowArray);
        completionCallback();
    }
}

const columnTransformerInstance = new CustomColumnSelector(requestedColumns);

standardInputSource
    .pipe(csvObjectConverter)
    .pipe(columnTransformerInstance)
    .pipe(csvTextFormatter)
    .pipe(standardOutputSink);

standardInputSource.on('error', (err) => {
    reportErrorAndExit(`Input stream encountered an issue: ${err.message}`);
});
csvObjectConverter.on('error', (err) => {
    reportErrorAndExit(`CSV parsing failed: ${err.message}`);
});
columnTransformerInstance.on('error', (err) => {
    reportErrorAndExit(`Data transformation failed: ${err.message}`);
});
csvTextFormatter.on('error', (err) => {
    reportErrorAndExit(`CSV formatting failed: ${err.message}`);
});
standardOutputSink.on('error', (err) => {
    reportErrorAndExit(`Output stream encountered an issue: ${err.message}`);
});