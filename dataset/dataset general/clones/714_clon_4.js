const MAXIMUM_ARCHIVE_LENGTH = 30;
const DATA_BLOCK_CAPACITY = 10 * 1024; // Not directly used in this implementation, kept for conceptual equivalence

function createEventRelay() {
    const registry = {};

    function register(signal, handler) {
        if (!registry[signal]) {
            registry[signal] = [];
        }
        registry[signal].push(handler);
    }

    function deregister(signal, handler) {
        if (registry[signal]) {
            registry[signal] = registry[signal].filter(h => h !== handler);
        }
    }

    function dispatch(signal, ...args) {
        if (registry[signal]) {
            // Dispatch asynchronously to prevent blocking if handlers are slow
            setTimeout(() => registry[signal].forEach(handler => handler(...args)), 0);
        }
    }
    return { register, deregister, dispatch };
}

function createTextConverter(encoding = 'utf8') {
    let internalBuffer = Buffer.from('');
    return {
        process(chunk) {
            internalBuffer = Buffer.concat([internalBuffer, chunk]);
            const result = internalBuffer.toString(encoding);
            internalBuffer = Buffer.from('');
            return result;
        },
        flush() {
            const result = internalBuffer.toString(encoding);
            internalBuffer = Buffer.from('');
            return result;
        }
    };
}

const terminalManipulator = {
    shiftGlyph(channel, horizOffset, vertOffset) {
        let escSequence = '';
        if (horizOffset !== 0) escSequence += `\x1b[${Math.abs(horizOffset)}${horizOffset > 0 ? 'C' : 'D'}`;
        if (vertOffset !== 0) escSequence += `\x1b[${Math.abs(vertOffset)}${vertOffset > 0 ? 'B' : 'A'}`;
        if (escSequence) channel.write(escSequence);
    },
    positionGlyph(channel, column) {
        channel.write(`\x1b[${column + 1}G`);
    },
    clearBelowGlyph(channel) {
        channel.write('\x1b[0J');
    },
    activateKeySignal(stream) {
        // This function would typically wrap the stream to parse raw input into keypress events.
        // For a Type IV clone, we assume this capability is provided externally,
        // as reimplementing full terminal escape sequence parsing is too complex
        // and usually a separate utility.
        if (typeof stream.setRawMode === 'function') {
            stream.setRawMode(true);
        }
        // In a real scenario, this would attach a parser to 'data' and emit 'keypress'.
        // For this clone, we're assuming 'keypress' events *will* be emitted
        // by the provided `stream` if `activateKeySignal` is called.
    }
};

