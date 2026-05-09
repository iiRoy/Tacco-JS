class SpeedReaderEngine {
    constructor(configurationSettings) {
        this.configurationSettings = {
            rateInputIdentifier: 'readRateSelector',
            contentDisplayAreaIdentifier: 'displayOutputContainer',
            playbackControlIdentifier: 'playbackControlBtn',
            displayWrapperIdentifier: 'displayOutputWrapper',
            loadingMessageIdentifier: 'loadingIndicatorArea',
            apiToken: '2efef432c72b5a923408e04353c39a7c', // Diffbot API token from original
            ...configurationSettings
        };

        this.processedWordSequence = [];
        this.currentSequencePosition = 0;
        this.displayIntervalHandle = null;
        this.isPlaybackActive = false;
        this.currentReadingSpeed = 0;
        this.millisecondsPerUnit = 0;
        this.activeContentDetails = {
            sourceUrl: '',
            contentKey: ''
        };

        this.domReferences = {};
        this.establishDomAccess();
        this.attachInteractionHandlers();
        this.initializeEngineParameters();
    }

    establishDomAccess() {
        this.domReferences.rateInput = document.getElementById(this.configurationSettings.rateInputIdentifier);
        this.domReferences.contentDisplayArea = document.getElementById(this.configurationSettings.contentDisplayAreaIdentifier);
        this.domReferences.playbackControl = document.getElementById(this.configurationSettings.playbackControlIdentifier);
        this.domReferences.displayWrapper = document.getElementById(this.configurationSettings.displayWrapperIdentifier);
        this.domReferences.loadingMessage = document.getElementById(this.configurationSettings.loadingMessageIdentifier);
    }

    attachInteractionHandlers() {
        if (this.domReferences.rateInput) {
            this.domReferences.rateInput.addEventListener('change', this.handleRateSettingChange.bind(this));
        }
        if (this.domReferences.contentDisplayArea) {
            this.domReferences.contentDisplayArea.addEventListener('click', this.togglePlaybackState.bind(this));
        }
    }

    initializeEngineParameters() {
        const storedRate = localStorage.getItem('WPM');
        if (storedRate && this.domReferences.rateInput) {
            this.domReferences.rateInput.value = storedRate;
        }
        this.refreshRateCalculations();
    }

    refreshRateCalculations() {
        if (this.domReferences.rateInput) {
            this.currentReadingSpeed = parseInt(this.domReferences.rateInput.value, 10);
            if (this.currentReadingSpeed < 1) {
                this.currentReadingSpeed = 1;
            }
            this.millisecondsPerUnit = 60000 / this.currentReadingSpeed;
        }
    }

    handleRateSettingChange(event) {
        this.terminateAllActiveIntervals();
        localStorage.setItem('WPM', event.target.value);
        this.refreshRateCalculations();
        this.beginReadingProcess();
    }

    beginReadingProcess() {
        if (this.currentReadingSpeed < 1) {
            return;
        }
        if (this.activeContentDetails.sourceUrl && this.activeContentDetails.contentKey) {
            this.processContentSource(this.activeContentDetails.sourceUrl, this.activeContentDetails.contentKey);
        } else {
            console.warn("No article URL or key has been set. Please call processContentSource(url, key) first.");
            if (this.domReferences.contentDisplayArea) {
                this.domReferences.contentDisplayArea.textContent = "Please load content to begin speed reading.";
            }
        }
    }

    async retrieveApiContent(contentSourceUrl, resultCallback) {
        try {
            const response = await fetch(`https://api.diffbot.com/v2/article?url=${encodeURIComponent(contentSourceUrl)}&token=${this.configurationSettings.apiToken}`);
            const data = await response.json();
            resultCallback(data);
        } catch (error) {
            console.error("Content retrieval error:", error);
            resultCallback({ error: "Failed to retrieve article content." });
        }
    }

    processContentSource(pageUrl, contentIdentifier) {
        this.terminateAllActiveIntervals();
        this.activeContentDetails.sourceUrl = pageUrl;
        this.activeContentDetails.contentKey = contentIdentifier;

        // External functions `convertToSlug` and `createOrUpdate` are omitted as they are not provided.
        // Original: currentSlug = convertToSlug(url);
        // Original: createOrUpdate(url, data.title);

        if (this.domReferences.displayWrapper) {
            this.domReferences.displayWrapper.style.display = 'block';
        }
        if (this.domReferences.loadingMessage) {
            this.domReferences.loadingMessage.textContent = 'Loading...';
            this.domReferences.loadingMessage.style.display = 'block';
        }
        if (this.domReferences.contentDisplayArea) {
             this.domReferences.contentDisplayArea.style.display = 'none';
        }

        this.retrieveApiContent(pageUrl, (apiResponse) => {
            if (this.domReferences.loadingMessage) {
                this.domReferences.loadingMessage.style.display = 'none';
            }
            if (this.domReferences.contentDisplayArea) {
                this.domReferences.contentDisplayArea.style.display = 'block';
            }

            if (apiResponse.error) {
                if (this.domReferences.contentDisplayArea) {
                    this.domReferences.contentDisplayArea.textContent = "Article extraction encountered an issue. Consider selecting text manually.";
                }
                return;
            }

            const articleTitle = apiResponse.title || '';
            const articleAuthor = apiResponse.author || '';
            const articleBody = apiResponse.text || '';

            this.prepareAndDisplayContent(articleBody, articleTitle, articleAuthor);
        });
    }

    prepareAndDisplayContent(rawText, contentTitle, contentAuthor) {
        this.refreshRateCalculations();

        let sanitizedText = rawText.trim();
        sanitizedText = sanitizedText.replace(/\s+/g, ' ');

        let introductoryPhrase = "Article commencing in Five. Four. Three. Two. One. ";
        let titleBlock = contentTitle ? `${contentTitle}. ` : '';
        let authorBlock = contentAuthor ? `By ${contentAuthor}. ` : '';

        let finalCombinedText = introductoryPhrase + titleBlock + authorBlock + sanitizedText;
        finalCombinedText = finalCombinedText.replace(/\./g, '. ').replace(/\?/g, '? ').replace(/\!/g, '! ');

        this.processedWordSequence = this.constructWordSequence(finalCombinedText);
        this.currentSequencePosition = 0;

        if (this.processedWordSequence.length > 0) {
            this.startPlayback();
        } else {
            if (this.domReferences.contentDisplayArea) {
                this.domReferences.contentDisplayArea.textContent = "No discernible content for reading.";
            }
        }
    }

    constructWordSequence(sourceText) {
        const initialTokens = sourceText.split(/\s+/).filter(Boolean);

        return initialTokens.flatMap(originalToken => {
            let tokenForProcessing = originalToken;
            let resultingTokens = [];

            // Replace first '.' with HTML entity if present
            if (tokenForProcessing.includes('.')) {
                tokenForProcessing = tokenForProcessing.replace('.', '&#8226;');
            }

            // Duplication logic: if long or contains specific punctuation (excluding '.'), duplicate twice.
            const requiresDuplication =
                (originalToken.includes(',') || originalToken.includes(':') || originalToken.includes('-') || originalToken.includes('(') || originalToken.length > 8) &&
                !originalToken.includes('.');

            if (requiresDuplication) {
                resultingTokens.push(tokenForProcessing, tokenForProcessing, tokenForProcessing);
            } else {
                resultingTokens.push(tokenForProcessing);
            }

            // Add three spaces after punctuation
            const endsWithTerminalPunctuation =
                originalToken.includes('.') || originalToken.includes('!') || originalToken.includes('?') ||
                originalToken.includes(':') || originalToken.includes(';') || originalToken.includes(')');

            if (endsWithTerminalPunctuation) {
                resultingTokens.push(" ", " ", " ");
            }

            return resultingTokens;
        }).filter(Boolean);
    }

    // Utility for string padding, replacing custom String.prototype.repeat
    _generatePadding(character, desiredLength) {
        if (desiredLength < 1) return '';
        return Array(desiredLength + 1).join(character);
    }

    // Utility for decoding HTML entities, replacing original decodeEntities
    _decodeHtmlText(encodedString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(encodedString, "text/html");
        return doc.documentElement.textContent;
    }

    renderFormattedWord(rawWordString) {
        const cleanedWord = this._decodeHtmlText(rawWordString);
        const wordLength = cleanedWord.length;

        let focalPointIndex = 4; // Default for longer words

        if (wordLength === 1) focalPointIndex = 1;
        else if (wordLength >= 2 && wordLength <= 5) focalPointIndex = 2;
        else if (wordLength >= 6 && wordLength <= 9) focalPointIndex = 3;
        else if (wordLength >= 10 && wordLength <= 13) focalPointIndex = 4;

        const initialSegment = cleanedWord.slice(0, focalPointIndex - 1);
        const focalCharacter = cleanedWord.slice(focalPointIndex - 1, focalPointIndex);
        const trailingSegment = cleanedWord.slice(focalPointIndex, wordLength);

        const leftSpacer = this._generatePadding('.', 4 - focalPointIndex);
        const rightSpacer = this._generatePadding('.', 4 - (wordLength - focalPointIndex));

        const displayInitial = leftSpacer + initialSegment;
        const displayFocal = focalCharacter;
        const displayTrailing = trailingSegment + rightSpacer;

        let finalHtmlOutput = `<span class='reader-prefix'>${displayInitial}</span><span class='reader-focus'>${displayFocal}</span><span class='reader-suffix'>${displayTrailing}</span>`;
        finalHtmlOutput = finalHtmlOutput.replace(/\./g, "<span class='hidden-char'>.</span>");

        return finalHtmlOutput;
    }

    updateContentDisplay() {
        if (this.currentSequencePosition < this.processedWordSequence.length) {
            const currentRenderedWord = this.renderFormattedWord(this.processedWordSequence[this.currentSequencePosition]);
            if (this.domReferences.contentDisplayArea) {
                this.domReferences.contentDisplayArea.innerHTML = currentRenderedWord;
            }
            this.currentSequencePosition++;
        } else {
            this.currentSequencePosition = 0;
            this.stopPlayback();
        }
    }

    startPlayback() {
        this.terminateAllActiveIntervals();
        this.isPlaybackActive = true;
        if (this.domReferences.playbackControl) {
            this.domReferences.playbackControl.textContent = "Pause";
        }

        const advanceWord = () => {
            if (!this.isPlaybackActive) return;

            this.updateContentDisplay();

            if (this.currentSequencePosition < this.processedWordSequence.length) {
                this.displayIntervalHandle = setTimeout(advanceWord, this.millisecondsPerUnit);
            } else {
                this.stopPlayback();
            }
        };

        this.updateContentDisplay(); // Display first word immediately
        if (this.currentSequencePosition < this.processedWordSequence.length) {
            this.displayIntervalHandle = setTimeout(advanceWord, this.millisecondsPerUnit);
        } else {
            this.stopPlayback();
        }
    }

    stopPlayback() {
        this.terminateAllActiveIntervals();
        this.isPlaybackActive = false;
        if (this.domReferences.playbackControl) {
            this.domReferences.playbackControl.textContent = "Play";
        }
    }

    togglePlaybackState() {
        if (this.isPlaybackActive) {
            this.stopPlayback();
        } else {
            this.startPlayback();
        }
    }

    terminateAllActiveIntervals() {
        if (this.displayIntervalHandle) {
            clearTimeout(this.displayIntervalHandle);
            this.displayIntervalHandle = null;
        }
    }
}