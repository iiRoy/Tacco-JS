const DNA_COMPONENT_ENCODINGS = {
  'A': 17,
  'C': 23,
  'G': 29,
  'T': 31,
};

function deriveSequenceTag(molecularString) {
  let currentTag = 2166136261;
  const FNV_PRIME = 16777619;

  for (let idx = 0; idx < molecularString.length; idx++) {
    const componentValue = DNA_COMPONENT_ENCODINGS[molecularString[idx]];
    currentTag ^= componentValue;
    currentTag = Math.imul(currentTag, FNV_PRIME);
  }
  return currentTag >>> 0;
}

function buildGenomicSequenceIndex(maximumCapacity) {
  const buckets = new Array(maximumCapacity).fill(null).map(() => []);

  const fetchBucketIdentifier = (identifierValue) => identifierValue % maximumCapacity;

  return {
    storeElement: function(molecularString) {
      const tag = deriveSequenceTag(molecularString);
      const bucketIdx = fetchBucketIdentifier(tag);

      const targetBucket = buckets[bucketIdx];

      for (let k = 0; k < targetBucket.length; k++) {
        if (targetBucket[k] === molecularString) {
          return 1;
        }
      }

      targetBucket.push(molecularString);
      return 0;
    },

    locateElement: function(molecularString) {
      const tag = deriveSequenceTag(molecularString);
      const bucketIdx = fetchBucketIdentifier(tag);

      const targetBucket = buckets[bucketIdx];

      for (let k = 0; k < targetBucket.length; k++) {
        if (targetBucket[k] === molecularString) {
          return 1;
        }
      }

      return 0;
    }
  };
}

(function executeOperations() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
  const processedInstructions = inputLines.slice(1).map(entry => {
    const parts = entry.split(' ');
    return [parts[0][0], parts[1]];
  });

  let sequenceStore = buildGenomicSequenceIndex(1046527);

  processedInstructions.forEach(instruction => {
    if (instruction[0] === 'i') {
      sequenceStore.storeElement(instruction[1]);
    } else {
      console.log(sequenceStore.locateElement(instruction[1]) ? 'yes' : 'no');
    }
  });
})();