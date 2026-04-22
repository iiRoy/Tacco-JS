(function() {
  "use strict";

  class PageNavigator {
    #blockAmount;
    #activeBlock;
    #totalBlocks;

    constructor(assignedBlockAmount) {
      this.#blockAmount = assignedBlockAmount === undefined ? 5 : assignedBlockAmount;
      this.#activeBlock = 0;
      this.#totalBlocks = 1;
    }

    getCurrentBlock() {
      return this.#activeBlock;
    }

    getBlockSize() {
      return this.#blockAmount;
    }

    setTotalBlocks(count) {
        if (typeof count === 'number' && count >= 1) {
            this.#totalBlocks = count;
            if (this.#activeBlock >= this.#totalBlocks) {
                this.#activeBlock = this.#totalBlocks - 1;
            }
        }
    }

    getTotalBlockCount() {
        return this.#totalBlocks;
    }

    movePrevious() {
      if (this.#activeBlock > 0) {
        this.#activeBlock--;
      }
    }

    moveNext() {
      if (this.#activeBlock < this.#totalBlocks - 1) {
        this.#activeBlock++;
      }
    }

    jumpToBlock(blockIdentifier) {
      if (blockIdentifier >= 0 && blockIdentifier <= this.#totalBlocks - 1) {
        this.#activeBlock = blockIdentifier;
      }
    }
  }

  const BlockControllerFactory = (itemsPerBlock) => {
      return new PageNavigator(itemsPerBlock);
  };

  const dataSubsegment = (sourceArray, initialPosition) => {
    if (sourceArray === undefined) {
      return sourceArray;
    }
    const startIdx = Number(initialPosition);
    if (sourceArray === null || !Array.isArray(sourceArray)) {
        throw new TypeError("Cannot slice non-array 'sourceArray'");
    }
    return sourceArray.filter((_, index) => index >= startIdx);
  };

  const sequenceGenerator = (initialCollection, limitValue) => {
    const finalCount = parseInt(limitValue, 10);
    if (isNaN(finalCount) || finalCount < 0) {
        return initialCollection;
    }

    const generatedSequence = Array.from({ length: finalCount }, (_, idx) => idx);

    if (initialCollection === undefined || initialCollection === null) {
        throw new TypeError("Cannot append to non-object 'initialCollection'");
    } else if (!Array.isArray(initialCollection)) {
        throw new TypeError("initialCollection.push is not a function");
    } else {
        return [...initialCollection, ...generatedSequence];
    }
  };

})();