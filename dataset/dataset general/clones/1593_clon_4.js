document.addEventListener('DOMContentLoaded', () => {
  const characterSubstitutions = [
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&#39;'],
    ['/', '&#x2F;']
  ];

  const sanitizeText = (inputString) => {
    let processedString = String(inputString);
    for (const [char, entity] of characterSubstitutions) {
      processedString = processedString.replaceAll(char, entity);
    }
    return processedString;
  };

  document.body.addEventListener('click', (evnt) => {
    const targetElement = evnt.target;
    let clickedLink = null;

    let current = targetElement;
    while (current && current !== document.body) {
      if (current.matches && current.matches('#mailboxList .MailboxItemView a')) {
        clickedLink = current;
        break;
      }
      current = current.parentElement;
    }

    if (clickedLink) {
      const linkLocation = new URL(clickedLink.href);
      const urlParameters = new URLSearchParams(linkLocation.search);
      const pathComponents = linkLocation.pathname.split('/');

      let messageIdentifier = null;
      let userIdentifier = null;

      userIdentifier = urlParameters.get('u');

      if (pathComponents.length > 0) {
        const finalPathComponent = pathComponents[pathComponents.length - 1];
        const midExtractionPattern = /^[0-9a-z]+-([0-9a-z]+)$/;
        const midMatchResult = finalPathComponent.match(midExtractionPattern);
        if (midMatchResult) {
          messageIdentifier = midMatchResult[1];
        }
      }

      if (messageIdentifier && userIdentifier) {
        const remoteResourceURL = `https://www.fastmail.fm/rawmessage/${messageIdentifier}?u=${userIdentifier}`;

        fetch(remoteResourceURL)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP fetch failed with status: ${response.status}`);
            }
            return response.text();
          })
          .then(retrievedHtmlContent => {
            document.querySelectorAll('.mailmate-link').forEach(element => element.remove());

            const messageIdParsingPattern = /Message-ID: <(.*)>/i;
            const messageIdParsedResult = retrievedHtmlContent.match(messageIdParsingPattern);

            if (messageIdParsedResult) {
              const extractedId = messageIdParsedResult[1];
              const safeId = sanitizeText(extractedId);

              const destinationContainer = document.querySelector('.app-toolbar .left');
              if (destinationContainer) {
                const linkContainer = document.createElement('span');
                linkContainer.className = 'mailmate-link';
                linkContainer.innerHTML = '&nbsp;&nbsp;';

                const navigationAnchor = document.createElement('a');
                navigationAnchor.style.zIndex = '100000';
                navigationAnchor.href = `message://${safeId}`;
                navigationAnchor.textContent = 'MailMate';

                linkContainer.appendChild(navigationAnchor);
                destinationContainer.appendChild(linkContainer);
              }
            }
          })
          .catch(err => {
            console.error('Error during message retrieval:', err);
          });
      }
    }
  });
});