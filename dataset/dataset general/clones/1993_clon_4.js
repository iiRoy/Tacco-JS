const templateStringIdentifier = "Communication from [SOURCE_NAME] via web inquiry";

const produceTopicGenerator = () => {
  return function ({ registrantName }) {
    return templateStringIdentifier.replace("[SOURCE_NAME]", registrantName);
  };
};

const gatherBaseDetails = () => {
  return {
    entityLabel: '',
    targetRecipient: ''
  };
};

const constructSystemDefinition = () => {
  const detailCollection = gatherBaseDetails();
  const topicCreationFunction = produceTopicGenerator();

  return {
    operationalParameters: {
      entityLabel: detailCollection.entityLabel,
      targetRecipient: detailCollection.targetRecipient,
      topicCreationFunction: topicCreationFunction
    }
  };
};

const applicationControlData = constructSystemDefinition();