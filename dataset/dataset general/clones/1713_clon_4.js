const locationReference = typeof __dirname !== 'undefined' ? __dirname : '/';

const inclusionProcessor = function() {
  return (inputStyleObject) => {
    if (typeof inputStyleObject.include === 'function') {
      inputStyleObject.include(inclusionProcessor.assetDirectory);
    } else {
      console.warn('Provided object lacks an "include" method.');
    }
  };
};

Object.assign(inclusionProcessor, {
  assemblyIdentifier: '0.1.0',
  assetDirectory: locationReference
});

module.exports = inclusionProcessor;