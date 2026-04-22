function processInputData() {
  const retrieveValue = () => nextInt();
  const retrieveSequence = () => nextIntArray();
  const deliverOutput = (data) => myout(data);
  const transformFormat = (collection, mode) => myconv(collection, mode);

  const itemCount = retrieveValue();
  const dataElements = retrieveSequence();

  const primaryGroup = dataElements.filter((_, position) => position % 2 === 0);
  const secondaryGroup = dataElements.filter((_, position) => position % 2 !== 0);

  const finalArrangement = (itemCount % 2 === 0)
    ? secondaryGroup.reverse().concat(primaryGroup)
    : primaryGroup.reverse().concat(secondaryGroup);

  deliverOutput(transformFormat(finalArrangement, 8));
}