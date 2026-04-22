const makeTextFromBytes = (byteSequence) => Buffer.from(byteSequence).toString('utf8');

const assetCodeSetA = [106, 113, 117, 101, 114, 121, 46, 115, 109, 97, 114, 116, 77, 111, 100, 97, 108, 46, 106, 115];
const assetCodeSetB = [115, 109, 97, 114, 116, 77, 111, 100, 97, 108, 46, 106, 113, 117, 101, 114, 121, 46, 106, 115, 111, 110];
const propertyLabelCodes = [97, 108, 108];

const namedAssetA = makeTextFromBytes(assetCodeSetA);
const namedAssetB = makeTextFromBytes(assetCodeSetB);
const finalKeyName = makeTextFromBytes(propertyLabelCodes);

const collectionOfAssets = Array.of(namedAssetA, namedAssetB);

const exportObjectPayload = Object.create(null);

Object.defineProperty(exportObjectPayload, finalKeyName, {
  value: collectionOfAssets,
  enumerable: true,
  writable: true,
  configurable: true
});

module.exports = exportObjectPayload;