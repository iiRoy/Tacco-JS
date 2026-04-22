class RapidReadApplication {
    constructor() {
        this.interfaceManager = new InterfaceManager(this);
        this.elementLocator = new ElementLocator();
        this.wordFormatter = new WordFormatter();
        this.visualizer = new CanvasVisualizer(this.wordFormatter);
        this.playbackEngine = new PlaybackEngine(this.visualizer, this.wordFormatter);
        this.userInteractionHandler = new UserInteractionHandler(this.elementLocator, this.playbackEngine, this.visualizer.controlGraphics);
    }

    start(inputElementIdentifier, completionCallback) {
        this.interfaceManager.initializeInterface();
        this.visualizer.textCanvas.setupDisplayCanvas();
        this.visualizer.controlGraphics.setupControlCanvas();
        this.playbackEngine.prepareReading(inputElementIdentifier, completionCallback);
    }
}

class InterfaceManager {
    constructor(appInstance) {
        this.app = appInstance;
    }

    initializeInterface() {
        this.constructDomElements();
        this.applyStyleRules();
    }

    constructDomElements() {
        const containerElement = document.getElementById('speed-reader-container');
        if (!containerElement) {
            console.error('Core container element #speed-reader-container not found.');
            return;
        }

        containerElement.innerHTML = `
            <div class="reading-wrapper">
                <canvas id="text-display-area"></canvas>
                <div class="control-panel">
                    <select id="speed-setting-selector">
                        <option value="250" selected="selected">250 WPM</option>
                        <option value="300">300 WPM</option>
                        <option value="350">350 WPM</option>
                        <option value="400">400 WPM</option>
                        <option value="450">450 WPM</option>
                        <option value="500">500 WPM</option>
                        <option value="550">550 WPM</option>
                        <option value="600">600 WPM</option>
                    </select>
                    <canvas id="action-buttons-canvas"></canvas>
                    <a href="http://www.vastr.de"><img id="app-branding-logo" alt="Vastr.de" /></a>
                </div>
            </div>
        `;

        const speedSelectorElement = document.getElementById('speed-setting-selector');
        if (speedSelectorElement) {
            speedSelectorElement.addEventListener('change', () => this.app.playbackEngine.adjustReadingSpeed());
        }

        const actionButtonsCanvasElement = document.getElementById('action-buttons-canvas');
        if (actionButtonsCanvasElement) {
            actionButtonsCanvasElement.addEventListener('click', (e) => this.app.userInteractionHandler.handleControlClick(e));
        }
    }

    applyStyleRules() {
        const container = document.getElementById('speed-reader-container');
        if (!container) return;

        const wrapperDiv = container.querySelector('.reading-wrapper');
        if (wrapperDiv) {
            Object.assign(wrapperDiv.style, {
                margin: '0 auto',
                maxWidth: '720px',
                overflow: 'hidden'
            });
        }

        const controlPanelDiv = container.querySelector('.control-panel');
        if (controlPanelDiv) {
            Object.assign(controlPanelDiv.style, {
                textAlign: 'center',
                marginTop: '8px'
            });
        }

        const brandingLogo = container.querySelector('#app-branding-logo');
        if (brandingLogo) {
            Object.assign(brandingLogo.style, {
                float: 'right',
                margin: '2px 0',
                width: '80px'
            });
        }

        const actionCanvas = container.querySelector('#action-buttons-canvas');
        if (actionCanvas) {
            Object.assign(actionCanvas.style, {
                marginLeft: '-46px'
            });
        }

        const speedInputSelector = container.querySelector('#speed-setting-selector');
        if (speedInputSelector) {
            Object.assign(speedInputSelector.style, {
                border: '1px solid #CCCCCC',
                borderRadius: '4px',
                color: '#555555',
                fontSize: '14px',
                height: '33px',
                padding: '6px 12px',
                width: '180px',
                float: 'left',
                position: 'relative',
                zIndex: '944'
            });
        }

        const outputCanvasDisplay = container.querySelector('#text-display-area');
        if (outputCanvasDisplay) {
            Object.assign(outputCanvasDisplay.style, {
                width: '100%'
            });
        }
    }
}

class ElementLocator {
    calculateElementPosition(elementId) {
        const targetElement = document.getElementById(elementId);
        if (!targetElement) {
            console.error(`Element with ID '${elementId}' not found for position calculation.`);
            return [0, 0];
        }
        const boundingBox = targetElement.getBoundingClientRect();
        const absoluteHorizontal = boundingBox.left + window.scrollX;
        const absoluteVertical = boundingBox.top + window.scrollY;
        return [absoluteHorizontal, absoluteVertical];
    }
}

