var standardOrdering = function(first, second) {
  return first < second;
};

function OrderlyCollection(orderingRoutine) {
  if (!(this instanceof OrderlyCollection)) return new OrderlyCollection(orderingRoutine);
  this.elements = [];
  this.itemCount = 0;
  this.comparisonFunction = orderingRoutine || standardOrdering;
}

OrderlyCollection.prototype.insertElement = function(elementValue) {
  let low = 0;
  let high = this.itemCount - 1;
  let insertionPoint = 0;

  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (this.comparisonFunction(elementValue, this.elements[mid])) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  insertionPoint = low;

  this.elements.splice(insertionPoint, 0, elementValue);
  this.itemCount++;
};

OrderlyCollection.prototype.retrieveTop = function() {
  if (this.itemCount === 0) return undefined;
  this.itemCount--;
  return this.elements.shift();
};

OrderlyCollection.prototype.examineTop = function() {
  if (this.itemCount === 0) return undefined;
  return this.elements[0];
};

OrderlyCollection.prototype.isVacant = function() {
  return this.itemCount === 0;
};

OrderlyCollection.prototype.duplicate = function() {
  var newCollection = new OrderlyCollection(this.comparisonFunction);
  newCollection.itemCount = this.itemCount;
  newCollection.elements = this.elements.slice();
  return newCollection;
};

OrderlyCollection.prototype.iterateElements = function(actionCallback) {
  if (this.isVacant() || typeof actionCallback !== 'function') return;
  for (let idx = 0; idx < this.itemCount; idx++) {
    actionCallback(this.elements[idx], idx);
  }
};

OrderlyCollection.prototype.fetchSmallestSubset = function(quantity) {
  if (this.itemCount === 0) return [];
  const actualQuantity = Math.min(this.itemCount, quantity);
  return this.elements.slice(0, actualQuantity);
};

OrderlyCollection.prototype._extractAtSpecificPosition = function(pos) {
  if (pos >= this.itemCount || pos < 0) return undefined;
  this.itemCount--;
  return this.elements.splice(pos, 1)[0];
};

OrderlyCollection.prototype.discardValue = function(val) {
  for (let i = 0; i < this.itemCount; i++) {
    if (!this.comparisonFunction(this.elements[i], val) && !this.comparisonFunction(val, this.elements[i])) {
      this._extractAtSpecificPosition(i);
      return true;
    }
  }
  return false;
};

OrderlyCollection.prototype._processRemovals = function(predicate, maxCount) {
  const removedItems = [];
  if (typeof predicate !== 'function' || this.isVacant()) return removedItems;

  let currentIdx = 0;
  let removedCount = 0;
  while (currentIdx < this.itemCount && (maxCount === undefined || removedCount < maxCount)) {
    if (predicate(this.elements[currentIdx])) {
      removedItems.push(this._extractAtSpecificPosition(currentIdx));
      removedCount++;
    } else {
      currentIdx++;
    }
  }
  return removedItems;
};

OrderlyCollection.prototype.discardSingleMatch = function(predicate) {
  const result = this._processRemovals(predicate, 1);
  return result.length > 0 ? result[0] : undefined;
};

OrderlyCollection.prototype.discardMultipleMatches = function(predicate, maxCount) {
  return this._processRemovals(predicate, maxCount);
};

OrderlyCollection.prototype.swapTop = function(newValue) {
  if (this.itemCount === 0) return undefined;
  const oldTop = this.retrieveTop();
  this.insertElement(newValue);
  return oldTop;
};

OrderlyCollection.prototype.compactStorage = function() {
  this.elements.length = this.itemCount;
};

OrderlyCollection.prototype.reorganizeIntoSorted = function(sourceArray) {
  this.elements = sourceArray.slice();
  this.elements.sort((first, second) => {
    if (this.comparisonFunction(first, second)) return -1;
    if (this.comparisonFunction(second, first)) return 1;
    return 0;
  });
  this.itemCount = this.elements.length;
};