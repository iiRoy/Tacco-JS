class TextReader {
  #internalSourceText;
  #wordSegments;
  #currentWordIndex;
  #currentDisplayWord;
  #readDelay;
  #delayIncrement;
  #isActivelyReading;
  #delayBaseFactor;
  #timerIdentifier;
  #updateDisplayCallback;

  constructor(initialContent = "", notificationHandler) {
    this.#internalSourceText = initialContent;
    this.#wordSegments = [];
    this.#currentWordIndex = 0;
    this.#currentDisplayWord = "&nbsp;".repeat(9) + "a-word";
    this.#readDelay = 100;
    this.#delayIncrement = 10;
    this.#isActivelyReading = false;
    this.#delayBaseFactor = 20;
    this.#timerIdentifier = null;
    this.#updateDisplayCallback = notificationHandler;

    this.#prepareContent();
  }

  static #determinePivot(phrase) {
    const length = phrase.length;
    if (length === 1) return 1;
    if (length >= 2 && length <= 5) return 2;
    if (length >= 6 && length <= 9) return 3;
    if (length >= 10 && length <= 13) return 4;
    return 5;
  }

  static #generateLeadWhitespace(pivotPoint) {
    const totalWhitespace = 10;
    const neededWhitespace = totalWhitespace - pivotPoint;
    return "&nbsp;".repeat(Math.max(0, neededWhitespace));
  }

  static #decorateWord(phrase, pivot) {
    if (phrase.length < 2) {
      return `<span class="rojo">${phrase}</span>`;
    }
    const highlightPosition = pivot - 1;
    const partBefore = phrase.substring(0, highlightPosition);
    const highlightedChar = phrase.substring(highlightPosition, highlightPosition + 1);
    const partAfter = phrase.substring(highlightPosition + 1);
    return `${partBefore}<span class="rojo">${highlightedChar}</span>${partAfter}`;
  }

  #prepareContent() {
    this.#currentWordIndex = 0;
    this.#wordSegments = this.#internalSourceText.split(" ");
  }

  #processNextChunk() {
    if (this.#wordSegments.length > this.#currentWordIndex) {
      const currentChunk = this.#wordSegments[this.#currentWordIndex];
      const pivot = TextReader.#determinePivot(currentChunk);
      const padding = TextReader.#generateLeadWhitespace(pivot);
      const formattedChunk = TextReader.#decorateWord(currentChunk, pivot);

      this.#currentDisplayWord = padding + formattedChunk;
      this.#currentWordIndex++;

      if (this.#updateDisplayCallback) {
        this.#updateDisplayCallback(this.#currentDisplayWord);
      }

      if (this.#isActivelyReading) {
        const chunkDelay = Math.floor(((currentChunk.length + 2) / 2) * this.#delayBaseFactor) + this.#readDelay;
        this.#timerIdentifier = setTimeout(() => this.#processNextChunk(), chunkDelay);
      }
    } else {
      this.#isActivelyReading = false;
      this.#currentWordIndex = 0;
      if (this.#updateDisplayCallback) {
        this.#updateDisplayCallback(this.#currentDisplayWord);
      }
    }
  }

  updateSource(newContent) {
    this.#internalSourceText = newContent;
    this.#prepareContent();
    this.haltReading();
    if (this.#updateDisplayCallback) {
      this.#updateDisplayCallback(this.#currentDisplayWord);
    }
  }

  beginReading() {
    this.#isActivelyReading = true;
    if (!this.#wordSegments || this.#wordSegments.length === 0 || this.#currentWordIndex >= this.#wordSegments.length) {
      this.#prepareContent();
      if (this.#wordSegments.length === 0) {
        this.#isActivelyReading = false;
        return;
      }
    }
    if (this.#timerIdentifier) {
      clearTimeout(this.#timerIdentifier);
      this.#timerIdentifier = null;
    }
    this.#processNextChunk();
  }

  haltReading() {
    this.#isActivelyReading = false;
    if (this.#timerIdentifier) {
      clearTimeout(this.#timerIdentifier);
      this.#timerIdentifier = null;
    }
  }

  resetProgress() {
    this.haltReading();
    this.#prepareContent();
    this.#currentDisplayWord = "&nbsp;".repeat(9) + "a-word";
    if (this.#updateDisplayCallback) {
      this.#updateDisplayCallback(this.#currentDisplayWord);
    }
  }

  acceleratePlayback() {
    this.#readDelay += this.#delayIncrement;
  }

  deceleratePlayback() {
    this.#readDelay = Math.max(0, this.#readDelay - this.#delayIncrement);
  }

  purgeContent() {
    this.#internalSourceText = "";
    this.#wordSegments = [];
    this.#currentWordIndex = 0;
    this.#currentDisplayWord = "&nbsp;".repeat(9) + "a-word";
    this.#isActivelyReading = false;
    this.haltReading();
    if (this.#updateDisplayCallback) {
      this.#updateDisplayCallback(this.#currentDisplayWord);
    }
  }

  getDisplayedContent() {
    return this.#currentDisplayWord;
  }
}