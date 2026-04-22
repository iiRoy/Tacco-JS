var CodeFlow = CodeFlow || {};

document.addEventListener('DOMContentLoaded', () => {
    let isMouseOutDelayed = true;
    const loginTriggerElement = document.getElementById('signin');
    const loginDropdownElement = document.getElementById('signin_list');
    let hideDropdownTimerIdentifier;

    if (loginTriggerElement && loginDropdownElement) {
        loginTriggerElement.addEventListener('mouseenter', () => {
            loginDropdownElement.style.display = 'block';
            isMouseOutDelayed = false;
            clearTimeout(hideDropdownTimerIdentifier);
        });

        loginTriggerElement.addEventListener('mouseleave', () => {
            isMouseOutDelayed = true;
            hideDropdownTimerIdentifier = setTimeout(() => {
                if (isMouseOutDelayed) {
                    loginDropdownElement.style.display = 'none';
                }
            }, 100);
        });
    }

    const navigationContainer = document.querySelector('body');
    if (navigationContainer) {
        navigationContainer.addEventListener('click', (interactionEvent) => {
            const clickedTarget = interactionEvent.target;
            if (clickedTarget && clickedTarget.classList.contains('menu_item')) {
                const selectedMenuText = clickedTarget.textContent;
                
                const currentlySelectedDiv = document.querySelector('div.selected');
                if (currentlySelectedDiv) {
                    currentlySelectedDiv.classList.remove('selected');
                }

                document.querySelectorAll('div.menu_window').forEach(windowComponent => {
                    windowComponent.style.display = 'none';
                });

                const targetWindowComponent = document.getElementById(selectedMenuText);
                if (targetWindowComponent) {
                    targetWindowComponent.style.display = 'block';
                }

                clickedTarget.classList.add('selected');

                if (selectedMenuText === 'chat') {
                    const messageInputField = document.getElementById('message');
                    if (messageInputField) {
                        messageInputField.focus();
                    }
                }
            }
        });
    }

    const currentLanguage = navigator.language || navigator.userLanguage || navigator.browserLanguage;
    if (/ja/.test(currentLanguage)) {
        const socialButtonWrapper = document.getElementById('socialbuttons');
        if (socialButtonWrapper) {
            const containerDiv = document.createElement('div');
            containerDiv.style.margin = '7px 7px 0 0';

            const bookmarkAnchor = document.createElement('a');
            bookmarkAnchor.href = 'http://b.hatena.ne.jp/entry/http://livecoder.sugyan.com/';
            bookmarkAnchor.className = 'hatena-bookmark-button';
            bookmarkAnchor.setAttribute('data-hatena-bookmark-title', 'Livecoder');
            bookmarkAnchor.setAttribute('data-hatena-bookmark-layout', 'standard');
            bookmarkAnchor.title = 'このエントリーをはてなブックマークに追加';

            const bookmarkIcon = document.createElement('img');
            bookmarkIcon.src = 'http://b.st-hatena.com/images/entry-button/button-only.gif';
            bookmarkIcon.alt = 'このエントリーをはてなブックマークに追加';
            bookmarkIcon.width = '20';
            bookmarkIcon.height = '20';
            bookmarkIcon.style.border = 'none';

            bookmarkAnchor.appendChild(bookmarkIcon);
            containerDiv.appendChild(bookmarkAnchor);

            const scriptLoader = document.createElement('script');
            scriptLoader.type = 'text/javascript';
            scriptLoader.src = 'http://b.st-hatena.com/js/bookmark_button.js';
            scriptLoader.charset = 'utf-8';
            scriptLoader.async = true;

            containerDiv.appendChild(scriptLoader);
            socialButtonWrapper.prepend(containerDiv);
        }
    }
});

CodeFlow.Toolbox = class {};

