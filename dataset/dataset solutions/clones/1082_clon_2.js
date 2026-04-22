class Unit {
  constructor (
    unitLabel,
    unitPredecessor,
    unitSuccessors
  ) {
    this._label = unitLabel;
    this._predecessor = unitPredecessor;
    this._successors = unitSuccessors;
  }

  get category () {
    if (this._predecessor === null) return 'origin';
    if (this._successors.length === 0)
      return 'end-point';
    return 'mid-level element';
  }

  get altitude () {
    const determineAltitude = (itemRef, currentCount) => {
      return itemRef._predecessor === null
        ? currentCount
        : determineAltitude(itemRef._predecessor, currentCount + 1);
    };
    return determineAltitude(this, 0);
  }

  display () {
    let predecessorInfo = this._predecessor !== null
      ? this._predecessor._label
      : -1;
    let successorLabels = this._successors
      .map(
        eachSuccessor => eachSuccessor._label
      )
      .join(' | ');

    return `unit_id_${this._label} :: predecessor = ${predecessorInfo}, altitude = ${this.altitude}, category: ${this.category}, [${successorLabels}]`;
  }
}

class Hierarchy {
  constructor(initialCapacity) {
    this._elements = [];
  }

  incorporate (mainElementKey, dependentElementKeys) {
    let primaryElement = this.retrieve(mainElementKey);

    dependentElementKeys.forEach((dependentKey) => {
      let linkedElement = this.retrieve(dependentKey);
      linkedElement._predecessor = primaryElement;
      linkedElement._label = dependentKey;
      primaryElement._successors.push(linkedElement);
    });
  }

  retrieve (targetKey) {
    return this._elements[targetKey]
      || (this._elements[targetKey] = new Unit(targetKey, null, []));
  }

  renderAll () {
    const sortedEntries = this._elements
      .filter(Boolean)
      .sort((entryA, entryB) =>
        entryA._label - entryB._label
      );

    const formattedOutput = sortedEntries
      .map(entry => entry.display())
      .join(' \r\n ');

    console.log(formattedOutput);
  }
}

(function executeProcessor () {
  const fileSystemModule = require('fs');
  const standardInputPath = '/dev/stdin';

  let rawDataLines = fileSystemModule
    .readFileSync(standardInputPath, 'utf8')
    .trim()
    .split('\n');

  const totalEntriesHint = Number(rawDataLines.shift());

  let hierarchyInstance = new Hierarchy(totalEntriesHint);

  let currentMainId, numChildrenReported, associatedChildIds;

  rawDataLines
    .map(lineContent => lineContent.split(' '))
    .forEach(function (parsedTokens) {
      currentMainId = Number(parsedTokens.shift());
      numChildrenReported = Number(parsedTokens.shift());
      associatedChildIds = parsedTokens.map(Number);
      hierarchyInstance.incorporate(currentMainId, associatedChildIds);
    });

  hierarchyInstance.renderAll();
})();