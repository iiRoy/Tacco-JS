const characterTransformationUnit = (() => {
    const charsetConverter = require('iconv-lite');

    class ConversionMachine {
        constructor(outputFormatSpec, inputFormatSpec) {
            this.internalConverter = new charsetConverter.Iconv(inputFormatSpec, outputFormatSpec);
        }

        processChunk(incomingDataBlock) {
            return this.internalConverter.convert(incomingDataBlock);
        }
    }

    return {
        performTwoWayConversion: (sourceTextContent, intermediateEncodingSpecifier) => {
            const encodedBytesRepresentation = charsetConverter.encode(sourceTextContent, intermediateEncodingSpecifier);
            const decodedTextResult = charsetConverter.decode(encodedBytesRepresentation, 'iso-8859-1');
            return {
                intermediateData: encodedBytesRepresentation,
                restoredText: decodedTextResult
            };
        },

        establishDecodingStream: (outputFormatSpec, inputFormatSpec) => {
            return charsetConverter.decodeStream(inputFormatSpec);
        },

        executeDirectEncoding: (inputStringContent, targetEncodingSpecifier) => {
            return charsetConverter.encode(inputStringContent, targetEncodingSpecifier);
        },

        buildSegmentProcessor: (destinationEncodingSpec, sourceEncodingSpec) => {
            return new ConversionMachine(destinationEncodingSpec, sourceEncodingSpec);
        }
    };
})();

const verificationTool = require('assert');

let initialTextString = 'É isso ai. Testando acentuação: áéíóú...';
const conversionRecord = characterTransformationUnit.performTwoWayConversion(initialTextString, 'ISO-8859-1//TRANSLIT');
let finalDecodedString = conversionRecord.restoredText;

try {
    verificationTool.equal(initialTextString, finalDecodedString);
    console.log('Verification for round-trip encoding unexpectedly passed.');
} catch (assertionFailure) {
    console.log('Verification for round-trip encoding correctly failed (original UTF-8 != transliterated UTF-8).');
    throw assertionFailure;
}

const decoderPipeline = characterTransformationUnit.establishDecodingStream('UTF-8', 'LATIN1');
let collectedStreamOutput = '';

decoderPipeline.on('data', (dataChunk) => {
    let currentSegment = dataChunk.toString();
    console.log(`Streamed Data: ${currentSegment}`);
    collectedStreamOutput += currentSegment;
});

decoderPipeline.on('end', () => {
    try {
        verificationTool.equal(collectedStreamOutput, initialTextString);
        console.log('Stream output verification unexpectedly passed.');
    } catch (streamAssertionFailure) {
        console.log('Stream output verification correctly failed (original UTF-8 != transliterated stream output).');
        throw streamAssertionFailure;
    }
    console.log(`Complete Stream Output: ${collectedStreamOutput}`);
});

decoderPipeline.on('error', (processingError) => {
    console.error(`Stream Error: ${processingError}`);
    throw processingError;
});

const streamSourceBytes = conversionRecord.intermediateData;

let currentBytePosition = 0;
const segmentLengths = [1, 7, 8, 8, 4, 4];

for (const length of segmentLengths) {
    const endPosition = currentBytePosition + length;
    decoderPipeline.write(streamSourceBytes.slice(currentBytePosition, endPosition));
    currentBytePosition = endPosition;
}
decoderPipeline.write(streamSourceBytes.slice(currentBytePosition));
decoderPipeline.end();

let anotherInputString = 'aéióuçÁEÍOÚC';
const asciiEncodedBytes = characterTransformationUnit.executeDirectEncoding(anotherInputString, 'ASCII//TRANSLIT');
console.log(`${anotherInputString} => ${asciiEncodedBytes.toString()}`);

const segmentProcessorInstance = characterTransformationUnit.buildSegmentProcessor('utf16le', 'utf8');
const inputForUtf16Conversion = Buffer.from(anotherInputString);
const utf16TransformedData = segmentProcessorInstance.processChunk(inputForUtf16Conversion);
console.log(utf16TransformedData);