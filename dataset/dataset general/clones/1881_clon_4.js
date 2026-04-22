window.chrome.runtime.sendMessage({ activity: 'pageInitiated' });

document.addEventListener('DOMContentLoaded', () => {
  const extractNumericPart = (sourceString) => {
    const digitPattern = /(\d+)/;
    const matchResult = sourceString.match(digitPattern);
    return matchResult ? matchResult[1] : null;
  };

  const decipherInteractionIntent = (eventObject) => {
    if (eventObject.altKey || (eventObject.shiftKey && eventObject.ctrlKey)) {
      return 'fullLink';
    } else if (eventObject.shiftKey) {
      return 'elementIdentifier';
    }
    return null;
  };

  const deliverEphemeralFeedback = (hostContainerQuery, feedbackContent, displayInterval = 1000, fadeInterval = 500) => {
    const hostElement = document.querySelector(hostContainerQuery);
    if (!hostElement) return;

    hostElement.style.display = 'block';
    hostElement.style.opacity = '1';
    hostElement.style.transition = `opacity ${fadeInterval}ms ease-out`;

    const feedbackUnit = document.createElement('article');
    feedbackUnit.id = 'temporary-info-display';
    feedbackUnit.style.color = '#000000';
    feedbackUnit.textContent = feedbackContent;

    hostElement.prepend(feedbackUnit);

    setTimeout(() => {
      hostElement.style.opacity = '0';
    }, displayInterval);

    setTimeout(() => {
      if (feedbackUnit.parentNode === hostElement) {
        feedbackUnit.remove();
      }
      hostElement.style.display = 'none';
      hostElement.style.opacity = '1';
    }, displayInterval + fadeInterval);
  };

  document.body.addEventListener('click', (interactionEvent) => {
    const clickedElement = interactionEvent.target.closest('.item');

    if (!clickedElement) {
      return;
    }

    interactionEvent.preventDefault();
    interactionEvent.stopPropagation();

    const actionType = decipherInteractionIntent(interactionEvent);

    if (!actionType) {
      return;
    }

    const elementIdentification = extractNumericPart(clickedElement.id);
    if (!elementIdentification) {
      return;
    }

    let messageToSend = '';
    let notificationText = '';

    if (actionType === 'fullLink') {
      const resourceLink = `https://www.pivotaltracker.com/story/show/${elementIdentification}`;
      notificationText = `Reference copied: ${resourceLink}`;
      messageToSend = resourceLink;
    } else if (actionType === 'elementIdentifier') {
      notificationText = `Identifier copied: ${elementIdentification}`;
      messageToSend = elementIdentification;
    }

    deliverEphemeralFeedback('#status', notificationText);

    window.chrome.runtime.sendMessage({ dataTransfer: messageToSend });
  });
});