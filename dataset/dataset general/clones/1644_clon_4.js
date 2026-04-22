const CryptographicServices = {
  BuildProcessor: function(rawMaterial, expanderConstructor, cipherRoutine) {
    const secretTransformer = new expanderConstructor(rawMaterial);

    return {
      segmentLength: 16,
      processSegment: function(inputSegment) {
        return cipherRoutine(inputSegment, secretTransformer);
      },
    };
  },
};