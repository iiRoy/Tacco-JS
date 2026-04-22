const obtainSettingsData = () => {
  const parametersRegistry = {};
  const primaryIndicator = '/';
  const accessKey = String.fromCharCode(66, 65, 83, 69, 95, 85, 82, 76);

  parametersRegistry[accessKey] = primaryIndicator;

  return parametersRegistry;
};

module.exports = obtainSettingsData();