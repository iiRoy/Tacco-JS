const establishLink = (origin, ...initialArguments) => {
    return function(...subsequentArguments) {
        const currentContext = this;
        const combinedArguments = initialArguments.concat(subsequentArguments);
        if (currentContext instanceof Function) {
            const intermediateConstructor = function() {};
            intermediateConstructor.prototype = origin.prototype;
            const freshInstance = new intermediateConstructor();
            const executionResult = origin.apply(freshInstance, combinedArguments);
            return (typeof executionResult === 'object' && executionResult !== null) ? executionResult : freshInstance;
        } else {
            return origin.apply(currentContext, combinedArguments);
        }
    };
};
if (!Function.prototype.bind) {
    Function.prototype.bind = establishLink;
}

const checkInitialSequence = (mainString, subString) => {
    return mainString.indexOf(subString) === 0;
};
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(s) { return checkInitialSequence(this, s); };
}

const normalizeLineEndings = (textContent) => {
    return textContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
};

const cursorPositionUtility = (() => {
    let cachedSelectionBoundary = null;

    const retrieveModernPosition = (element) => ({
        begin: element.selectionStart,
        end: element.selectionEnd
    });

    const retrieveLegacyPosition = (element) => {
        let currentRange = cachedSelectionBoundary || document.selection.createRange();
        if (!currentRange || currentRange.parentElement() !== element) {
            return { begin: 0, end: 0 };
        }

        const totalLength = element.value.length;
        const normalizedContent = normalizeLineEndings(element.value);

        const inputRange = element.createTextRange();
        inputRange.moveToBookmark(currentRange.getBookmark());

        const endBoundaryRange = element.createTextRange();
        endBoundaryRange.collapse(false);

        let startIndex, endIndex;

        if (inputRange.compareEndPoints('StartToEnd', endBoundaryRange) > -1) {
            startIndex = totalLength;
        } else {
            startIndex = -inputRange.moveStart('character', -totalLength);
            startIndex += normalizedContent.slice(0, startIndex).split('\n').length - 1;
        }

        if (inputRange.compareEndPoints('EndToEnd', endBoundaryRange) > -1) {
            endIndex = totalLength;
        } else {
            endIndex = -inputRange.moveEnd('character', -totalLength);
            endIndex += normalizedContent.slice(0, endIndex).split('\n').length - 1;
        }

        return { begin: startIndex, end: endIndex };
    };

    const applyModernPosition = (element, begin, end) => {
        const fixedContent = normalizeLineEndings(element.value);
        let adjustedBegin = begin;
        let adjustedEnd = end;

        const precedingNewlines = fixedContent.substring(0, begin).match(/\n/g);
        const isLegacyEOLPlatform = typeof window.opera !== 'undefined' || (navigator.appName && navigator.appName === 'Microsoft Internet Explorer');

        if (precedingNewlines && isLegacyEOLPlatform) {
            adjustedBegin += precedingNewlines.length;
            adjustedEnd += precedingNewlines.length;
        }
        element.setSelectionRange(adjustedBegin, adjustedEnd);
    };

    const applyLegacyPosition = (element, begin, end) => {
        const range = element.createTextRange();
        const contentLen = element.value.length;
        range.moveStart('character', -contentLen);
        range.moveEnd('character', -contentLen);
        range.moveEnd('character', end);
        range.moveStart('character', begin);
        range.select();
    };

    return {
        acquirePosition: (element) => {
            if (typeof element.selectionStart === 'number' && typeof element.selectionEnd === 'number') {
                return retrieveModernPosition(element);
            } else {
                return retrieveLegacyPosition(element);
            }
        },
        assignPosition: (element, begin, end) => {
            if (element.setSelectionRange) {
                applyModernPosition(element, begin, end);
            } else {
                applyLegacyPosition(element, begin, end);
            }
            element.focus();
        },
        saveCurrentPosition: () => {
            if (document.selection && document.selection.createRange) {
                cachedSelectionBoundary = document.selection.createRange();
            }
        },
        clearSavedPosition: () => {
            cachedSelectionBoundary = null;
        }
    };
})();


