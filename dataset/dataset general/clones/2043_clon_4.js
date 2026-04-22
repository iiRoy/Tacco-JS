function createConfigurationAccessor(sourceFieldDefinitions, triggerCacheInvalidation) {
  let currentConfigurationState = {
    rowElements: {},
    columnElements: {},
    summaryElements: {}
  };

  const resolveFieldReference = (inputField) => {
    if (typeof inputField === 'string') {
      return sourceFieldDefinitions[inputField];
    }
    return inputField;
  };

  const addSingleConfigItem = (categoryIdentifier, fieldContent) => {
    const resolvedField = resolveFieldReference(fieldContent);
    if (resolvedField && resolvedField.name) {
      triggerCacheInvalidation();
      currentConfigurationState[categoryIdentifier][resolvedField.name] = resolvedField;
    }
  };

  const setCategoryConfigItems = (categoryIdentifier, fieldCollection) => {
    currentConfigurationState[categoryIdentifier] = {};
    triggerCacheInvalidation();

    fieldCollection.forEach(item => {
      addSingleConfigItem(categoryIdentifier, item);
    });
  };

  return function getSettingsInterface() {
    return {
      retrieveFullConfiguration: () => currentConfigurationState,
      accessRowConfig: () => ({
        update: (list) => setCategoryConfigItems('rowElements', list),
        fetch: currentConfigurationState.rowElements
      }),
      accessColumnConfig: () => ({
        update: (list) => setCategoryConfigItems('columnElements', list),
        fetch: currentConfigurationState.columnElements
      }),
      accessSummaryConfig: () => ({
        update: (list) => setCategoryConfigItems('summaryElements', list),
        fetch: currentConfigurationState.summaryElements
      })
    };
  };
}