function generateInputProcessor(streamA, streamB, completionResolver, isTerminalFlag) {
    const comms = createEventRelay();

    let currentPromptText = '';
    let currentPromptLength = 0;
    let awaitedResponse = null;
    let previousPromptText = '';

    let activeInputSource = streamA;
    let activeOutputSink = streamB;

    let processingCompleter = completionResolver || (() => []);
    if (typeof processingCompleter !== 'function') {
        throw new TypeError('Argument \'completionResolver\' must be a function');
    }

    const adjustedCompleter = processingCompleter.length === 2
        ? processingCompleter
        : (segment, resultCallback) => resultCallback(null, processingCompleter(segment));

    const effectiveTerminalStatus = typeof isTerminalFlag === 'undefined'
        ? !!activeOutputSink.isTTY
        : !!isTerminalFlag;

    let isInputPaused = false;
    let isProcessorClosed = false;

    let lineBuffer = '';
    let lastCharWasReturn = false;

    let currentInputLine = '';
    let currentCursorPosition = 0;
    let lineArchive = [];
    let archiveTraversalIndex = -1;
    let priorDisplayedRows = 0;

    let textDecoder = null;

    const keyActionMap = new Map();

    function retrieveColumnCapacity() {
        return activeOutputSink.columns || Infinity;
    }

    function updatePromptDisplayInfo(newPrompt, explicitLength) {
        currentPromptText = newPrompt;
        if (explicitLength) {
            currentPromptLength = explicitLength;
        } else {
            const sections = newPrompt.split(/[\r\n]/);
            const finalSection = sections[sections.length - 1];
            currentPromptLength = finalSection.length;
        }
    }

    function adjustRawMode(enable) {
        if (typeof activeInputSource.setRawMode === 'function') {
            return activeInputSource.setRawMode(enable);
        }
    }

    function acquireGlyphPosition() {
        const availableColumns = retrieveColumnCapacity();
        const combinedPosition = currentPromptLength + currentCursorPosition;
        return {
            cols: combinedPosition % availableColumns,
            rows: Math.floor(combinedPosition / availableColumns)
        };
    }

    function redrawCurrentLine() {
        if (!effectiveTerminalStatus) return;

        const availableColumns = retrieveColumnCapacity();
        const combinedLineContent = currentPromptText + currentInputLine;
        const totalContentLength = combinedLineContent.length;
        const contentColumns = totalContentLength % availableColumns;
        const contentRows = Math.floor(totalContentLength / availableColumns);

        const logicalCursorDisplay = acquireGlyphPosition();

        if (priorDisplayedRows > 0) {
            terminalManipulator.shiftGlyph(activeOutputSink, 0, -priorDisplayedRows);
        }

        terminalManipulator.positionGlyph(activeOutputSink, 0);
        terminalManipulator.clearBelowGlyph(activeOutputSink);

        activeOutputSink.write(combinedLineContent);

        if (contentColumns === 0) {
            activeOutputSink.write(' ');
        }

        terminalManipulator.positionGlyph(activeOutputSink, logicalCursorDisplay.cols);

        const rowDifference = contentRows - logicalCursorDisplay.rows;
        if (rowDifference > 0) {
            terminalManipulator.shiftGlyph(activeOutputSink, 0, -rowDifference);
        }

        priorDisplayedRows = logicalCursorDisplay.rows;
    }

    function repositionGlyph(delta) {
        const newPosition = currentCursorPosition + delta;
        currentCursorPosition = Math.max(0, Math.min(newPosition, currentInputLine.length));
        redrawCurrentLine();
    }

    function processCompletedLine(resolvedLine) {
        if (awaitedResponse) {
            const responseCallback = awaitedResponse;
            awaitedResponse = null;
            updatePromptDisplayInfo(previousPromptText);
            responseCallback(resolvedLine);
        } else {
            comms.dispatch('processedLine', resolvedLine);
        }
    }

    function storeLineInArchive() {
        if (currentInputLine.length === 0) return '';

        if (lineArchive.length === 0 || lineArchive[0] !== currentInputLine) {
            lineArchive.unshift(currentInputLine);
            if (lineArchive.length > MAXIMUM_ARCHIVE_LENGTH) {
                lineArchive.pop();
            }
        }
        archiveTraversalIndex = -1;
        return lineArchive[0];
    }

    const lineBreakPattern = /\r?\n|\r(?!\n)/;
    function ingestStreamData(incomingChunk) {
        if (incomingChunk === undefined) return;

        const dataString = textDecoder.process(incomingChunk);
        let processedString = dataString;

        if (lastCharWasReturn) {
            processedString = processedString.replace(/^\n/, '');
            lastCharWasReturn = false;
        }

        if (lineBuffer) {
            processedString = lineBuffer + processedString;
            lineBuffer = '';
        }

        if (lineBreakPattern.test(processedString)) {
            lastCharWasReturn = /\r$/.test(processedString);

            const segments = processedString.split(lineBreakPattern);
            lineBuffer = segments.pop();
            segments.forEach(segment => processCompletedLine(segment));
        } else if (processedString) {
            lineBuffer = processedString;
        }
    }

    function modifyLineContent(characterSequence) {
        if (currentCursorPosition < currentInputLine.length) {
            const prefix = currentInputLine.slice(0, currentCursorPosition);
            const suffix = currentInputLine.slice(currentCursorPosition);
            currentInputLine = prefix + characterSequence + suffix;
            currentCursorPosition += characterSequence.length;
            redrawCurrentLine();
        } else {
            currentInputLine += characterSequence;
            currentCursorPosition += characterSequence.length;

            if (acquireGlyphPosition().cols === 0) {
                redrawCurrentLine();
            } else {
                activeOutputSink.write(characterSequence);
            }
            repositionGlyph(0);
        }
    }

    function initiateCompletion() {
        moduleControl.suspend();

        adjustedCompleter(currentInputLine.slice(0, currentCursorPosition), (error, completionResult) => {
            moduleControl.resume();

            if (error) {
                return;
            }

            const candidates = completionResult[0];
            const baseText = completionResult[1];

            if (candidates && candidates.length) {
                if (candidates.length === 1) {
                    modifyLineContent(candidates[0].slice(baseText.length));
                } else {
                    activeOutputSink.write('\r\n');
                    displayCompletionOptions(candidates);
                }

                const validCandidates = candidates.filter(c => c);
                const sharedPrefix = deriveCommonPrefix(validCandidates);
                if (sharedPrefix.length > baseText.length) {
                    modifyLineContent(sharedPrefix.slice(baseText.length));
                }
            }
            redrawCurrentLine();
        });
    }

    function displayCompletionOptions(options) {
        const availableColumns = retrieveColumnCapacity();
        const maxOptionLength = options.reduce((max, opt) => Math.max(max, opt ? opt.length : 0), 0) + 2;
        const maxColumnsPerLine = Math.floor(availableColumns / maxOptionLength) || 1;

        let currentGroup = [];
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            if (option === '') {
                renderOptionGroup(currentGroup, maxOptionLength, maxColumnsPerLine);
                currentGroup = [];
            } else {
                currentGroup.push(option);
            }
        }
        renderOptionGroup(currentGroup, maxOptionLength, maxColumnsPerLine);
    }

    function renderOptionGroup(groupItems, displayWidth, lineCapacity) {
        if (groupItems.length === 0) return;

        const minimumRows = Math.ceil(groupItems.length / lineCapacity);
        for (let r = 0; r < minimumRows; r++) {
            for (let c = 0; c < lineCapacity; c++) {
                const itemIndex = r * lineCapacity + c;
                if (itemIndex >= groupItems.length) break;

                const item = groupItems[itemIndex];
                activeOutputSink.write(item);

                if (c < lineCapacity - 1) {
                    for (let s = 0; s < displayWidth - item.length; s++) {
                        activeOutputSink.write(' ');
                    }
                }
            }
            activeOutputSink.write('\r\n');
        }
        activeOutputSink.write('\r\n');
    }

    function deriveCommonPrefix(wordList) {
        if (!wordList || wordList.length === 0) return '';
        if (wordList.length === 1) return wordList[0];

        const sortedWords = [...wordList].sort();
        const shortest = sortedWords[0];
        const longest = sortedWords[sortedWords.length - 1];

        let prefixLength = 0;
        while (prefixLength < shortest.length && shortest[prefixLength] === longest[prefixLength]) {
            prefixLength++;
        }
        return shortest.slice(0, prefixLength);
    }

    function moveWordLeft() {
        if (currentCursorPosition > 0) {
            const leadingSegment = currentInputLine.slice(0, currentCursorPosition);
            const match = leadingSegment.match(/([^\w\s]+|\w+|)\s*$/);
            repositionGlyph(-match[0].length);
        }
    }

    function moveWordRight() {
        if (currentCursorPosition < currentInputLine.length) {
            const trailingSegment = currentInputLine.slice(currentCursorPosition);
            const match = trailingSegment.match(/^(\s+|\W+|\w+)\s*/);
            repositionGlyph(match[0].length);
        }
    }

    function deleteCharBeforeCursor() {
        if (currentCursorPosition > 0 && currentInputLine.length > 0) {
            currentInputLine = currentInputLine.slice(0, currentCursorPosition - 1) +
                               currentInputLine.slice(currentCursorPosition);
            currentCursorPosition--;
            redrawCurrentLine();
        }
    }

    function deleteCharAtCursor() {
        currentInputLine = currentInputLine.slice(0, currentCursorPosition) +
                           currentInputLine.slice(currentCursorPosition + 1);
        redrawCurrentLine();
    }

    function deleteWordBeforeCursor() {
        if (currentCursorPosition > 0) {
            let leadingSegment = currentInputLine.slice(0, currentCursorPosition);
            const match = leadingSegment.match(/([^\w\s]+|\w+|)\s*$/);
            leadingSegment = leadingSegment.slice(0, leadingSegment.length - match[0].length);
            currentInputLine = leadingSegment + currentInputLine.slice(currentCursorPosition);
            currentCursorPosition = leadingSegment.length;
            redrawCurrentLine();
        }
    }

    function deleteWordAfterCursor() {
        if (currentCursorPosition < currentInputLine.length) {
            const trailingSegment = currentInputLine.slice(currentCursorPosition);
            const match = trailingSegment.match(/^(\s+|\W+|\w+)\s*/);
            currentInputLine = currentInputLine.slice(0, currentCursorPosition) +
                               trailingSegment.slice(match[0].length);
            redrawCurrentLine();
        }
    }

    function handleKeySignal(sequence, keyDescriptor) {
        if (isProcessorClosed) return;

        const actionKey = `${keyDescriptor.ctrl ? 'Ctrl+' : ''}${keyDescriptor.meta ? 'Meta+' : ''}${keyDescriptor.shift ? 'Shift+' : ''}${keyDescriptor.name || sequence}`;
        const action = keyActionMap.get(actionKey);

        if (action) {
            action(sequence, keyDescriptor);
            return;
        }

        if (sequence && !keyDescriptor.ctrl && !keyDescriptor.meta) {
            modifyLineContent(sequence);
        }
    }

    function setupKeyActions() {
        keyActionMap.set('backspace', deleteCharBeforeCursor);
        keyActionMap.set('delete', deleteCharAtCursor);
        keyActionMap.set('tab', initiateCompletion);
        keyActionMap.set('return', () => {
            activeOutputSink.write('\r\n');
            storeLineInArchive();
            processCompletedLine(currentInputLine);
            currentInputLine = '';
            currentCursorPosition = 0;
            redrawCurrentLine();
            moduleControl.requestPrompt();
        });
        keyActionMap.set('up', () => {
            if (lineArchive.length === 0) return;
            if (archiveTraversalIndex === -1) {
                if (currentInputLine.length > 0) {
                    lineArchive.unshift(currentInputLine);
                }
                archiveTraversalIndex = 0;
            } else {
                archiveTraversalIndex++;
            }
            archiveTraversalIndex = Math.min(archiveTraversalIndex, lineArchive.length - 1);
            currentInputLine = lineArchive[archiveTraversalIndex] || '';
            currentCursorPosition = currentInputLine.length;
            redrawCurrentLine();
        });
        keyActionMap.set('down', () => {
            if (lineArchive.length === 0) return;
            archiveTraversalIndex--;
            if (archiveTraversalIndex < 0) {
                archiveTraversalIndex = -1;
                currentInputLine = '';
            } else {
                currentInputLine = lineArchive[archiveTraversalIndex] || '';
            }
            currentCursorPosition = currentInputLine.length;
            redrawCurrentLine();
        });
        keyActionMap.set('left', () => repositionGlyph(-1));
        keyActionMap.set('right', () => repositionGlyph(1));
        keyActionMap.set('home', () => repositionGlyph(-currentCursorPosition));
        keyActionMap.set('end', () => repositionGlyph(currentInputLine.length - currentCursorPosition));
        keyActionMap.set('Ctrl+left', moveWordLeft);
        keyActionMap.set('Ctrl+right', moveWordRight);
        keyActionMap.set('Ctrl+backspace', deleteWordBeforeCursor);
        keyActionMap.set('Ctrl+delete', deleteWordAfterCursor);
        keyActionMap.set('Ctrl+u', () => {
            currentInputLine = currentInputLine.slice(currentCursorPosition);
            currentCursorPosition = 0;
            redrawCurrentLine();
        });
        keyActionMap.set('Ctrl+k', () => {
            currentInputLine = currentInputLine.slice(0, currentCursorPosition);
            redrawCurrentLine();
        });
        keyActionMap.set('Ctrl+a', () => repositionGlyph(-currentCursorPosition));
        keyActionMap.set('Ctrl+e', () => repositionGlyph(currentInputLine.length - currentCursorPosition));
        keyActionMap.set('Ctrl+c', () => {
            comms.dispatch('interruptSignal');
            currentInputLine = '';
            currentCursorPosition = 0;
            activeOutputSink.write('^C\r\n');
            moduleControl.requestPrompt(true);
        });
        keyActionMap.set('Ctrl+d', () => {
            if (currentInputLine.length === 0) {
                moduleControl.terminate();
            } else {
                deleteCharAtCursor();
            }
        });
    }

    const inputDataHandler = (data) => ingestStreamData(data);
    const inputEndHandler = () => moduleControl.terminate();
    const inputKeypressHandler = (s, key) => handleKeySignal(s, key);
    const outputResizeHandler = () => redrawCurrentLine();

    const moduleControl = {
        configurePrompt(newPrompt, lengthHint) {
            updatePromptDisplayInfo(newPrompt, lengthHint);
        },

        requestPrompt(maintainCursorPosition) {
            if (isInputPaused) this.resume();
            if (effectiveTerminalStatus) {
                if (!maintainCursorPosition) currentCursorPosition = 0;
                redrawCurrentLine();
            } else {
                activeOutputSink.write(currentPromptText);
            }
        },

        poseQuestion(query, responseCallback) {
            if (typeof responseCallback === 'function') {
                if (awaitedResponse) {
                    this.requestPrompt();
                } else {
                    previousPromptText = currentPromptText;
                    this.configurePrompt(query);
                    awaitedResponse = responseCallback;
                    this.requestPrompt();
                }
            }
        },

        terminate() {
            if (isProcessorClosed) return;
            if (effectiveTerminalStatus) {
                adjustRawMode(false);
            }
            this.suspend();
            isProcessorClosed = true;
            comms.dispatch('termination');
        },

        suspend() {
            if (isInputPaused) return;
            activeInputSource.pause();
            isInputPaused = true;
            comms.dispatch('suspension');
        },

        resume() {
            if (!isInputPaused) return;
            activeInputSource.resume();
            isInputPaused = false;
            comms.dispatch('resumption');
        },

        injectInput(dataContent, keyInfo) {
            if (isInputPaused) this.resume();
            effectiveTerminalStatus ? handleKeySignal(dataContent, keyInfo) : ingestStreamData(dataContent);
        },

        on(eventName, handler) {
            const eventMapping = {
                'line': 'processedLine',
                'close': 'termination',
                'pause': 'suspension',
                'resume': 'resumption',
                'SIGINT': 'interruptSignal'
            };
            comms.register(eventMapping[eventName] || eventName, handler);
        },
        off(eventName, handler) {
            const eventMapping = {
                'line': 'processedLine',
                'close': 'termination',
                'pause': 'suspension',
                'resume': 'resumption',
                'SIGINT': 'interruptSignal'
            };
            comms.deregister(eventMapping[eventName] || eventName, handler);
        },

        get displayWidth() {
            return retrieveColumnCapacity();
        }
    };

    if (!effectiveTerminalStatus) {
        textDecoder = createTextConverter('utf8');
        activeInputSource.on('data', inputDataHandler);
        activeInputSource.on('end', inputEndHandler);
        comms.register('termination', () => {
            activeInputSource.removeListener('data', inputDataHandler);
            activeInputSource.removeListener('end', inputEndHandler);
        });
    } else {
        setupKeyActions();
        terminalManipulator.activateKeySignal(activeInputSource);
        activeInputSource.on('keypress', inputKeypressHandler);
        activeOutputSink.on('resize', outputResizeHandler);
        adjustRawMode(true);

        comms.register('termination', () => {
            activeInputSource.removeListener('keypress', inputKeypressHandler);
            activeOutputSink.removeListener('resize', outputResizeHandler);
            adjustRawMode(false);
        });
    }

    activeInputSource.resume();

    return moduleControl;
}

function spawnSessionHandler(param1, param2, param3, param4) {
    let sessionObject;
    if (arguments.length === 1 && typeof param1 === 'object' && param1 !== null) {
        sessionObject = generateInputProcessor(param1.input, param1.output, param1.completer, param1.terminal);
    } else {
        sessionObject = generateInputProcessor(param1, param2, param3, param4);
    }
    return sessionObject;
}