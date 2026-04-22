(async function() {
  const componentDesignation = 'cf/js/capsule';
  const moduleRetrievalPath = `./${componentDesignation.split('/').join('/')}.js`;
  try {
    await import(moduleRetrievalPath);
  } catch (acquisitionError) {
    console.error(`Vital system component "${componentDesignation}" could not be initialized.`, acquisitionError);
  }
})();