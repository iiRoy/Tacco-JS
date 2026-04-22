class LevelLink {
  constructor(entryValue, topLevel) {
    this.entryValue = entryValue;
    this.nextPointers = new Array(topLevel + 1).fill(null);
  }
}

class TopLayerCollection {
  static maxLayer = 16;
  static promotionChance = 0.5;

  constructor(comparer) {
    this.comparer = comparer;
    this.sentinel = new LevelLink(null, TopLayerCollection.maxLayer);
    this.activeLayer = 0;
    this.contentSize = 0;
  }

  generateRandomLayer() {
    let currentLayer = 0;
    while (Math.random() < TopLayerCollection.promotionChance && currentLayer < TopLayerCollection.maxLayer) {
      currentLayer++;
    }
    return currentLayer;
  }

  putEntry(anEntry) {
    const updatePath = new Array(TopLayerCollection.maxLayer + 1).fill(null);
    let currentSpot = this.sentinel;

    for (let k = this.activeLayer; k >= 0; k--) {
      while (currentSpot.nextPointers[k] && this.comparer(currentSpot.nextPointers[k].entryValue, anEntry)) {
        currentSpot = currentSpot.nextPointers[k];
      }
      updatePath[k] = currentSpot;
    }

    const newLayer = this.generateRandomLayer();
    if (newLayer > this.activeLayer) {
      for (let k = this.activeLayer + 1; k <= newLayer; k++) {
        updatePath[k] = this.sentinel;
      }
      this.activeLayer = newLayer;
    }

    const newNode = new LevelLink(anEntry, newLayer);
    for (let k = 0; k <= newLayer; k++) {
      newNode.nextPointers[k] = updatePath[k].nextPointers[k];
      updatePath[k].nextPointers[k] = newNode;
    }
    this.contentSize++;
  }

  obtainGreatest() {
    if (this.contentSize === 0) {
      return undefined;
    }

    const nodeToRemove = this.sentinel.nextPointers[0];
    const extractedValue = nodeToRemove.entryValue;

    for (let k = 0; k <= this.activeLayer; k++) {
      if (this.sentinel.nextPointers[k] === nodeToRemove) {
        this.sentinel.nextPointers[k] = nodeToRemove.nextPointers[k];
      }
    }

    while (this.activeLayer > 0 && this.sentinel.nextPointers[this.activeLayer] === null) {
      this.activeLayer--;
    }

    this.contentSize--;
    return extractedValue;
  }

  isVoid() {
    return this.contentSize === 0;
  }
}

const primaryComparer = (valA, valB) => valA > valB;

const processData = (sourceText) => {
  const dataLines = sourceText.split('\n');
  const [datumCount] = dataLines[0].split(' ').map(Number);
  const rawValues = dataLines[1].split(' ').map(Number);

  const orderedValues = [...rawValues].sort((a, b) => b - a);

  let cumulativeSum = 0;
  const currentCollection = new TopLayerCollection(primaryComparer);

  const initialValue = orderedValues.shift();
  cumulativeSum += initialValue;
  currentCollection.putEntry(initialValue);

  for (let indexCounter = 1; indexCounter < datumCount; indexCounter++) {
    const nextValue = orderedValues.shift();
    const currentEntry = currentCollection.obtainGreatest();
    cumulativeSum += currentEntry;
    currentCollection.putEntry(nextValue);
    currentCollection.putEntry(nextValue);
  }

  console.log(cumulativeSum);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());