CodeFlow.Connector = class {
    constructor(connectionObjectReference) {
        this.connectionObjectReference = connectionObjectReference;
        this.registeredFunctionalities = new Map();
        this.prepareFunctionalities();
    }

    prepareFunctionalities() {
        this.registeredFunctionalities.set('messaging', this.processMessages.bind(this));
        this.registeredFunctionalities.set('statusUpdate', this.monitorStatus.bind(this));
    }

    activateFunctionalities(functionKeys) {
        functionKeys.forEach(key => {
            const func = this.registeredFunctionalities.get(key);
            if (func) {
                func();
            }
        });
    }

    processMessages() {
        this.connectionObjectReference.on('message', (incomingTransmission) => {
            const messageFeedContainer = document.getElementById('message_list');

            if (incomingTransmission.chat) {
                const chatPayload = incomingTransmission.chat;
                const chatEntryHeader = document.createElement('dt');
                const userDisplayName = document.createElement('span');
                userDisplayName.classList.add('name');
                userDisplayName.textContent = chatPayload.user;

                const messageTimestamp = document.createElement('span');
                messageTimestamp.classList.add('time');
                messageTimestamp.textContent = new Date(chatPayload.date).toLocaleTimeString();

                chatEntryHeader.appendChild(userDisplayName);
                chatEntryHeader.appendChild(messageTimestamp);

                const chatEntryContent = document.createElement('dd');
                chatEntryContent.textContent = chatPayload.message;

                if (messageFeedContainer.firstChild) {
                    messageFeedContainer.insertBefore(chatEntryContent, messageFeedContainer.firstChild);
                    messageFeedContainer.insertBefore(chatEntryHeader, messageFeedContainer.firstChild);
                } else {
                    messageFeedContainer.appendChild(chatEntryHeader);
                    messageFeedContainer.appendChild(chatEntryContent);
                }
            }

            if (incomingTransmission.info) {
                const infoPayload = incomingTransmission.info;
                const infoEntryHeader = document.createElement('dt');
                infoEntryHeader.classList.add('info');

                const infoUserDisplay = document.createElement('span');
                infoUserDisplay.classList.add('name');
                infoUserDisplay.textContent = infoPayload.user;

                const infoTimestamp = document.createElement('span');
                infoTimestamp.classList.add('time');
                infoTimestamp.textContent = new Date(infoPayload.date).toLocaleTimeString();

                infoEntryHeader.appendChild(infoUserDisplay);
                infoEntryHeader.appendChild(infoTimestamp);

                const infoEntryContent = document.createElement('dd');
                infoEntryContent.classList.add('info');
                infoEntryContent.textContent = infoPayload.action + '.';

                if (messageFeedContainer.firstChild) {
                    messageFeedContainer.insertBefore(infoEntryContent, messageFeedContainer.firstChild);
                    messageFeedContainer.insertBefore(infoEntryHeader, messageFeedContainer.firstChild);
                } else {
                    messageFeedContainer.appendChild(infoEntryHeader);
                    messageFeedContainer.appendChild(infoEntryContent);
                }
            }
        });
    }

    monitorStatus() {
        this.connectionObjectReference.on('message', (incomingTransmission) => {
            if (!incomingTransmission.stat) { return; }

            const audienceData = Object.values(incomingTransmission.stat.viewers);
            const sortedAudience = audienceData.sort((a, b) => a.start - b.start);

            const audienceListElement = document.getElementById('viewers_list');
            
            while (audienceListElement.firstChild) {
                audienceListElement.removeChild(audienceListElement.firstChild);
            }

            sortedAudience.forEach(member => {
                const memberListItem = document.createElement('li');
                memberListItem.textContent = member.name;
                audienceListElement.appendChild(memberListItem);
            });

            const audienceCountDisplay = document.getElementById('viewers_count');
            while (audienceCountDisplay.firstChild) {
                audienceCountDisplay.removeChild(audienceCountDisplay.firstChild);
            }
            const countValueSpan = document.createElement('span');
            countValueSpan.classList.add('count');
            countValueSpan.textContent = sortedAudience.length;
            audienceCountDisplay.appendChild(countValueSpan);
            audienceCountDisplay.appendChild(document.createTextNode(' audience members'));

            const activityLineDiv = document.querySelector('.status_line');
            if (activityLineDiv) {
                while (activityLineDiv.firstChild) {
                    activityLineDiv.removeChild(activityLineDiv.firstChild);
                }

                const activityStatusSpan = document.createElement('span');
                if (incomingTransmission.stat.editing) {
                    activityStatusSpan.style.color = '#FFB0B0';
                    activityStatusSpan.style.fontWeight = 'bold';
                    activityStatusSpan.textContent = 'livecoding in progress!';
                    activityLineDiv.appendChild(activityStatusSpan);

                    const durationSpan = document.createElement('span');
                    durationSpan.classList.add('time');
                    durationSpan.dataset.date = incomingTransmission.stat.editing.start;
                    activityLineDiv.appendChild(durationSpan);
                } else {
                    activityStatusSpan.style.color = '#C0C0C0';
                    activityStatusSpan.style.fontWeight = 'normal';
                    activityStatusSpan.textContent = 'no livecoding active...';
                    activityLineDiv.appendChild(activityStatusSpan);
                }
            }
        });

        const updateActivityDurations = () => {
            document.querySelectorAll('.status_line .time').forEach(timeElement => {
                const startTimeMs = parseInt(timeElement.dataset.date, 10);
                if (!isNaN(startTimeMs)) {
                    const elapsedSeconds = Math.floor((new Date().getTime() - startTimeMs) / 1000);
                    const minutes = Math.floor(elapsedSeconds / 60);
                    const seconds = elapsedSeconds % 60;
                    timeElement.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                }
            });
            setTimeout(updateActivityDurations, 1000);
        };
        updateActivityDurations();
    }
};

