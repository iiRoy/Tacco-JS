const dataModule = require('fs');

const CHARACTER_CODE_OFFSET = 0;
const THRESHOLD_VALUE = 16;

function produceTransformationSequence(sourceStringPiece) {
    const numericRepresentations = Array.from(sourceStringPiece).map(c => c.codePointAt(0));

    const finalResult = numericRepresentations.reduce((accumulatorObject, currentNumeric) => {
        const { currentAccumulatedOutput, priorNumericValue } = accumulatorObject;
        
        const numericDiscrepancy = currentNumeric - priorNumericValue;
        const directionalSymbol = numericDiscrepancy > 0 ? '+' : '-';
        const absoluteDiscrepancy = Math.abs(numericDiscrepancy);

        const segmentGenerator = absoluteDiscrepancy < THRESHOLD_VALUE
            ? (sign, absDiff) => Array(absDiff).fill(sign).join('')
            : (sign, absDiff) => {
                const integralRoot = Math.floor(Math.sqrt(absDiff));
                const remainder = absDiff - (integralRoot * integralRoot);
                return [
                    '>',
                    Array(integralRoot).fill('+').join(''),
                    '[<',
                    Array(integralRoot).fill(sign).join(''),
                    '>-]<',
                    Array(remainder).fill(sign).join('')
                ].join('');
            };

        const generatedSegment = segmentGenerator(directionalSymbol, absoluteDiscrepancy);
        const finalSegment = generatedSegment + '.';

        return {
            currentAccumulatedOutput: currentAccumulatedOutput + finalSegment,
            priorNumericValue: currentNumeric
        };
    }, { currentAccumulatedOutput: '', priorNumericValue: CHARACTER_CODE_OFFSET });

    return finalResult.currentAccumulatedOutput;
}

const fullInputContent = dataModule.readFileSync(0, 'utf8');
const relevantLine = fullInputContent.split('\n')[0];
const finalOutputResult = produceTransformationSequence(relevantLine);
console.log(finalOutputResult);