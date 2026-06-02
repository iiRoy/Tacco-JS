"use strict";

class InputProcessor {
    constructor(sourceText, valueMapper) {
        this.lineSource = sourceText.split('\n');
        this.lineCursor = 0;
        this.tokenCursor = 0;
        this.mapper = valueMapper || Number;
        this.currentLineTokens = [];
        this.isLineTrimmedForAtom = false;
        this.lineFullyProcessed = true;
    }

    _loadLineTokens(trimLine) {
        if (this.lineCursor >= this.lineSource.length) {
            return false;
        }

        const currentRawLine = this.lineSource[this.lineCursor];
        let tokens;

        if (trimLine) {
            if (!this.isLineTrimmedForAtom || this.lineFullyProcessed) {
                tokens = currentRawLine.trim().split(' ');
                this.currentLineTokens = tokens.map(this.mapper);
                this.tokenCursor = 0;
                this.isLineTrimmedForAtom = true;
                this.lineFullyProcessed = false;
            }
        } else {
            if (this.isLineTrimmedForAtom || this.lineFullyProcessed) {
                tokens = currentRawLine.split(' ');
                this.currentLineTokens = tokens.map(this.mapper);
                this.tokenCursor = 0;
                this.isLineTrimmedForAtom = false;
                this.lineFullyProcessed = false;
            }
        }
        return true;
    }

    extractAtom() {
        while (true) {
            if (!this._loadLineTokens(true)) {
                return undefined;
            }

            if (this.tokenCursor < this.currentLineTokens.length) {
                const token = this.currentLineTokens[this.tokenCursor];
                this.tokenCursor++;
                if (this.tokenCursor === this.currentLineTokens.length) {
                    this.lineCursor++;
                    this.tokenCursor = 0;
                    this.currentLineTokens = [];
                    this.isLineTrimmedForAtom = false;
                    this.lineFullyProcessed = true;
                }
                return token;
            } else {
                this.lineCursor++;
                this.tokenCursor = 0;
                this.currentLineTokens = [];
                this.isLineTrimmedForAtom = false;
                this.lineFullyProcessed = true;
            }
        }
    }

    extractLineTokens() {
        if (!this._loadLineTokens(false)) {
            return undefined;
        }

        const tokensToReturn = [...this.currentLineTokens];
        
        this.lineCursor++;
        this.tokenCursor = 0;
        this.currentLineTokens = [];
        this.isLineTrimmedForAtom = false;
        this.lineFullyProcessed = true;

        return tokensToReturn;
    }
}

module.exports = InputProcessor;

function processInputSequence(sourceData) {
  const sequenceReader = new InputProcessor(sourceData, String);

  const inputBase = sequenceReader.extractAtom();

  const complementMap = new Map([
    ["A", "T"],
    ["C", "G"],
    ["G", "C"],
    ["T", "A"]
  ]);

  console.log(complementMap.get(inputBase));
}

processInputSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