CodeFlow.CodePilot = class {
    constructor(codeEditorInstance) {
        this.codeEditorInstance = codeEditorInstance;
        this.pilotCapabilities = new Map();
        this.initializePilotCapabilities();
    }

    initializePilotCapabilities() {
        this.pilotCapabilities.set('navigation', this.configureMenuNavigation.bind(this));
    }

    activatePilotCapabilities(capabilityKeys) {
        capabilityKeys.forEach(key => {
            const capability = this.pilotCapabilities.get(key);
            if (capability) {
                capability();
            }
        });
    }

    configureMenuNavigation() {
        const selfReference = this;
        const navElements = Array.from(document.querySelectorAll('.menu_item')).reverse();
        let currentNavIndex = navElements.length - 2;

        const advanceSelectionBackward = () => {
            currentNavIndex--;
            refreshActiveSelection();
        };
        const advanceSelectionForward = () => {
            currentNavIndex++;
            refreshActiveSelection();
        };

        const refreshActiveSelection = () => {
            currentNavIndex = (currentNavIndex + navElements.length) % navElements.length;
            
            navElements[currentNavIndex].click();

            if (currentNavIndex !== navElements.length - 2 && (!selfReference.codeEditorInstance.readonly)) {
                setTimeout(() => {
                    selfReference.codeEditorInstance.focus();
                }, 0);
            }
        };

        this.codeEditorInstance.setAction('menuPrevious', advanceSelectionBackward);
        this.codeEditorInstance.setAction('menuNext', advanceSelectionForward);

        this.codeEditorInstance.setKeyBinding(
            new orion.textview.KeyBinding(219, navigator.platform.indexOf("Mac") === -1, false, false, true),
            'menuPrevious'
        );
        this.codeEditorInstance.setKeyBinding(
            new orion.textview.KeyBinding(221, navigator.platform.indexOf("Mac") === -1, false, false, true),
            'menuNext'
        );

        document.addEventListener('keydown', (keyboardEvent) => {
            if (keyboardEvent.ctrlKey) {
                const keyActionMap = {
                    219: advanceSelectionBackward,
                    221: advanceSelectionForward
                };
                const boundAction = keyActionMap[keyboardEvent.keyCode];
                if (boundAction) {
                    boundAction();
                }
            }
        });
    }
};

