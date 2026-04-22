document.addEventListener('DOMContentLoaded', () => {

  const supportsFragUpdate = 'onhashchange' in window;

  const lexiconData = new Map([
    ['comment', 'Comment'],
    ['statement', 'Statement'],
    ['rule-set', 'Rule-set'],
    ['at-rule', 'At-rule'],
    ['media-query', 'Media query'],
    ['media-query-list', 'Media query list'],
    ['media-type', 'Media type'],
    ['expression', 'Expression'],
    ['media-feature', 'Media feature'],
    ['block', 'Block'],
    ['declaration-block', 'Declaration block'],
    ['selector', 'Selector'],
    ['simple-selector', 'Simple selector'],
    ['type-selector', 'Type selector'],
    ['universal-selector', 'Universal selector'],
    ['id-selector', 'ID selector'],
    ['class-selector', 'Class selector'],
    ['attribute-selector', 'Attribute selector'],
    ['pseudo-class', 'Pseudo-class'],
    ['pseudo-element', 'Pseudo-element'],
    ['combinator', 'Combinator'],
    ['descendant-combinator', 'Descendant combinator'],
    ['child-combinator', 'Child combinator'],
    ['adjacent-sibling-combinator', 'Adjacent sibling combinator'],
    ['general-sibling-combinator', 'General sibling combinator'],
    ['declaration', 'Declaration'],
    ['property', 'Property'],
    ['value', 'Value'],
    ['function', 'Function'],
    ['keyword', 'Keyword'],
    ['string', 'String'],
    ['url', 'URL'],
    ['number', 'Number'],
    ['percentage', 'Percentage'],
    ['length', 'Length'],
    ['unit', 'Unit'],
    ['color', 'Color'],
    ['vendor-prefix', 'Vendor prefix'],
  ]);

  function constructLexiconDisplay(dataMap) {
    const listContainer = document.querySelector('.vocabList');
    if (!listContainer) return;

    const fragment = document.createDocumentFragment();

    for (const [unitName, label] of dataMap.entries()) {
      const listItem = document.createElement('li');
      listItem.classList.add(unitName);
      const linkElement = document.createElement('a');
      linkElement.href = '#' + unitName;
      linkElement.textContent = label;
      listItem.appendChild(linkElement);
      fragment.appendChild(listItem);
    }
    listContainer.appendChild(fragment);
  }
  constructLexiconDisplay(lexiconData);

  function deriveElementQueries(dataMap) {
    const queryParts = Array.from(dataMap.keys());
    return '.' + queryParts.join(', .');
  }
  const globalElementQuery = deriveElementQueries(lexiconData);

  function extractUnitIdentifiers(targetElement) {
    const currentClasses = Array.from(targetElement.classList);
    const filteredClasses = currentClasses.filter(cls =>
      cls !== 'hover' && cls !== 'hilite' && cls !== 'selected'
    );
    return filteredClasses;
  }

  function emphasizeUnits(unitIdentifiers) {
    document.querySelectorAll('.hilite').forEach(el => el.classList.remove('hilite'));

    if (unitIdentifiers.length === 0) return;

    const stylePaneQuery = '.css .' + unitIdentifiers.join('.');
    const lexiconPaneQuery = '.vocabList .' + unitIdentifiers.join(', .vocabList .');

    document.querySelectorAll(stylePaneQuery).forEach(el => el.classList.add('hilite'));
    document.querySelectorAll(lexiconPaneQuery).forEach(el => el.classList.add('hilite'));
  }

  function processFragment() {
    const currentFragment = window.location.hash;
    let unitIdentifiers = [];
    if (currentFragment) {
      unitIdentifiers = currentFragment.substring(1).split('+');
    }
    emphasizeUnits(unitIdentifiers);
  }
  processFragment();

  window.addEventListener('hashchange', processFragment);

  function handleElementInteraction(event) {
    let matchedElement = event.target.closest(globalElementQuery);
    if (!matchedElement) return;

    event.stopPropagation();

    const parentContainer = matchedElement.closest('.content, .sidebar');
    if (parentContainer) {
      parentContainer.classList.add('focus');
      Array.from(parentContainer.parentNode.children).forEach(sibling => {
        if (sibling !== parentContainer && (sibling.matches('.content') || sibling.matches('.sidebar'))) {
          sibling.classList.remove('focus');
        }
      });
    }

    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    matchedElement.classList.add('selected');

    const unitIdentifiers = extractUnitIdentifiers(matchedElement);
    window.location.hash = '#' + unitIdentifiers.join('+');

    if (!supportsFragUpdate) {
      processFragment();
    }
  }

  document.body.addEventListener('focusin', handleElementInteraction, true);
  document.body.addEventListener('click', handleElementInteraction);

  document.querySelectorAll(globalElementQuery).forEach(el => el.setAttribute('tabindex', '0'));

  document.addEventListener('keydown', (event) => {
    const activeItem = document.activeElement;
    if (!activeItem || !activeItem.closest('.vocabList')) return;

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const previousItem = activeItem.previousElementSibling;
      if (previousItem) {
        previousItem.focus();
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextItem = activeItem.nextElementSibling;
      if (nextItem) {
        nextItem.focus();
      }
    }
  });

  const hideSidePanelTrigger = document.querySelector('.sidebar-hide-btn');
  if (hideSidePanelTrigger) {
    hideSidePanelTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      document.body.classList.add('sidebar-hide');
    });
  }

  const showSidePanelTrigger = document.querySelector('.sidebar-show-btn');
  if (showSidePanelTrigger) {
    showSidePanelTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      document.body.classList.remove('sidebar-hide');
    });
  }

});