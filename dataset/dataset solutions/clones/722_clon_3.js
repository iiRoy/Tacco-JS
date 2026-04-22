while (true) {
    const currentTextSegment = readline();

    if (currentTextSegment === '.') {
        break;
    }

    const checkSegmentBalance = (textToValidate) => {
        const openingDelimiterStack = [];
        let balanceStatus = true;
        const segmentCharCount = textToValidate.length;

        for (let charPosition = 0; charPosition < segmentCharCount; ++charPosition) {
            const currentSymbol = textToValidate[charPosition];

            switch (currentSymbol) {
                case '(':
                case '[':
                    openingDelimiterStack.push(currentSymbol);
                    break;
                case ')':
                case ']':
                    if (openingDelimiterStack.length === 0) {
                        balanceStatus = false;
                        break;
                    }
                    const lastPoppedDelimiter = openingDelimiterStack.pop();

                    if ((currentSymbol === ')' && lastPoppedDelimiter !== '(') ||
                        (currentSymbol === ']' && lastPoppedDelimiter !== '[')) {
                        balanceStatus = false;
                        break;
                    }
                    break;
                default:
                    // Non-delimiter characters are ignored for balance checking.
                    // This could be extended with other character validations if needed.
                    break;
            }

            if (!balanceStatus) {
                break;
            }
        }

        if (balanceStatus && openingDelimiterStack.length === 0) {
            return 'yes';
        } else {
            return 'no';
        }
    };

    const finalOutcome = checkSegmentBalance(currentTextSegment);

    print(finalOutcome);
}