class UserInteractionHandler {
    constructor(locator, engine, controlGraphics) {
        this.positionFinder = locator;
        this.playbackCore = engine;
        this.buttonVisuals = controlGraphics;
    }

    handleControlClick(clickEvent) {
        const controlCanvasId = 'action-buttons-canvas';
        const [canvasAbsoluteX] = this.positionFinder.calculateElementPosition(controlCanvasId);
        const relativeClickX = clickEvent.pageX - canvasAbsoluteX;

        if (relativeClickX >= 0 && relativeClickX <= 24) {
            this.playbackCore.restartReading();
        } else if (relativeClickX >= 35 && relativeClickX <= 60) {
            this.playbackCore.startReading();
        } else if (relativeClickX >= 74 && relativeClickX <= 98) {
            this.playbackCore.pauseReading();
        }
    }
}

class CanvasVisualizer {
    constructor(formatter) {
        this.textCanvas = new TextDisplayCanvas(formatter);
        this.controlGraphics = new ControlButtonCanvas();
    }
}

class TextDisplayCanvas {
    constructor(formatter) {
        this.displayCanvasElement = null;
        this.displayCanvasContext = null;
        this.wordFormatter = formatter;
    }

    setupDisplayCanvas() {
        this.displayCanvasElement = document.getElementById('text-display-area');
        if (!this.displayCanvasElement) {
            console.error('Canvas element #text-display-area not found.');
            return;
        }
        this.displayCanvasElement.setAttribute('width', 720);
        this.displayCanvasElement.setAttribute('height', 100);

        if (this.displayCanvasElement.getContext) {
            this.displayCanvasContext = this.displayCanvasElement.getContext('2d');

            this.displayCanvasContext.fillStyle = "#3F3F41";
            this.displayCanvasContext.fillRect(0, 0, 720, 5);
            this.displayCanvasContext.fillRect(0, 95, 720, 5);

            this.displayCanvasContext.beginPath();
            this.displayCanvasContext.moveTo(234, 5);
            this.displayCanvasContext.lineTo(243, 20);
            this.displayCanvasContext.lineTo(252, 5);
            this.displayCanvasContext.closePath();
            this.displayCanvasContext.fill();

            this.displayCanvasContext.beginPath();
            this.displayCanvasContext.moveTo(234, 95);
            this.displayCanvasContext.lineTo(243, 80);
            this.displayCanvasContext.lineTo(252, 95);
            this.displayCanvasContext.closePath();
            this.displayCanvasContext.fill();

            this.displayCanvasContext.font = 'Normal 42px Lucida Console, Monaco, monospace';
            this.displayCanvasContext.translate(0.9, 1);
        }
    }

    renderWord(currentWord) {
        if (!this.displayCanvasContext) return;

        this.displayCanvasContext.clearRect(0, 21, 720, 53);

        let currentXCoord = 0;
        const initialTextX = 129;

        const wordSegments = this.wordFormatter.getFormattedParts(currentWord);

        this.displayCanvasContext.fillStyle = "#3F3F41";
        this.displayCanvasContext.fillText(wordSegments.leading, initialTextX + currentXCoord, 62);
        currentXCoord += this.displayCanvasContext.measureText(wordSegments.leading).width;

        this.displayCanvasContext.fillText(wordSegments.pre, initialTextX + currentXCoord, 62);
        currentXCoord += this.displayCanvasContext.measureText(wordSegments.pre).width;

        this.displayCanvasContext.fillStyle = "#22ABA6";
        this.displayCanvasContext.fillText(wordSegments.pivot, initialTextX + currentXCoord, 62);
        currentXCoord += this.displayCanvasContext.measureText(wordSegments.pivot).width;

        this.displayCanvasContext.fillStyle = "#3F3F41";
        this.displayCanvasContext.fillText(wordSegments.post, initialTextX + currentXCoord, 62);
    }
}

class ControlButtonCanvas {
    constructor() {
        this.controlCanvasElement = null;
        this.controlCanvasContext = null;
        this.controlButtonImageData = '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';
    }

