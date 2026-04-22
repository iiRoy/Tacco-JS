(function() {
  const contentRootSelector = '.content-root';
  let processingInitiated = false;

  const performAllDocumentAdjustments = function() {
    if (processingInitiated || !document.querySelector(contentRootSelector)) {
      return;
    }
    processingInitiated = true;

    processDocumentHeaders();
    adjustElementIdentifiers();
    encloseStructuralComponents();
    encapsulateMediaFrames();
    fetchConfigurationData();
  };

  const contentPresenceObserver = new MutationObserver((mutationRecords, observerInstance) => {
    for (const record of mutationRecords) {
      if (record.type === 'childList' && document.querySelector(contentRootSelector)) {
        observerInstance.disconnect();
        performAllDocumentAdjustments();
        break;
      }
    }
  });

  contentPresenceObserver.observe(document.body, { childList: true, subtree: true });

  const startFlatdocRenderer = function() {
    if (typeof Flatdoc !== 'undefined' && Flatdoc.run) {
      Flatdoc.run({
        fetcher: Flatdoc.file('index.md')
      });
    } else {
      console.warn('Flatdoc library is unavailable; content rendering may not occur.');
    }
  };

  startFlatdocRenderer();

  function processDocumentHeaders() {
    const mainAttributeKey = 'id';
    const h1DefaultReplaceValue = 'root';
    const h2PrefixMarker = '-';
    const linkReferenceAttribute = 'href';

    Array.from(document.querySelectorAll('h1')).forEach(currentHeaderElement => {
      if (currentHeaderElement.textContent.trim().length === 0) {
        const imageSourceElement = currentHeaderElement.querySelector('img');
        if (!imageSourceElement) return;

        const imageDescriptionText = imageSourceElement.alt;
        const normalizedSectionId = Flatdoc.slugify(imageDescriptionText);

        const primaryListItem = document.querySelector('li[id="root-item"].level-1');
        const primaryListContainer = primaryListItem ? primaryListItem.querySelector('ul[id="root-list"].level-2') : null;

        if (primaryListItem) {
          const originalId = primaryListItem.getAttribute(mainAttributeKey) || '';
          primaryListItem.setAttribute(mainAttributeKey, originalId.replace(h1DefaultReplaceValue, normalizedSectionId));
        }
        if (primaryListContainer) {
          const originalId = primaryListContainer.getAttribute(mainAttributeKey) || '';
          primaryListContainer.setAttribute(mainAttributeKey, originalId.replace(h1DefaultReplaceValue, normalizedSectionId));
        }

        const navigationLinkHtml = `<a id="${normalizedSectionId}-link" class="level-1" href="#${normalizedSectionId}">${imageDescriptionText}</a>`;
        if (primaryListItem) {
          primaryListItem.insertAdjacentHTML('afterbegin', navigationLinkHtml);
        }

        currentHeaderElement.setAttribute(mainAttributeKey, normalizedSectionId);
      }
    });

    Array.from(document.querySelectorAll('h2')).forEach(currentHeaderElement => {
      if (currentHeaderElement.textContent.trim().length === 0) {
        const imageSourceElement = currentHeaderElement.querySelector('img');
        if (!imageSourceElement) return;

        const imageDescriptionText = imageSourceElement.alt;
        const normalizedSectionId = Flatdoc.slugify(imageDescriptionText);

        const secondaryListItem = document.querySelector(`li[id="${h2PrefixMarker}-item"].level-2`);

        if (secondaryListItem) {
          const originalId = secondaryListItem.getAttribute(mainAttributeKey) || '';
          secondaryListItem.setAttribute(mainAttributeKey, originalId.replace(h2PrefixMarker, (h2PrefixMarker + normalizedSectionId)));

          Array.from(secondaryListItem.querySelectorAll('*')).forEach(childNode => {
            const childNodeId = childNode.getAttribute(mainAttributeKey);
            if (childNodeId) {
              childNode.setAttribute(mainAttributeKey, childNodeId.replace(h2PrefixMarker, (h2PrefixMarker + normalizedSectionId)));
            }

            if (childNode.hasAttribute(linkReferenceAttribute)) {
              const currentLinkValue = childNode.getAttribute(linkReferenceAttribute);
              if (currentLinkValue) {
                childNode.setAttribute(linkReferenceAttribute, currentLinkValue.replace(h2PrefixMarker, (h2PrefixMarker + normalizedSectionId)));

                Array.from(document.querySelectorAll(`[${mainAttributeKey}*="${h2PrefixMarker}${h2PrefixMarker}"]`)).forEach(targetNode => {
                  const targetNodeId = targetNode.getAttribute(mainAttributeKey);
                  if (targetNodeId) {
                    targetNode.setAttribute(mainAttributeKey, targetNodeId.replace(h2PrefixMarker, (h2PrefixMarker + normalizedSectionId)));
                  }
                });
              }
            }
          });

          const secondaryLinkHtml = `<a id="${h2PrefixMarker}${normalizedSectionId}-link" class="level-2" href="#${h2PrefixMarker}${normalizedSectionId}">${imageDescriptionText}</a>`;
          secondaryListItem.insertAdjacentHTML('afterbegin', secondaryLinkHtml);
        }

        currentHeaderElement.setAttribute(mainAttributeKey, (h2PrefixMarker + normalizedSectionId));
      }
    });
  }

  function adjustElementIdentifiers() {
    const identifierKey = 'id';
    let currentBlockSlug = '';
    const hyperlinkReference = 'href';

    Array.from(document.querySelectorAll('#root-list ul, #root-list li, #root-list a')).forEach(itemElement => {
      const elementId = itemElement.getAttribute(identifierKey);
      if (!elementId) return;

      if (elementId.substring(0, 1) !== '-') {
        currentBlockSlug = elementId.slice(0, -5);
      } else {
        itemElement.setAttribute(identifierKey, (currentBlockSlug + elementId));

        if (itemElement.hasAttribute(hyperlinkReference)) {
          const linkPath = itemElement.getAttribute(hyperlinkReference);
          if (linkPath) {
            itemElement.setAttribute(hyperlinkReference, linkPath.replace('#', ('#' + currentBlockSlug)));
          }
        }
      }
    });
  }

  function encloseStructuralComponents() {
    let activeH1SectionId = '';
    const elementIdentifierAttribute = 'id';

    Array.from(document.querySelectorAll('.content h1, .content h2, .content h3')).forEach(headingNode => {
      if (headingNode.tagName === 'H1') {
        activeH1SectionId = headingNode.getAttribute(elementIdentifierAttribute) || '';
      } else if (headingNode.tagName === 'H2') {
        const nodesToGroup = [];
        let subsequentNode = headingNode;
        while (subsequentNode && subsequentNode.tagName !== 'H1' && subsequentNode.tagName !== 'H2') {
          nodesToGroup.push(subsequentNode);
          subsequentNode = subsequentNode.nextElementSibling;
        }
        nodesToGroup.unshift(headingNode);

        if (nodesToGroup.length > 0) {
          const groupingDiv = document.createElement('div');
          const originalH2Id = headingNode.getAttribute(elementIdentifierAttribute) || '';
          groupingDiv.setAttribute(elementIdentifierAttribute, originalH2Id.substring(1));

          nodesToGroup[0].parentNode.insertBefore(groupingDiv, nodesToGroup[0]);

          nodesToGroup.forEach(node => groupingDiv.appendChild(node));
        }
        headingNode.setAttribute(elementIdentifierAttribute, (activeH1SectionId + (headingNode.getAttribute(elementIdentifierAttribute) || '')));
      } else if (headingNode.tagName === 'H3') {
        headingNode.setAttribute(elementIdentifierAttribute, (activeH1SectionId + (headingNode.getAttribute(elementIdentifierAttribute) || '')));
      }
    });
  }

  function encapsulateMediaFrames() {
    Array.from(document.querySelectorAll('iframe')).forEach(mediaFrame => {
      const wrapperContainer = document.createElement('div');
      wrapperContainer.className = 'iframe-container';
      mediaFrame.parentNode.insertBefore(wrapperContainer, mediaFrame);
      wrapperContainer.appendChild(mediaFrame);
    });
  }

  function fetchConfigurationData() {
    fetch('config.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        return response.json();
      })
      .then(retrievedConfig => {
        establishPageMetadataAndNavigation(
          retrievedConfig['title'],
          retrievedConfig['largeLinks'],
          retrievedConfig['projectLinks']
        );
        applyStylingFrameworkClasses(retrievedConfig['layout']);

        const analyticsCode = retrievedConfig['googleAnalytics'];
        if (analyticsCode && analyticsCode.length > 0) {
          const scriptContent = `
            var _gaq=[["_setAccount",'${analyticsCode}'] ,["_trackPageview"]];
            (function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
              g.src=("https:"==location.protocol?"//ssl":"//www")+".google-analytics.com/ga.js";
              s.parentNode.insertBefore(g,s)}(document,"script"));
          `;
          const analyticsScript = document.createElement('script');
          analyticsScript.textContent = scriptContent;
          document.head.appendChild(analyticsScript);
        }
      })
      .catch(fetchError => {
        console.error('Failed to retrieve or process configuration:', fetchError);
      });
  }

  function establishPageMetadataAndNavigation(pageHeadline, primaryNavLinks, secondaryNavLinks) {
    if (pageHeadline) {
      document.title = pageHeadline;
    }

    const hasPrimary = primaryNavLinks && Object.keys(primaryNavLinks).length > 0;
    const hasSecondary = secondaryNavLinks && Object.keys(secondaryNavLinks).length > 0;

    if (!hasPrimary && !hasSecondary) {
      return;
    }

    const mainContentContainer = document.querySelector(contentRootSelector);
    if (!mainContentContainer) return;

    const headerStructure = `
      <div class="header">
        <div class="left">
          <ul></ul>
        </div>
      </div>
    `;
    mainContentContainer.insertAdjacentHTML('beforebegin', headerStructure);

    const targetNavigationList = document.querySelector('.header .left ul');
    if (!targetNavigationList) return;

    if (hasPrimary) {
      Object.values(primaryNavLinks).forEach(linkInfo => {
        targetNavigationList.insertAdjacentHTML('beforeend', `<li><a href="${linkInfo['link']}"><h1>${linkInfo['name']}</h1></a></li>`);
      });
    }

    if (hasSecondary) {
      Object.values(secondaryNavLinks).forEach(linkInfo => {
        targetNavigationList.insertAdjacentHTML('beforeend', `<li><a href="${linkInfo['link']}">${linkInfo['name']}</a></li>`);
      });
    }
  }

  function applyStylingFrameworkClasses(layoutConfig) {
    const identifierAttribute = 'id';

    document.querySelector('.header')?.classList.add('navbar', 'navbar-default', 'navbar-static-top');
    document.querySelector(contentRootSelector)?.classList.add('container-fluid');
    document.querySelector('.menubar')?.classList.add('col-sm-3', 'col-md-3', 'sidebar');
    document.querySelector('.menubar ul')?.classList.add('nav', 'nav-sidebar');
    document.querySelector('.content')?.classList.add('col-sm-9', 'col-md-9', 'main');
    document.querySelector('.content h1')?.classList.add('col-md-12');

    const widthClassLookup = new Map([
      ['40%_Width', 'col-md-4'],
      ['50%_Width', 'col-md-6'],
    ]);

    Array.from(document.querySelectorAll('.content div')).forEach(contentBlock => {
      const blockIdentifier = contentBlock.getAttribute(identifierAttribute);
      if (blockIdentifier) {
        let classAssigned = false;
        for (const [configKey, className] of widthClassLookup.entries()) {
          if (layoutConfig[configKey] && layoutConfig[configKey].some(val => blockIdentifier.includes(val))) {
            contentBlock.classList.add(className);
            classAssigned = true;
            break;
          }
        }
        if (!classAssigned) {
          contentBlock.classList.add('col-md-12');
        }
      }
    });

    const sixtyPercentConfigItems = layoutConfig['60%_Width'];
    if (sixtyPercentConfigItems && sixtyPercentConfigItems.length > 0) {
      const startingElementId = sixtyPercentConfigItems[0];
      const startingNode = document.getElementById(startingElementId);

      if (startingNode) {
        const nodesForGrouping = [];
        let currentNode = startingNode;
        // Collect siblings including startingNode until a .col-md-12 is encountered or no more siblings
        while (currentNode && (!currentNode.classList.contains('col-md-12') || currentNode === startingNode)) {
          nodesForGrouping.push(currentNode);
          currentNode = currentNode.nextElementSibling;
          if (nodesForGrouping.length > 10000) break; // Safety break for potential infinite loops
        }

        if (nodesForGrouping.length > 0) {
          const groupContainer = document.createElement('div');
          groupContainer.classList.add('col-md-8');

          nodesForGrouping[0].parentNode.insertBefore(groupContainer, nodesForGrouping[0]);
          nodesForGrouping.forEach(node => groupContainer.appendChild(node));
        }
      }
    }
  }
})();