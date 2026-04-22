(function (domAccess, extensionUtility) {
  'use strict';

  let componentPrototypeElement;

  const communicateStatus = (messageContent, displayDuration) => {
    const feedbackComponent = domAccess.getElementById('status');
    feedbackComponent.textContent = messageContent;
    setTimeout(() => {
      feedbackComponent.textContent = '';
    }, displayDuration);
  };

  const commitSettings = () => {
    const configurationMap = {};
    const containerElement = domAccess.querySelector('#settings-table tbody');
    Array.from(containerElement.children).forEach(childItem => {
      if (childItem !== componentPrototypeElement) {
        const repositoryKeyInput = childItem.querySelector('[data-field="repo-id"]');
        const localPathInput = childItem.querySelector('[data-field="local-path"]');

        const repositoryKey = repositoryKeyInput.value.trim();

        if (repositoryKey) {
          configurationMap[repositoryKey] = localPathInput.value;
        }
      }
    });

    extensionUtility.storage.sync.set({
      configurationMap: configurationMap
    }, () => {
      communicateStatus('Configuration persisted.', 750);
    });
  };

  const constructAndInsertComponent = (repositoryKeyVal = '', localPathVal = '') => {
    const newComponentElement = componentPrototypeElement.cloneNode(true);
    newComponentElement.classList.remove('hide');

    const repositoryKeyInput = newComponentElement.querySelector('[data-field="repo-id"]');
    const localPathInput = newComponentElement.querySelector('[data-field="local-path"]');

    repositoryKeyInput.value = repositoryKeyVal;
    localPathInput.value = localPathVal;

    componentPrototypeElement.before(newComponentElement);
  };

  const removeComponentInstance = (eventObject) => {
    eventObject.target.closest('tr').remove();
  };

  const loadAndRenderSettings = () => {
    componentPrototypeElement = domAccess.getElementById('local-mapping-row-template');
    componentPrototypeElement.removeAttribute('id');

    extensionUtility.storage.sync.get({
      configurationMap: {}
    }, (fetchedData) => {
      const storedConfig = fetchedData.configurationMap;

      Object.entries(storedConfig).forEach(([repositoryKey, localPath]) => {
        constructAndInsertComponent(repositoryKey, localPath);
      });

      constructAndInsertComponent();
    });
  };

  domAccess.addEventListener('DOMContentLoaded', () => {
    loadAndRenderSettings();

    domAccess.getElementById('save').addEventListener('click', commitSettings);

    domAccess.getElementById('add-local-mapping-row').addEventListener('click', () => {
      constructAndInsertComponent();
    });

    domAccess.body.addEventListener('click', (eventObject) => {
      if (eventObject.target.matches('.btn-local-mapping-delete')) {
        removeComponentInstance(eventObject);
      }
    });
  });

})(document, window.chrome);