    setupControlCanvas() {
        this.controlCanvasElement = document.getElementById('action-buttons-canvas');
        if (!this.controlCanvasElement) {
            console.error('Canvas element #action-buttons-canvas not found.');
            return;
        }
        this.controlCanvasElement.setAttribute('width', 94);
        this.controlCanvasElement.setAttribute('height', 27);

        if (this.controlCanvasElement.getContext) {
            this.controlCanvasContext = this.controlCanvasElement.getContext('2d');
            this.updateControlButtons(0, 0, 1); // Initial state: stop button active

            const brandingLogoElement = document.getElementById('app-branding-logo');
            if (brandingLogoElement) {
                brandingLogoElement.src = 'data:image/png;base64, ' + this.controlButtonImageData;
            }
        }
    }

    updateControlButtons(repeatActive, playActive, stopActive) {
        if (!this.controlCanvasContext) return;

        this.controlCanvasContext.clearRect(0, 0, 94, 27);

        this.controlCanvasContext.fillStyle = (repeatActive === 0 ? '#3F3F41' : '#22ABA6');
        this.controlCanvasContext.beginPath();
        this.controlCanvasContext.moveTo(26, 2);
        this.controlCanvasContext.lineTo(2, 13);
        this.controlCanvasContext.lineTo(26, 27);
        this.controlCanvasContext.closePath();
        this.controlCanvasContext.fill();

        this.controlCanvasContext.fillStyle = (playActive === 0 ? '#3F3F41' : '#22ABA6');
        this.controlCanvasContext.beginPath();
        this.controlCanvasContext.moveTo(37, 2);
        this.controlCanvasContext.lineTo(61, 13);
        this.controlCanvasContext.lineTo(37, 27);
        this.controlCanvasContext.closePath();
        this.controlCanvasContext.fill();

        this.controlCanvasContext.fillStyle = (stopActive === 0 ? '#3F3F41' : '#22ABA6');
        this.controlCanvasContext.fillRect(75, 2, 5, 25);
        this.controlCanvasContext.fillRect(85, 2, 5, 25);
    }
}

class WordFormatter {
    constructor() {
        this.pivotPointMap = [
            0, // Placeholder for length 0, not typically used for words.
            1, // Length 1: pivot at 1st char
            1, // Length 2: pivot at 1st char
            2, // Length 3: pivot at 2nd char
            2, // Length 4: pivot at 2nd char
            2, // Length 5: pivot at 2nd char
            2, // Length 6: pivot at 2nd char
            3, // Length 7: pivot at 3rd char
            3, // Length 8: pivot at 3rd char
            3, // Length 9: pivot at 3rd char
            3, // Length 10: pivot at 3rd char
            4, // Length 11: pivot at 4th char
            4, // Length 12: pivot at 4th char
            4  // Length 13: pivot at 4th char
        ];
    }

    determinePivotIndex(wordLength) {
        if (wordLength <= 0) return 1;
        if (wordLength < this.pivotPointMap.length && this.pivotPointMap[wordLength] !== undefined) {
            return this.pivotPointMap[wordLength];
        } else {
            return 5;
        }
    }

    generateLeadingSpaces(count) {
        return ' '.repeat(Math.max(0, count));
    }

    getFormattedParts(word) {
        const pivotCharacterPosition = this.determinePivotIndex(word.length);
        const leadingSpaceCount = 5 - pivotCharacterPosition;

        const leadingText = this.generateLeadingSpaces(leadingSpaceCount);
        const prePivotText = word.substring(0, pivotCharacterPosition - 1);
        const pivotChar = word.substring(pivotCharacterPosition - 1, pivotCharacterPosition);
        const postPivotText = word.substring(pivotCharacterPosition);

        return {
            leading: leadingText,
            pre: prePivotText,
            pivot: pivotChar,
            post: postPivotText
        };
    }
}

class PlaybackEngine {
    constructor(visualizer, formatter) {
        this.currentReadState = 0; // 0: idle, 1: running, 2: pending stop
        this.wordDelayMs = 240; // Default WPM 250 -> 240ms delay (1000 * 60 / 250)
        this.onCompletionHandler = null;
        this.fullTextContent = '';
        this.sourceInputElement = null;
        this.wordQueue = [];
        this.currentTimeoutId = null;
        this.canvasVisualizer = visualizer;
        this.wordFormatter = formatter;
    }

