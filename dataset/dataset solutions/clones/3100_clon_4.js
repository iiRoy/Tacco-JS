const dependencyVault = {
  fileAccess: (sourcePath) => {
    const nodeFileSystem = require('fs');
    return nodeFileSystem.readFileSync(sourcePath, 'utf8');
  }
};

const nucleotideSequenceProcessor = (rawContent) => {
  const primaryToken = rawContent.trim().split(/\s+/g)[0];

  // This condition replicates the original's loop boundary bug:
  // The outer loop `i < r - 1` means it won't run if r is 0 or 1.
  // Thus, inputs like "A" or "X" or "" result in 0.
  if (!primaryToken || primaryToken.length <= 1) {
    return 0;
  }

  // Strategy: Replace all non-nucleotide characters with a delimiter,
  // then split the string by this delimiter to get potential DNA segments.
  // Finally, find the maximum length among these segments.
  const segmentCollection = primaryToken.replace(/[^ACGT]/g, '_').split('_');

  let longestStretch = 0;
  for (const seg of segmentCollection) {
    if (seg.length > longestStretch) {
      longestStretch = seg.length;
    }
  }

  return longestStretch;
};

const entryPoint = () => {
  const dataStream = dependencyVault.fileAccess("/dev/stdin");
  const computedResult = nucleotideSequenceProcessor(dataStream);
  console.log(computedResult);
};

entryPoint();