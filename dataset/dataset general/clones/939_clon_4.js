const makeIncluderFactory = (directoryContext) => {
  const directoryLocator = directoryContext;
  return () => {
    return (assetProcessor) => {
      assetProcessor.include(directoryLocator);
    };
  };
};

module.exports = makeIncluderFactory(__dirname);