    prepareReading(inputElementSelector, callback) {
        this.onCompletionHandler = callback;
        this.sourceInputElement = document.querySelector(inputElementSelector);

        let textToProcess = '';
        if (this.sourceInputElement) {
            const tag = this.sourceInputElement.tagName.toUpperCase();
            if (tag === 'INPUT' || tag === 'TEXTAREA') {
                textToProcess = this.sourceInputElement.value;
            } else {
                textToProcess = this.sourceInputElement.textContent;
            }
        }
        
        this.fullTextContent = textToProcess.replace(/[\n\r\t]/g, " ") + " \n";
        this.wordQueue = this.fullTextContent.split(" ").filter(segment => segment !== '');

        this.displayCurrentWord("RapidRead.js");
        this.setReadingState(0);
        this.adjustReadingSpeed();
    }

    startReading() {
        if (this.currentReadState === 0) {
            this.setReadingState(1);
            this.processNextWord();
        }
    }

    pauseReading() {
        if (this.currentReadState === 1) {
            this.setReadingState(2);
        }
    }

    restartReading() {
        if (this.currentTimeoutId) {
            clearTimeout(this.currentTimeoutId);
        }
        const selector = this.sourceInputElement.id ? `#${this.sourceInputElement.id}` : this.sourceInputElement.tagName.toLowerCase();
        this.prepareReading(selector, this.onCompletionHandler);
        this.setReadingState(0);
    }

    adjustReadingSpeed() {
        const speedSelectorElement = document.getElementById('speed-setting-selector');
        if (speedSelectorElement) {
            const selectedWpm = parseInt(speedSelectorElement.value, 10);
            this.setWordDelay(1000 * 60 / selectedWpm);
        }
    }

    getCurrentState() {
        return this.currentReadState;
    }

    setReadingState(state) {
        this.currentReadState = state;
        let repeatButtonState = 0, playButtonState = 0, stopButtonState = 0;
        switch (state) {
            case 1:
                playButtonState = 1;
                break;
            case 0:
            case 2:
            default:
                stopButtonState = 1;
                break;
        }
        this.canvasVisualizer.controlGraphics.updateControlButtons(repeatButtonState, playButtonState, stopButtonState);
    }

    setWordDelay(delay) {
        this.wordDelayMs = delay;
    }

    getWordDelay() {
        return this.wordDelayMs;
    }

    handlePunctuationPause() {
        this.displayCurrentWord(" ");
        this.currentTimeoutId = setTimeout(() => this.processNextWord(), this.wordDelayMs * 2);
    }

    processNextWord() {
        if (this.currentReadState === 2) {
            this.setReadingState(0);
            return;
        }

        if (this.wordQueue.length === 0) {
            this.setReadingState(0);
            this.restartReading();
            if (typeof this.onCompletionHandler === 'function') {
                this.onCompletionHandler();
            }
            return;
        }

        let nextWord = this.wordQueue.shift();
        while (nextWord === '' && this.wordQueue.length > 0) {
            nextWord = this.wordQueue.shift();
        }

        this.displayCurrentWord(nextWord);

        if (nextWord.includes(".")) {
            this.currentTimeoutId = setTimeout(() => this.handlePunctuationPause(), this.wordDelayMs);
        } else {
            this.currentTimeoutId = setTimeout(() => this.processNextWord(), this.wordDelayMs);
        }
    }

    displayCurrentWord(word) {
        this.canvasVisualizer.textCanvas.renderWord(word);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Ensure the main container exists, create if not for robust testing
    let mainContainer = document.getElementById('speed-reader-container');
    if (!mainContainer) {
        mainContainer = document.createElement('div');
        mainContainer.id = 'speed-reader-container';
        document.body.appendChild(mainContainer);
    }

    // Ensure an input source exists, create a textarea if not
    let inputSourceElement = document.getElementById('input-text-source');
    if (!inputSourceElement) {
        inputSourceElement = document.createElement('textarea');
        inputSourceElement.id = 'input-text-source';
        inputSourceElement.value = "This is a sample text for the speed reader. It includes some punctuation. Like a period. And maybe a very long word to test the pivot character logic: supercalifragilisticexpialidocious. The quick brown fox jumps over the lazy dog. End.";
        document.body.appendChild(inputSourceElement);
        // Add some basic styling to make it visible
        inputSourceElement.style.width = '700px';
        inputSourceElement.style.height = '100px';
        inputSourceElement.style.margin = '10px auto';
        inputSourceElement.style.display = 'block';
    }

    const applicationInstance = new RapidReadApplication();
    applicationInstance.start('#input-text-source');
});