const createDocumentEditor = (targetElement) => {
    let targetEditArea = null;
    let helpResourceAddress = "http://daringfireball.net/projects/markdown/syntax";
    
    const controlKey = 90;
    const italicizeKey = 73;
    const strikeKey = 68;
    const emboldenKey = 66;
    const codeKey = 75;
    const spacebarKey = 32;
    const returnKey = 13;
    
    const tabulationString = "    ";
    let awaitingListContinuation = false;
    let currentListFormat = '';
    let lastIdentifiedListItemRange = null;
    let lastNumericListItemValue = null;
    
    const isBadPlatformEOL = typeof window.opera !== "undefined" || (navigator.appName && navigator.appName === "Microsoft Internet Explorer");
    const isPlatformIE = navigator.appName && navigator.appName === "Microsoft Internet Explorer";
        
    const outputDebugMessage = (message) => {
        const currentTime = new Date();
        if (typeof GLOBAL_EDITOR_DEBUG_FLAG === "undefined") {
            return;
        }
        typeof console !== "undefined" && console.log(
            "docEditor -> [" + currentTime.getHours() + ":" 
                + currentTime.getMinutes() + ":" 
                + currentTime.getSeconds() + "] " 
            + message
        );
    };
    
    const historyManager = (() => {
        const revisionRecords = [];
        let currentRevisionPointer = -1;
        let isPlaybackMode = false;
        let canAdvanceRevision = false;

        const acquireCurrentEditorState = () => ({
            selectionBounds: cursorPositionUtility.acquirePosition(targetEditArea),
            contentSnapshot: targetEditArea.value,
            
            restoreState: function() {
                targetEditArea.value = this.contentSnapshot;
                cursorPositionUtility.assignPosition(targetEditArea, this.selectionBounds.begin, this.selectionBounds.end);
            },
            
            compareState: function(otherState) {
                return this.contentSnapshot === otherState.contentSnapshot &&
                       this.selectionBounds.begin === otherState.selectionBounds.begin &&
                       this.selectionBounds.end === otherState.selectionBounds.end;
            }
        });

        const transitionToLiveMode = () => {
            if (isPlaybackMode) {
                const remainingStates = revisionRecords.length - currentRevisionPointer - 1;
                revisionRecords.splice(currentRevisionPointer + 1, remainingStates);
                
                canAdvanceRevision = false;
                isPlaybackMode = false;
                currentRevisionPointer = revisionRecords.length - 1;
            }
        };
        
        const storeRevision = () => {
            if (isPlaybackMode) {
                throw "Cannot save new state in playback mode.";
            }
            
            const newState = acquireCurrentEditorState();
            if (!revisionRecords.length || !revisionRecords[revisionRecords.length - 1].compareState(newState)) {
                revisionRecords.push(newState);
                currentRevisionPointer = revisionRecords.length - 1;
            }
        };
        
        const revertToPrevious = () => {
            if (canRevert()) {
                if (!isPlaybackMode) {
                    isPlaybackMode = true;
                    // Save current state as the one to redo to
                    const currentState = acquireCurrentEditorState();
                    revisionRecords.push(currentState);
                    canAdvanceRevision = true;
                }
                currentRevisionPointer--;
                revisionRecords[currentRevisionPointer].restoreState();
                
                editorInstance.notifyRedoStatus(canAdvance());
                editorInstance.notifyUndoStatus(canRevert());
            }
        };
        
        const advanceToNext = () => {
            if (canAdvance()) {
                currentRevisionPointer++;
                revisionRecords[currentRevisionPointer].restoreState();
                
                if (currentRevisionPointer === revisionRecords.length - 1) {
                    isPlaybackMode = false;
                    canAdvanceRevision = false;
                }
                
                editorInstance.notifyRedoStatus(canAdvance());
                editorInstance.notifyUndoStatus(canRevert());
            }
        };
        
        const canRevert = () => {
            if (!isPlaybackMode) {
                return currentRevisionPointer > 0;
            } else {
                return currentRevisionPointer > 0;
            }
        };
        
        const canAdvance = () => {
            return canAdvanceRevision && isPlaybackMode;
        };
        
        return {
            initialize: () => storeRevision(),
            transitionToLiveMode,
            storeRevision,
            revertToPrevious,
            advanceToNext,
            canRevert,
            canAdvance,
            getCurrentRevision: () => revisionRecords[currentRevisionPointer],
            obtainEditorSnapshot: acquireCurrentEditorState
        };
    })();

    const editorInstance = {
        notifyRedoStatus: null, // Callback for UI updates
        notifyUndoStatus: null, // Callback for UI updates
    };

    const getWindowDimensions = () => {
        if (window.innerWidth) {
            return { width: window.innerWidth, height: window.innerHeight };
        } else if (document.documentElement) {
            return { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
        } else if (document.body) {
            return { width: document.body.clientWidth, height: document.body.clientHeight };
        }        
        return { width: null, height: null };
    };

    const getLineAtCursor = () => {
        const { begin, end } = cursorPositionUtility.acquirePosition(targetEditArea);
        const content = normalizeLineEndings(targetEditArea.value);
        
        let lineStart = content.lastIndexOf('\n', begin - 1) + 1;
        let lineEnd = content.indexOf('\n', end);
        if (lineEnd === -1) lineEnd = content.length;
        
        return content.substring(lineStart, lineEnd);
    };

    const getLineRangeAtCursor = () => {
        const { begin, end } = cursorPositionUtility.acquirePosition(targetEditArea);
        const content = normalizeLineEndings(targetEditArea.value);
        
        let lineStart = content.lastIndexOf('\n', begin - 1) + 1;
        let lineEnd = content.indexOf('\n', end);
        if (lineEnd === -1) lineEnd = content.length;
        
        return { begin: lineStart, end: lineEnd };
    };

    const replaceTextSegment = (newContent, segmentRange) => {
        const fullContent = targetEditArea.value;
        const before = fullContent.substring(0, segmentRange.begin);
        const after = fullContent.substring(segmentRange.end);
        targetEditArea.value = before + newContent + after;
        
        const newCursorPos = segmentRange.begin + newContent.length;
        cursorPositionUtility.assignPosition(targetEditArea, newCursorPos, newCursorPos);
        return { begin: segmentRange.begin, end: newCursorPos };
    };

    const insertTextAtCursor = (textToInsert) => {
        const { begin, end } = cursorPositionUtility.acquirePosition(targetEditArea);
        const fullContent = targetEditArea.value;
        const before = fullContent.substring(0, begin);
        const after = fullContent.substring(end);
        targetEditArea.value = before + textToInsert + after;
        
        const newCursorPos = begin + textToInsert.length;
        cursorPositionUtility.assignPosition(targetEditArea, newCursorPos, newCursorPos);
        return { begin: newCursorPos, end: newCursorPos };
    };

    const handleKeyRelease = (event) => {
        if (event === undefined) {
            event = window.event;
        }

        if (!historyManager.getCurrentRevision().compareState(historyManager.obtainEditorSnapshot())) {
            historyManager.transitionToLiveMode();
            editorInstance.notifyRedoStatus(historyManager.canAdvance());
            editorInstance.notifyUndoStatus(historyManager.canRevert());
        }
        
        if (awaitingListContinuation && currentListFormat === 'bullet' && event.keyCode === returnKey) {
            const lastLineText = normalizeLineEndings(targetEditArea.value).substring(lastIdentifiedListItemRange.begin, lastIdentifiedListItemRange.end);
            
            if ((/^(  \*\s*)$/i).test(lastLineText)){                
                replaceTextSegment("\n", lastIdentifiedListItemRange);
            } else {
                insertTextAtCursor('  * ');
            }
            
            awaitingListContinuation = false;
            currentListFormat = '';
            lastIdentifiedListItemRange = null;
        } else if (awaitingListContinuation && currentListFormat === 'numeric' && event.keyCode === returnKey) {           
            const lastLineText = normalizeLineEndings(targetEditArea.value).substring(lastIdentifiedListItemRange.begin, lastIdentifiedListItemRange.end);
            
            if ((/^(  \d+\.\s*)$/i).test(lastLineText)){                
                replaceTextSegment("\n", lastIdentifiedListItemRange);
            } else {
                insertTextAtCursor('  ' + (++lastNumericListItemValue) + '. ');
            }
            
            awaitingListContinuation = false;
            currentListFormat = '';
            lastIdentifiedListItemRange = null;
            lastNumericListItemValue = null;
        }
    };   
    
    const handleKeyPress = (event) => {       
        if (event === undefined) {
            event = window.event;
            event.preventDefault = establishLink(function() {
                this.returnValue = false;
            }, event);
        }
        
        const keyActionMap = {
            [`Control+Shift+${String.fromCharCode(controlKey)}`]: () => historyManager.advanceToNext(),
            [`Control+${String.fromCharCode(controlKey)}`]: () => historyManager.revertToPrevious(),
            [`Control+${String.fromCharCode(emboldenKey)}`]: () => editorInstance.doBold(),
            [`Control+${String.fromCharCode(italicizeKey)}`]: () => editorInstance.doItalic(),
            [`Control+${String.fromCharCode(strikeKey)}`]: () => editorInstance.doStrikethrough(),
            [`Control+${String.fromCharCode(codeKey)}`]: () => editorInstance.doCode(),
        };

        const currentKeyCombo = [];
        if (event.ctrlKey) currentKeyCombo.push("Control");
        if (event.shiftKey) currentKeyCombo.push("Shift");
        if (event.altKey) currentKeyCombo.push("Alt");
        currentKeyCombo.push(String.fromCharCode(event.keyCode));

        const actionKey = currentKeyCombo.join('+');
        if (keyActionMap[actionKey]) {
            event.preventDefault();
            keyActionMap[actionKey]();
        }

        if (event.keyCode === returnKey || event.keyCode === spacebarKey) {
            historyManager.storeRevision();
        }

        if (event.keyCode === returnKey){
            const currentLine = getLineAtCursor();
            let matchedList = null;
            if (currentLine.startsWith("  *")){
                awaitingListContinuation = true;
                currentListFormat = 'bullet';
                lastIdentifiedListItemRange = getLineRangeAtCursor();
            } else if ((matchedList = currentLine.match(/^  (\d+)\./i)) !== null){
                awaitingListContinuation = true;
                currentListFormat = "numeric";
                lastIdentifiedListItemRange = getLineRangeAtCursor();
                lastNumericListItemValue = parseInt(matchedList[1]);
            }
        }
    };
    
    editorInstance.setup = (initialTextArea) => {       
        if (initialTextArea === null || initialTextArea.type !== "textarea"){
            throw new Error("Invalid target text area provided.");
        }
        
        targetEditArea = initialTextArea;
        historyManager.initialize();
        
        targetEditArea.addEventListener('keyup', handleKeyRelease);
        targetEditArea.addEventListener('keydown', handleKeyPress);
        
        targetEditArea.addEventListener('paste', () => historyManager.storeRevision());
        targetEditArea.addEventListener('cut', () => historyManager.storeRevision());
    };

    editorInstance.retrieveText = () => targetEditArea.value;
    editorInstance.updateText = (newText) => { targetEditArea.value = newText; };
    editorInstance.acquireCursorBounds = () => cursorPositionUtility.acquirePosition(targetEditArea);
    editorInstance.assignCursorBounds = (begin, end) => cursorPositionUtility.assignPosition(targetEditArea, begin, end);
    editorInstance.fetchSelectedText = () => {
        const { begin, end } = cursorPositionUtility.acquirePosition(targetEditArea);
        return normalizeLineEndings(targetEditArea.value).substring(begin, end);
    };

    editorInstance.cacheCursor = cursorPositionUtility.saveCurrentPosition;
    editorInstance.clearCachedCursor = cursorPositionUtility.clearSavedPosition;

    // Placeholder methods for actual editing actions
    editorInstance.doBold = () => outputDebugMessage("Bold action triggered.");
    editorInstance.doItalic = () => outputDebugMessage("Italic action triggered.");
    editorInstance.doStrikethrough = () => outputDebugMessage("Strikethrough action triggered.");
    editorInstance.doCode = () => outputDebugMessage("Code block action triggered.");
    editorInstance.doUndo = historyManager.revertToPrevious;
    editorInstance.doRedo = historyManager.advanceToNext;
    editorInstance.canPerformUndo = historyManager.canRevert;
    editorInstance.canPerformRedo = historyManager.canAdvance;
    
    return editorInstance;
};

// Example usage (not part of the clone, but for context)
// const myEditor = createDocumentEditor(document.getElementById('myTextArea'));
// myEditor.setup(document.getElementById('myTextArea'));
// myEditor.notifyRedoStatus = (can) => console.log('Redo possible:', can);
// myEditor.notifyUndoStatus = (can) => console.log('Undo possible:', can);