CodeFlow.Visualizer = class {
    static TOKEN_TYPE_UNKNOWN = 1;
    static TOKEN_TYPE_KEYWORD = 2;
    static TOKEN_TYPE_STRING_LITERAL = 3;
    static TOKEN_TYPE_COMMENT_BLOCK = 4;
    static TOKEN_TYPE_WHITESPACE = 5;

    static commentBlockStyle = { styleClass: "token_comment" };
    static stringLiteralStyle = { styleClass: "token_string" };
    static reservedWordStyle = { styleClass: "token_keyword" };
    static activeLineStyle = { styleClass: "line_caret" };

    constructor(textDisplayView) {
        this.textDisplayView = textDisplayView;
        this.commentSearchOffset = 0;
        this.commentBoundaryMarkers = [];
        this.shouldHighlightCurrentLine = true;

        const recognizedKeywords = [];
        this.sourceCodeLexer = new CodeFlow.Visualizer.TokenProcessor(recognizedKeywords);

        textDisplayView.addEventListener("Selection", this, this.onSelectionChange);
        textDisplayView.addEventListener("ModelChanged", this, this.onModelContentChange);
        textDisplayView.addEventListener("LineStyle", this, this.onLineStylingRequest);
        textDisplayView.redrawLines();
    }

    onSelectionChange(eventData) {
        const previousSelectionState = eventData.oldValue;
        const currentSelectionState = eventData.newValue;
        const textModelAccessor = this.textDisplayView.getModel();
        
        if (this.shouldHighlightCurrentLine) {
            const previousLineIdx = textModelAccessor.getLineAtOffset(previousSelectionState.start);
            const currentLineIdx = textModelAccessor.getLineAtOffset(currentSelectionState.start);
            const isCurrentSelectionEmpty = currentSelectionState.start === currentSelectionState.end;
            const isPreviousSelectionEmpty = previousSelectionState.start === previousSelectionState.end;

            if (!(previousLineIdx === currentLineIdx && isPreviousSelectionEmpty && isCurrentSelectionEmpty)) {
                if (isPreviousSelectionEmpty) {
                    this.textDisplayView.redrawLines(previousLineIdx, previousLineIdx + 1);
                }
                if ((previousLineIdx !== currentLineIdx || !isPreviousSelectionEmpty) && isCurrentSelectionEmpty) {
                    this.textDisplayView.redrawLines(currentLineIdx, currentLineIdx + 1);
                }
            }
        }
    }

    onModelContentChange(eventData) {
        const changeStartOffset = eventData.start;
        const removedCharacterCount = eventData.removedCharCount;
        const addedCharacterCount = eventData.addedCharCount;

        if (this._matchingBracket && changeStartOffset < this._matchingBracket) { this._matchingBracket += addedCharacterCount + removedCharacterCount; }
        if (this._currentBracket && changeStartOffset < this._currentBracket) { this._currentBracket += addedCharacterCount + removedCharacterCount; }
        
        if (changeStartOffset >= this.commentSearchOffset) { return; }
        
        const textModelAccessor = this.textDisplayView.getModel();

        if (! (this.commentBlockStartDelimiter && this.commentBlockEndDelimiter)) {
            return;
        }

        const currentCommentMarkerCount = this.commentBoundaryMarkers.length;
        const delimiterExtraLength = Math.max(this.commentBlockStartDelimiter.length - 1, this.commentBlockEndDelimiter.length - 1);
        
        if (currentCommentMarkerCount === 0) {
            this.commentSearchOffset = Math.max(0, changeStartOffset - delimiterExtraLength);
            return;
        }
        
        const totalCharacterCount = textModelAccessor.getCharCount();
        const oldTotalCharacterCount = totalCharacterCount - addedCharacterCount + removedCharacterCount;
        
        let startBoundaryIndex = this._performBinarySearch(this.commentBoundaryMarkers, changeStartOffset, -1, currentCommentMarkerCount); 
        const changeEndOffset = changeStartOffset + removedCharacterCount;
        let endBoundaryIndex = this._performBinarySearch(this.commentBoundaryMarkers, changeEndOffset, startBoundaryIndex - 1, currentCommentMarkerCount);
        
        let scanRegionStart;
        if (startBoundaryIndex > 0) {
            scanRegionStart = this.commentBoundaryMarkers[--startBoundaryIndex];
        } else {
            scanRegionStart = Math.max(0, Math.min(this.commentBoundaryMarkers[startBoundaryIndex], changeStartOffset) - delimiterExtraLength);
            --startBoundaryIndex;
        }
        
        let scanRegionEnd;
        let redrawAreaEnd = totalCharacterCount;
        if (endBoundaryIndex + 1 < this.commentBoundaryMarkers.length) {
            scanRegionEnd = this.commentBoundaryMarkers[++endBoundaryIndex];
            if (changeEndOffset > (scanRegionEnd - this.commentBlockEndDelimiter.length)) {
                if (endBoundaryIndex + 2 < this.commentBoundaryMarkers.length) { 
                    endBoundaryIndex += 2;
                    scanRegionEnd = this.commentBoundaryMarkers[endBoundaryIndex];
                    redrawAreaEnd = scanRegionEnd + 1;
                    if (redrawAreaEnd > changeStartOffset) { redrawAreaEnd += addedCharacterCount - removedCharacterCount; }
                } else {
                    scanRegionEnd = Math.min(oldTotalCharacterCount, changeEndOffset + delimiterExtraLength);
                    this.commentSearchOffset = scanRegionEnd;
                }
            }
        } else {
            scanRegionEnd = Math.min(oldTotalCharacterCount, changeEndOffset + delimiterExtraLength);
            this.commentSearchOffset = scanRegionEnd;
            if (endBoundaryIndex > 0 && endBoundaryIndex === this.commentBoundaryMarkers.length) {
                endBoundaryIndex = this.commentBoundaryMarkers.length - 1;
            }
        }
        
        if (scanRegionStart > changeStartOffset) { scanRegionStart += addedCharacterCount - removedCharacterCount; }
        if (scanRegionEnd > changeStartOffset) { scanRegionEnd += addedCharacterCount - removedCharacterCount; }
        
        if (this.commentBoundaryMarkers.length > 1 && this.commentBoundaryMarkers[this.commentBoundaryMarkers.length - 1] === oldTotalCharacterCount) {
            this.commentBoundaryMarkers.length--;
        }
        
        let currentScanPosition = 0;
        const newlyFoundBoundaryPoints = [];
        const contentToScan = textModelAccessor.getText(scanRegionStart, scanRegionEnd);
        
        if (this.commentSearchOffset < scanRegionEnd) { this.commentSearchOffset = scanRegionEnd; }
        
        while (currentScanPosition < contentToScan.length) {
            const isStartingBoundary = ((startBoundaryIndex + 1 + newlyFoundBoundaryPoints.length) % 2) === 0;
            const delimiterToSearch = isStartingBoundary ? this.commentBlockStartDelimiter : this.commentBlockEndDelimiter;
            const foundDelimiterIndex = contentToScan.indexOf(delimiterToSearch, currentScanPosition);
            
            if (foundDelimiterIndex !== -1) {
                newlyFoundBoundaryPoints.push(scanRegionStart + (isStartingBoundary ? foundDelimiterIndex : foundDelimiterIndex + delimiterToSearch.length));
            } else {
                break;
            }
            currentScanPosition = foundDelimiterIndex + delimiterToSearch.length;
        }
        
        let requiresRedraw = (endBoundaryIndex - startBoundaryIndex) !== newlyFoundBoundaryPoints.length;
        if (!requiresRedraw) {
            for (let pointIdx = 0; pointIdx < newlyFoundBoundaryPoints.length; pointIdx++) {
                let existingPointOffset = this.commentBoundaryMarkers[startBoundaryIndex + 1 + pointIdx];
                if (existingPointOffset > changeStartOffset) { existingPointOffset += addedCharacterCount - removedCharacterCount; }
                if (existingPointOffset !== newlyFoundBoundaryPoints[pointIdx]) {
                    requiresRedraw = true;
                    break;
                } 
            }
        }
        
        const spliceArgs = [startBoundaryIndex + 1, (endBoundaryIndex - startBoundaryIndex)].concat(newlyFoundBoundaryPoints);
        Array.prototype.splice.apply(this.commentBoundaryMarkers, spliceArgs);
        
        for (let pointIdx = startBoundaryIndex + 1 + newlyFoundBoundaryPoints.length; pointIdx < this.commentBoundaryMarkers.length; pointIdx++) {
            this.commentBoundaryMarkers[pointIdx] += addedCharacterCount - removedCharacterCount;
        }
        
        if ((this.commentBoundaryMarkers.length % 2) === 1) { this.commentBoundaryMarkers.push(totalCharacterCount); }
        
        if (requiresRedraw) {
            this.textDisplayView.redrawRange(changeStartOffset + addedCharacterCount, redrawAreaEnd);
        }
    }

    _performBinarySearch(dataArray, targetValue, lowerBound, upperBound) {
        let middleIndex;
        while (lowerBound <= upperBound) {
            middleIndex = (lowerBound + upperBound) >> 1;
            const arrayElement = dataArray[middleIndex];
            if (arrayElement === targetValue) { return middleIndex; }
            if (arrayElement < targetValue) {
                lowerBound = middleIndex + 1;
            } else {
                upperBound = middleIndex - 1;
            }
        }
        return lowerBound;
    }

    onLineStylingRequest(eventData) {
        // This method's implementation is not provided in the original snippet,
        // so it remains a placeholder here. It would typically process eventData.lineText.
    }

    static TokenProcessor = class {
        constructor(recognizedKeywords, commentDelimitersConfig) {
            this.recognizedKeywords = recognizedKeywords;
            this.commentDelimiters = new Map();
            if (commentDelimitersConfig) {
                commentDelimitersConfig.forEach(delimiter => this.commentDelimiters.set(delimiter, true));
            }
            this.setSourceDocument("");
        }
        
        getCurrentReadPosition() {
            return this.readPosition;
        }
        getStartTokenPosition() {
            return this.tokenStartReadPosition;
        }
        getExtractedLexeme() {
            return this.sourceDocument.substring(this.tokenStartReadPosition, this.readPosition);
        }
        getLexemeLength() {
            return this.readPosition - this.tokenStartReadPosition;
        }
        
        _readNextChar() {
            if (this.readPosition < this.sourceDocument.length) {
                return this.sourceDocument.charCodeAt(this.readPosition++);
            }
            return -1;
        }
        _unreadLineChar(characterCode) {
            if (characterCode !== -1) { this.readPosition--; }
        }
        
        retrieveNextToken() {
            this.tokenStartReadPosition = this.readPosition;
            while (true) {
                let charCode = this._readNextChar();
                switch (charCode) {
                    case -1: return null;
                    case 47: // SLASH (/)
                        if (this.commentDelimiters.has("//")) {
                            charCode = this._readNextChar();
                            if (charCode === 47) {
                                while (true) {
                                    charCode = this._readNextChar();
                                    if ((charCode === -1) || (charCode === 10)) {
                                        this._unreadLineChar(charCode);
                                        return CodeFlow.Visualizer.TOKEN_TYPE_COMMENT_BLOCK;
                                    }
                                }
                            }
                            this._unreadLineChar(charCode);
                            return CodeFlow.Visualizer.TOKEN_TYPE_UNKNOWN;
                        }
                        break;
                    case 35: // HASH (#)
                        if (this.commentDelimiters.has("#")) {
                            while (true) {
                                charCode = this._readNextChar();
                                if ((charCode === -1) || (charCode === 10)) {
                                    this._unreadLineChar(charCode);
                                    return CodeFlow.Visualizer.TOKEN_TYPE_COMMENT_BLOCK;
                                }
                            }
                        }
                        break;
                    case 39: // SINGLE QUOTE (')
                        while(true) {
                            charCode = this._readNextChar();
                            switch (charCode) {
                                case 39: return CodeFlow.Visualizer.TOKEN_TYPE_STRING_LITERAL;
                                case -1: this._unreadLineChar(charCode); return CodeFlow.Visualizer.TOKEN_TYPE_STRING_LITERAL;
                                case 92: // BACKSLASH (\)
                                    this._readNextChar();
                                    break;
                            }
                        }
                    case 34: // DOUBLE QUOTE (")
                        while(true) {
                            charCode = this._readNextChar();
                            switch (charCode) {
                                case 34: return CodeFlow.Visualizer.TOKEN_TYPE_STRING_LITERAL;
                                case -1: this._unreadLineChar(charCode); return CodeFlow.Visualizer.TOKEN_TYPE_STRING_LITERAL;
                                case 92: // BACKSLASH (\)
                                    this._readNextChar();
                                    break;
                            }
                        }
                    case 32: // SPACE
                    case 9: // TAB
                        do {
                            charCode = this._readNextChar();
                        } while(charCode === 32 || charCode === 9);
                        this._unreadLineChar(charCode);
                        return CodeFlow.Visualizer.TOKEN_TYPE_WHITESPACE;
                    default:
                        const isAlpha = (c) => (c >= 97 && c <= 122) || (c >= 65 && c <= 90);
                        const isNumeric = (c) => (c >= 48 && c <= 57);
                        const isUnderscore = (c) => c === 95;
                        const isHyphenChar = (c) => c === 0x2d;

                        if (isAlpha(charCode) || isUnderscore(charCode) || isNumeric(charCode) || (isHyphenChar(charCode) && this.isCSS)) {
                            const wordStartPos = this.readPosition - 1;
                            do {
                                charCode = this._readNextChar();
                            } while(isAlpha(charCode) || isUnderscore(charCode) || isNumeric(charCode) || (isHyphenChar(charCode) && this.isCSS));
                            this._unreadLineChar(charCode);
                            const currentIdentifer = this.sourceDocument.substring(wordStartPos, this.readPosition);
                            
                            if (this.recognizedKeywords.includes(currentIdentifer)) {
                                return CodeFlow.Visualizer.TOKEN_TYPE_KEYWORD;
                            }
                        }
                        return CodeFlow.Visualizer.TOKEN_TYPE_UNKNOWN;
                }
            }
        }
        
        setSourceDocument(newDocumentText) {
            this.sourceDocument = newDocumentText;
            this.readPosition = 0;
            this.tokenStartReadPosition = 0;
        }
    };
};