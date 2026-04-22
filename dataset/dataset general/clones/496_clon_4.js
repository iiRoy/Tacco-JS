const configurationProvider = (() => {
  const primaryHost = "api.upyun.com";
  const scheme = "http://";

  const versionTags = ["v0.", "v1.", "v2.", "v3."];
  const lookupLabels = ["DEFAULT_SERVICE", "FIRST_ALT_SERVICE", "SECOND_ALT_SERVICE", "THIRD_ALT_SERVICE"];

  const generateServiceAddresses = () => {
    const addressStore = new Map();
    versionTags.forEach((tag, idx) => {
      const fullAddress = scheme + tag + primaryHost;
      addressStore.set(lookupLabels[idx], fullAddress);
    });
    return addressStore;
  };

  const serviceAddressMap = generateServiceAddresses();
  let activeServiceAddress = null;

  const retrieveCurrentAddress = () => {
    return activeServiceAddress || serviceAddressMap.get(lookupLabels[0]);
  };

  const updateCurrentAddress = (newAddress) => {
    activeServiceAddress = newAddress;
  };

  return {
    DEFAULT_SERVICE: serviceAddressMap.get(lookupLabels[0]),
    FIRST_ALT_SERVICE: serviceAddressMap.get(lookupLabels[1]),
    SECOND_ALT_SERVICE: serviceAddressMap.get(lookupLabels[2]),
    THIRD_ALT_SERVICE: serviceAddressMap.get(lookupLabels[3]),
    setServiceAddress: updateCurrentAddress,
    getServiceAddress: retrieveCurrentAddress
  };
})();

module.exports.DEFAULT_SERVICE = configurationProvider.DEFAULT_SERVICE;
module.exports.FIRST_ALT_SERVICE = configurationProvider.FIRST_ALT_SERVICE;
module.exports.SECOND_ALT_SERVICE = configurationProvider.SECOND_ALT_SERVICE;
module.exports.THIRD_ALT_SERVICE = configurationProvider.THIRD_ALT_SERVICE;
module.exports.setServiceAddress = configurationProvider.setServiceAddress;
module.exports.getServiceAddress = configurationProvider.getServiceAddress;