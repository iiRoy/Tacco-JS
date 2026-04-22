var ParcelVault = function (options) {
  'use strict';
  
  var _encodeData = function (inputString) { return inputString; },
      _decodeData = function (inputString) { return inputString; },
      _vaultKey = 'ParcelVaultData',
      _retrieveVaultData = function() {
        var vaultContents = {};
        if (localStorage.getItem(_vaultKey) !== null) {
          vaultContents = JSON.parse(_decodeData(localStorage.getItem(_vaultKey)));
        }
        return vaultContents;
      };
  
  if ( typeof (options) !== 'undefined' ) {
    if ( typeof (options['storageIdentifier']) !== 'undefined' ) {
      _vaultKey = options['storageIdentifier'];
    }

    if ( typeof (options['encoder']) === 'function' ) {
      _encodeData = options['encoder'];
    }

    if ( typeof (options['decoder']) === 'function' ) {
      _decodeData = options['decoder'];
    }
  }

  this.placeItem = function (itemKey, itemValue) {
    var vaultContents = _retrieveVaultData();
    vaultContents[itemKey] = itemValue;
    return localStorage.setItem(_vaultKey, _encodeData(JSON.stringify(vaultContents)));
  };

  this.fetchItem = function (itemKey) {
    var vaultContents = _retrieveVaultData();
    return typeof (vaultContents[itemKey]) === 'undefined' ? null : vaultContents[itemKey];
  };

  this.eraseItem = function (itemKey) {
    var vaultContents = _retrieveVaultData();
    delete vaultContents[itemKey];
    return localStorage.setItem(_vaultKey, _encodeData(JSON.stringify(vaultContents)));
  };
  
  this.emptyVault = function () {
    return localStorage.removeItem(_vaultKey);
  };
  
  this.countItems = function () {
    var vaultContents = _retrieveVaultData(),
        itemCount = 0;
    for (var entryIdentifier in vaultContents) {
      if (vaultContents.hasOwnProperty(entryIdentifier)) {
        itemCount += 1;
      }
    }
    return itemCount;
  };
  
  this.getKeyAtIndex = function (index) {
    var vaultContents = _retrieveVaultData(),
        itemCount = 0;
    for (var entryIdentifier in vaultContents) {
      if (vaultContents.hasOwnProperty(entryIdentifier)) {
        if (itemCount === index) {
          return entryIdentifier;
        }
        itemCount += 1;
      }
    }
    return null;
  };
};

if ( typeof(module) !== 'undefined' ) {
  module.exports = ParcelVault;
}