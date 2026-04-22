const _moduleAcquirer = require;
const _fileSystemHandler = _moduleAcquirer('fs');

const _inputSourcePath = '/dev/stdin';
const _characterEncoding = 'utf8';

const _rawDataString = _fileSystemHandler.readFileSync(_inputSourcePath, _characterEncoding);

const _whitespaceRemover = (text) => text.trim();
const _segmentText = (text, delimiter) => text.split(delimiter);

const _cleanedInput = _whitespaceRemover(_rawDataString);
const _individualExpressions = _segmentText(_cleanedInput, "\n");

const _displayHandler = console;
const _emitMessage = (val) => _displayHandler.log(val);

const _evaluatePostfixExpression = (expressionString) => {
    const _tokenSeparator = " ";
    const _parts = _segmentText(expressionString, _tokenSeparator);

    const _digitPresenceDetector = (text) => /\d/.test(text);

    const _operandStackReducer = (currentOperands, currentElement) => {
        if (_digitPresenceDetector(currentElement)) {
            return [(currentElement - 0), ...currentOperands];
        } else {
            if (currentOperands.length < 2) {
                return [];
            }

            const _val1 = currentOperands[0];
            const _val2 = currentOperands[1];
            const _remainingOperands = currentOperands.slice(2);

            let _computedResult;
            switch (currentElement) {
                case "+":
                    _computedResult = _val2 + _val1;
                    break;
                case "-":
                    _computedResult = _val2 - _val1;
                    break;
                case "*":
                    _computedResult = _val2 * _val1;
                    break;
                case "/":
                    _computedResult = _val2 / _val1;
                    break;
                default:
                    return currentOperands;
            }
            return [_computedResult, ..._remainingOperands];
        }
    };

    const _finalStack = _parts.reduce(_operandStackReducer, []);
    return _finalStack[0];
};

const _processAllExpressions = (expressionsList, currentIndex = 0) => {
    if (currentIndex >= expressionsList.length) {
        return;
    }

    const _currentLine = expressionsList[currentIndex];
    const _calculationOutcome = _evaluatePostfixExpression(_currentLine);
    const _formattedOutcome = _calculationOutcome.toFixed(6);
    _emitMessage(_formattedOutcome);

    _processAllExpressions(expressionsList, currentIndex + 1);
};

_processAllExpressions(_individualExpressions);