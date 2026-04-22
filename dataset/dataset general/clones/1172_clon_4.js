class ContentInteractiveManager {
  static #config = {
    headlinePattern: /^H(\d)$/,
    todoSuffixPattern: /^(.+)\.todo$/,
    tagPattern: /@([\w]+)/,
    classNames: {
      foldingRoot: 'folding',
      foldingTag: 'folding-tag',
      foldingTagged: 'folding-tagged',
      activeTag: 'active-tag',
      tagFilter: 'tag-filter',
      foldedState: 'folded',
      hiddenByFold: 'hidden-by-fold',
      collapsedByDefault: 'folding-collapsed',
      ellipsis: 'folding-ellipsis',
      todoList: 'todo',
      todoDone: 'done',
      noTag: 'no-tag',
      decorator: 'decorator'
    },
    dataAttrNames: {
      tagValue: 'data-tag',
      enhancedRoot: 'data-enhanced-root',
      interactionRole: 'data-interaction-role'
    }
  };

  #processedRoots;

  constructor(elements) {
    this.#processedRoots = Array.isArray(elements) ? elements : [elements];
    this.#applyInteractivity();
  }

  #applyInteractivity() {
    this.#processedRoots.forEach(mainContainer => {
      mainContainer.classList.add(ContentInteractiveManager.#config.classNames.foldingRoot);
      mainContainer.setAttribute(ContentInteractiveManager.#config.dataAttrNames.enhancedRoot, 'true');
      this.#attachEventDispatcher(mainContainer);
      this.#exploreAndAnnotateContent(mainContainer);
      this.#setInitialVisibility(mainContainer);
    });
  }

  #attachEventDispatcher(container) {
    container.addEventListener('click', event => this.#handleInteractionEvent(event));
  }

  #handleInteractionEvent(e) {
    const targetElement = e.target;
    const { dataAttrNames } = ContentInteractiveManager.#config;

    let interactiveElement = targetElement;
    while (interactiveElement && interactiveElement !== e.currentTarget && !interactiveElement.hasAttribute(dataAttrNames.interactionRole)) {
      interactiveElement = interactiveElement.parentElement;
    }

    if (!interactiveElement || interactiveElement === e.currentTarget) {
      return;
    }

    const role = interactiveElement.getAttribute(dataAttrNames.interactionRole);

    switch (role) {
      case 'tag-toggle':
        e.preventDefault();
        this.#manageTagFiltering(interactiveElement, e.currentTarget);
        break;
      case 'headline-toggle':
        e.preventDefault();
        this.#toggleSectionFolding(interactiveElement);
        break;
    }
  }

  #manageTagFiltering(clickedTagSpan, container) {
    const { classNames, dataAttrNames } = ContentInteractiveManager.#config;
    const tag = clickedTagSpan.getAttribute(dataAttrNames.tagValue);

    if (!tag) return;

    const specificFilterClass = `${classNames.tagFilter}-${tag}`;

    if (container.classList.contains(specificFilterClass)) {
      container.classList.remove(classNames.tagFilter);
      container.classList.remove(specificFilterClass);
      this.#adjustTaggedItemActivation(container, null);
    } else {
      Array.from(container.classList).forEach(cls => {
        if (cls.startsWith(`${classNames.tagFilter}-`)) {
          container.classList.remove(cls);
        }
      });
      container.classList.add(classNames.tagFilter);
      container.classList.add(specificFilterClass);
      this.#adjustTaggedItemActivation(container, tag);
    }
  }

  #adjustTaggedItemActivation(container, activeTag) {
    const { classNames } = ContentInteractiveManager.#config;
    const allTaggedItems = container.getElementsByClassName(classNames.foldingTagged);

    Array.from(allTaggedItems).forEach(item => {
      const specificTaggedClass = `${classNames.foldingTagged}-${activeTag}`;
      if (activeTag && item.classList.contains(specificTaggedClass)) {
        item.classList.add(classNames.activeTag);
      } else {
        item.classList.remove(classNames.activeTag);
      }
    });
  }

  #exploreAndAnnotateContent(container) {
    let currentChild = container.firstElementChild;
    while (currentChild) {
      const discoveredTags = new Set();
      this.#processNodeForAnnotations(currentChild, discoveredTags);

      if (discoveredTags.size > 0) {
        this.#markElementWithTags(currentChild, Array.from(discoveredTags));
        this.#propagateTagsUpwards(currentChild, Array.from(discoveredTags));
      } else {
        currentChild.classList.add(ContentInteractiveManager.#config.classNames.noTag);
      }

      this.#examineAndDecorateTodo(currentChild);
      currentChild = currentChild.nextElementSibling;
    }
  }

  #processNodeForAnnotations(element, tagSet) {
    const { headlinePattern, dataAttrNames } = ContentInteractiveManager.#config;

    const headlineMatch = headlinePattern.exec(element.nodeName);
    if (headlineMatch) {
      element.setAttribute(dataAttrNames.interactionRole, 'headline-toggle');
    }

    const childNodes = Array.from(element.childNodes);
    childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        this.#tokenizeTextNodeForTags(child, tagSet);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        this.#processNodeForAnnotations(child, tagSet);
      }
    });
  }

  #tokenizeTextNodeForTags(textNode, tagSet) {
    const { tagPattern, classNames, dataAttrNames } = ContentInteractiveManager.#config;
    let currentText = textNode.textContent;
    let match;
    const fragment = document.createDocumentFragment();
    let lastPosition = 0;

    tagPattern.lastIndex = 0;

    while ((match = tagPattern.exec(currentText)) !== null) {
      const tagName = match[1].toLowerCase();
      tagSet.add(tagName);

      if (match.index > lastPosition) {
        fragment.appendChild(document.createTextNode(currentText.substring(lastPosition, match.index)));
      }

      const tagSpan = document.createElement('span');
      tagSpan.textContent = match[0];
      tagSpan.classList.add(classNames.foldingTag);
      tagSpan.setAttribute(dataAttrNames.tagValue, tagName);
      tagSpan.setAttribute(dataAttrNames.interactionRole, 'tag-toggle');
      fragment.appendChild(tagSpan);

      lastPosition = match.index + match[0].length;
    }

    if (lastPosition < currentText.length) {
      fragment.appendChild(document.createTextNode(currentText.substring(lastPosition)));
    }

    if (fragment.childNodes.length > 1 || (fragment.childNodes.length === 1 && fragment.firstChild.nodeType === Node.ELEMENT_NODE)) {
      textNode.parentNode.replaceChild(fragment, textNode);
    }
  }

  #markElementWithTags(element, tags) {
    const { classNames } = ContentInteractiveManager.#config;
    element.classList.add(classNames.foldingTagged);
    tags.forEach(tag => {
      element.classList.add(`${classNames.foldingTagged}-${tag}`);
    });
  }

  #propagateTagsUpwards(startElement, tagsToPropagate) {
    const { headlinePattern, classNames } = ContentInteractiveManager.#config;
    let current = startElement;
    let highestHeadlineLevelEncountered = Infinity;

    while (current && current.previousElementSibling) {
      current = current.previousElementSibling;
      const headlineMatch = headlinePattern.exec(current.nodeName);

      if (headlineMatch) {
        const currentHeadlineLevel = parseInt(headlineMatch[1], 10);

        if (currentHeadlineLevel < highestHeadlineLevelEncountered) {
          this.#markElementWithTags(current, tagsToPropagate);
          highestHeadlineLevelEncountered = currentHeadlineLevel;
        } else if (currentHeadlineLevel === highestHeadlineLevelEncountered) {
          break;
        }
      }
    }
  }

  #examineAndDecorateTodo(potentialHeaderElement) {
    const { headlinePattern, todoSuffixPattern, classNames } = ContentInteractiveManager.#config;
    const headlineMatch = headlinePattern.exec(potentialHeaderElement.nodeName);
    if (!headlineMatch) return;

    const todoMatch = todoSuffixPattern.exec(potentialHeaderElement.textContent);
    if (!todoMatch) return;

    const originalTitle = todoMatch[1];

    potentialHeaderElement.textContent = '';
    potentialHeaderElement.appendChild(document.createTextNode(originalTitle));
    const todoMarker = document.createElement('span');
    todoMarker.classList.add(classNames.decorator);
    todoMarker.appendChild(document.createTextNode('.todo'));
    potentialHeaderElement.appendChild(todoMarker);

    const subsequentElement = potentialHeaderElement.nextElementSibling;
    if (subsequentElement && subsequentElement.nodeName === 'UL') {
      this.#processTodoSublist(subsequentElement);
    }
  }

  #processTodoSublist(listElement) {
    const { classNames } = ContentInteractiveManager.#config;
    listElement.classList.add(classNames.todoList);
    const todoDoneRegex = /@done$/m;

    Array.from(listElement.querySelectorAll('li')).forEach(listItem => {
      const firstChildText = listItem.firstChild && listItem.firstChild.nodeType === Node.TEXT_NODE
        ? listItem.firstChild.textContent
        : '';
      if (todoDoneRegex.test(firstChildText)) {
        listItem.classList.add(classNames.todoDone);
      }
    });
  }

  #setInitialVisibility(container) {
    const { headlinePattern, classNames } = ContentInteractiveManager.#config;
    Array.from(container.getElementsByClassName(classNames.collapsedByDefault)).forEach(element => {
      if (headlinePattern.test(element.nodeName)) {
        this.#toggleSectionFolding(element);
      }
    });
  }

  #toggleSectionFolding(headlineElement) {
    const { classNames } = ContentInteractiveManager.#config;
    const isCurrentlyFolded = headlineElement.classList.contains(classNames.foldedState);

    headlineElement.classList.toggle(classNames.foldedState);

    if (isCurrentlyFolded) {
      this.#removeFoldingEllipsis(headlineElement);
      this.#unhideSubsequentContent(headlineElement);
    } else {
      this.#addFoldingEllipsis(headlineElement);
      this.#hideSubsequentContent(headlineElement);
    }
  }

  #addFoldingEllipsis(headlineElement) {
    const { classNames } = ContentInteractiveManager.#config;
    const ellipsisSpan = document.createElement('div');
    ellipsisSpan.textContent = '…';
    ellipsisSpan.classList.add(classNames.ellipsis);
    headlineElement.appendChild(ellipsisSpan);
  }

  #removeFoldingEllipsis(headlineElement) {
    const { classNames } = ContentInteractiveManager.#config;
    const existingEllipsis = headlineElement.querySelector(`.${classNames.ellipsis}`);
    if (existingEllipsis) {
      headlineElement.removeChild(existingEllipsis);
    }
  }

  #iterateSubsequentElements(startElement, processCallback) {
    const { headlinePattern } = ContentInteractiveManager.#config;
    const startLevelMatch = headlinePattern.exec(startElement.nodeName);
    if (!startLevelMatch) return;

    const startLevel = parseInt(startLevelMatch[1], 10);
    let current = startElement.nextElementSibling;

    while (current) {
      const currentLevelMatch = headlinePattern.exec(current.nodeName);
      if (currentLevelMatch && parseInt(currentLevelMatch[1], 10) <= startLevel) {
        break;
      }
      processCallback(current);
      current = current.nextElementSibling;
    }
  }

  #hideSubsequentContent(headlineElement) {
    const { classNames } = ContentInteractiveManager.#config;
    this.#iterateSubsequentElements(headlineElement, element => {
      element.classList.add(classNames.hiddenByFold);
    });
  }

  #unhideSubsequentContent(headlineElement) {
    const { classNames, headlinePattern } = ContentInteractiveManager.#config;
    const startLevelMatch = headlinePattern.exec(headlineElement.nodeName);
    if (!startLevelMatch) return;
    const startLevel = parseInt(startLevelMatch[1], 10);
    let current = headlineElement.nextElementSibling;

    while (current) {
      const currentLevelMatch = headlinePattern.exec(current.nodeName);
      if (currentLevelMatch && parseInt(currentLevelMatch[1], 10) <= startLevel) {
        break;
      }

      current.classList.remove(classNames.hiddenByFold);

      if (current.classList.contains(classNames.foldedState)) {
        let nextElementAfterFold = this.#findEndOfSection(current);
        if (nextElementAfterFold) {
          current = nextElementAfterFold.previousElementSibling;
        } else {
          current = null;
          break;
        }
      }
      current = current.nextElementSibling;
    }
  }

  #findEndOfSection(headlineElement) {
    const { headlinePattern } = ContentInteractiveManager.#config;
    const startLevelMatch = headlinePattern.exec(headlineElement.nodeName);
    if (!startLevelMatch) return null;
    const startLevel = parseInt(startLevelMatch[1], 10);
    let current = headlineElement.nextElementSibling;

    while (current) {
      const currentLevelMatch = headlinePattern.exec(current.nodeName);
      if (currentLevelMatch && parseInt(currentLevelMatch[1], 10) <= startLevel) {
        return current;
      }
      current = current.nextElementSibling;
    }
    return null;
  }

  static initialize(targetSelector = '.folding') {
    let selectedElements;
    if (typeof targetSelector === 'string') {
      selectedElements = document.querySelectorAll(targetSelector);
    } else if (targetSelector instanceof HTMLElement) {
      selectedElements = [targetSelector];
    } else if (Array.isArray(targetSelector) && targetSelector.every(el => el instanceof HTMLElement)) {
      selectedElements = targetSelector;
    } else {
      console.error('Invalid input for ContentInteractiveManager.initialize. Must be a CSS selector string, HTMLElement, or array of HTMLElements.');
      return;
    }

    if (selectedElements.length === 0) {
      console.warn('No elements found for ContentInteractiveManager.initialize with selector:', targetSelector);
      return;
    }

    return new ContentInteractiveManager(Array.from(selectedElements));
  }
}

window.ContentInteractiveProcessor = ContentInteractiveManager;

document.addEventListener('DOMContentLoaded', () => {
  window.ContentInteractiveProcessor.initialize();
});