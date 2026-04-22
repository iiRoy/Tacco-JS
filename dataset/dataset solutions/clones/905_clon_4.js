class InputParser {
    constructor() {
        this.dataBuffer = '';
        this.tokenPointer = 0;
        this.allTokens = [];

        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (chunk) => {
            this.dataBuffer += chunk;
        });

        process.stdin.on('end', () => {
            this.allTokens = this.dataBuffer.trim().split(/\s+/);
            this.executeParenthesisSolver();
        });
    }

    retrieveNextInteger() {
        return parseInt(this.allTokens[this.tokenPointer++], 10);
    }

    retrieveNextText() {
        return this.allTokens[this.tokenPointer++];
    }

    executeParenthesisSolver() {
        const totalInputCount = this.retrieveNextInteger();
        const initialSegmentStrings = [];
        for (let idx = 0; idx < totalInputCount; ++idx) {
            initialSegmentStrings.push(this.retrieveNextText());
        }

        const processedSegmentCharacteristics = initialSegmentStrings.map(segment => this.analyzeParenthesisSegment(segment));

        const overallNetBalance = processedSegmentCharacteristics.reduce((accumulator, current) => accumulator + (current.addedOpen - current.neededClose), 0);
        if (overallNetBalance !== 0) {
            console.log('No');
            return;
        }

        const segmentsThatOnlyAddBalance = processedSegmentCharacteristics.filter(segment => segment.neededClose === 0);
        const segmentsThatRequireBalance = processedSegmentCharacteristics.filter(segment => segment.neededClose > 0);

        segmentsThatOnlyAddBalance.sort((first, second) => second.addedOpen - first.addedOpen);

        segmentsThatRequireBalance.sort((first, second) => {
            if (first.neededClose !== second.neededClose) {
                return first.neededClose - second.neededClose;
            }
            return second.addedOpen - first.addedOpen;
        });

        let currentAccumulatedBalance = 0;
        let solutionAchievable = true;

        for (const segment of segmentsThatOnlyAddBalance) {
            currentAccumulatedBalance += segment.addedOpen;
        }

        for (const segment of segmentsThatRequireBalance) {
            if (currentAccumulatedBalance < segment.neededClose) {
                solutionAchievable = false;
                break;
            }
            currentAccumulatedBalance += (segment.addedOpen - segment.neededClose);
        }
        
        if (currentAccumulatedBalance !== 0) {
             solutionAchievable = false;
        }

        console.log(solutionAchievable ? 'Yes' : 'No');
    }

    analyzeParenthesisSegment(segmentString) {
        let temporaryOpenBalance = 0;
        let leadingClosingDeficit = 0;

        Array.from(segmentString).forEach(character => {
            if (character === '(') {
                temporaryOpenBalance++;
            } else { // character === ')'
                if (temporaryOpenBalance > 0) {
                    temporaryOpenBalance--;
                } else {
                    leadingClosingDeficit++;
                }
            }
        });

        return {
            neededClose: leadingClosingDeficit,
            addedOpen: temporaryOpenBalance
        };
    }
}

new InputParser();