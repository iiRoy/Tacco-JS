(function () {
  const makeProtoObject = (baseDefinition = {}, methodCollection = {}) => {
    return { ...baseDefinition, ...methodCollection };
  };

  const constructInstance = (definitionObject, instanceData = {}) => {
    const finalInstance = { ...definitionObject, ...instanceData };
    for (const propertyKey in finalInstance) {
      if (typeof finalInstance[propertyKey] === 'function') {
        finalInstance[propertyKey] = finalInstance[propertyKey].bind(finalInstance);
      }
    }
    return finalInstance;
  };

  const biologicalEntityBlueprint = makeProtoObject(
    {},
    {
      reportAttributes: function() {
        return `${this.designation} ${this.physicalSize} ${this.hue}`;
      }
    }
  );

  const spawnBiologicalEntity = (designation) => {
    return constructInstance(biologicalEntityBlueprint, {
      designation: designation,
      physicalSize: '',
      hue: ''
    });
  };

  const carnivorousMammalBlueprint = makeProtoObject(
    biologicalEntityBlueprint,
    {}
  );

  const spawnCarnivorousMammal = (designation, physicalSize) => {
    const baseState = spawnBiologicalEntity(designation);
    return constructInstance(carnivorousMammalBlueprint, {
      ...baseState,
      physicalSize: physicalSize,
      hue: 'Snow'
    });
  };

  const desertHunterBlueprint = makeProtoObject(
    carnivorousMammalBlueprint,
    {}
  );

  const spawnDesertHunter = (designation, physicalSize) => {
    const mammalState = spawnCarnivorousMammal(designation, physicalSize);
    return constructInstance(desertHunterBlueprint, {
      ...mammalState,
      hue: 'Crimson'
    });
  };

  return function () {
    const creatureOne = spawnCarnivorousMammal('Specter', '160cm');
    creatureOne.reportAttributes();

    const creatureTwo = spawnDesertHunter('Patchy', '60cm');
    creatureTwo.reportAttributes();
  };
}());