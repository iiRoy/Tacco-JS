var smartCache = function() {
  var inputValues = [];
  for (var index = 0; index < functionArguments.length; index++) {
    inputValues.push(functionArguments[index]);
  }
  var cacheHitIndex = smartCache.prototype.retrieveEntry(this, inputValues);
  if (cacheHitIndex !== -1) {
    return smartCache.prototype.dataStore[cacheHitIndex].calculationOutput;
  }
  var calculationOutput = this.apply(this, inputValues);
  smartCache.prototype.dataStore.push({
    targetFn : this,
    inputSeq : inputValues,
    calculationOutput : calculationOutput
  });
  return calculationOutput;
};

smartCache.prototype = {
  dataStore : [],
  compareSequences : function(seq1, seq2) {
    if (seq1.length === seq2.length) {
      for (var index = 0; index < seq1.length; index++) {
        if (seq1[index] !== seq2[index]) {
          return false;
        }
      }
    } else {
      return false;
    }
    return true;
  },
  retrieveEntry : function(targetFn, inputSeq) {
    for (var index = 0; index < smartCache.prototype.dataStore.length; index++) {
      if (smartCache.prototype.dataStore[index].targetFn === targetFn && smartCache.prototype.compareSequences(smartCache.prototype.dataStore[index].inputSeq, inputSeq)) {
        return index;
      }
    }
    return -1;
  }
};

Function.constructor.prototype.smartCacheExtension = smartCache;