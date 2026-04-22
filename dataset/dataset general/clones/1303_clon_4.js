(function() {

  'use strict';

  class SelectorWidget {
    constructor(componentRoot) {
      this.containerNode = componentRoot;
      this.labelNode = this.containerNode.querySelector('[data-widget-display]');
      this.dataInputNode = this.containerNode.querySelector('[data-widget-value-holder]');
      this.optionsListNode = this.containerNode.querySelector('[data-widget-option-list]');

      this.valueToLabelMap = new Map();
      this.optionsListNode.querySelectorAll('[data-option-key]').forEach(itemElement => {
        const itemKey = itemElement.getAttribute('data-option-key');
        const itemContent = itemElement.innerHTML;
        this.valueToLabelMap.set(itemKey, itemContent);
      });

      this.attachHandlers();
      this.refreshDisplay();
    }

    attachHandlers() {
      this.dataInputNode.addEventListener('change', this.refreshDisplay.bind(this));
      this.optionsListNode.addEventListener('click', this.processOptionClick.bind(this));
    }

    refreshDisplay() {
      const currentKey = this.dataInputNode.value;
      const displayContent = this.valueToLabelMap.get(currentKey) || '';
      if (this.labelNode) {
        this.labelNode.innerHTML = displayContent;
      }
    }

    processOptionClick(event) {
      let clickedElement = event.target;
      let selectedKey = null;

      while (clickedElement && clickedElement !== this.optionsListNode) {
        selectedKey = clickedElement.getAttribute('data-option-key');
        if (selectedKey !== null) {
          break;
        }
        clickedElement = clickedElement.parentElement;
      }

      if (selectedKey !== null) {
        event.preventDefault();
        this.dataInputNode.value = selectedKey;
        const changeNotification = new Event('change', {
          bubbles: true
        });
        this.dataInputNode.dispatchEvent(changeNotification);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('div[data-component="selector-widget"]').forEach(element => {
      new SelectorWidget(element);
    });
  });

})();