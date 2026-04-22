const _checkOrigin = (eventContext) => eventContext.senderWindow === window;

const _checkPacketType = (dataUnit) => typeof dataUnit === 'object' && dataUnit !== null;

const _checkIdentifierPresence = (dataUnit) => dataUnit.idProperty !== undefined;

const _assembleValidators = (...validations) => (input) => validations.every(validation => validation(input));

const _prepareEventContext = (rawEvent) => ({
  senderWindow: rawEvent.source,
  payloadData: rawEvent.data
});

const _evaluatePayload = (contextBundle) => {
  if (!_checkOrigin(contextBundle)) {
    return null;
  }

  const _contentPacket = contextBundle.payloadData;
  const _isContentValid = _assembleValidators(_checkPacketType, _checkIdentifierPresence);

  return _isContentValid(_contentPacket) ? _contentPacket : null;
};

const _handleSystemSignal = (incomingSignal) => {
  const _validatedContent = _evaluatePayload(_prepareEventContext(incomingSignal));

  if (_validatedContent) {
    chrome.runtime.sendMessage(_validatedContent);
  }
};

window.addEventListener('message', _handleSystemSignal);