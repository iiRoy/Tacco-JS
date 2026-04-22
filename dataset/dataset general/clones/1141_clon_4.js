const dictionaryData = {
  "en": {
    "main": {
      "heading": "Welcome to our platform!"
    },
    "common": {
      "greeting": "Hello there"
    }
  },
  "es": {
    "main": {
      "heading": "¡Bienvenido a nuestra plataforma!"
    },
    "common": {
      "greeting": "Hola a todos"
    }
  }
};

const phraseAssembler = (function() {
  let lexiconStore = {};
  let attributeHandle = 'phraseKey';
  let enableTracing = false;
  let activeLanguage = 'en';

  function setup(configuration) {
    if (configuration.resourceMap) {
      lexiconStore = configuration.resourceMap;
    }
    if (configuration.keyAttributeName) {
      attributeHandle = configuration.keyAttributeName;
    }
    if (typeof configuration.traceEnabled === 'boolean') {
      enableTracing = configuration.traceEnabled;
    }
    if (configuration.defaultLang) {
      activeLanguage = configuration.defaultLang;
    }
    if (enableTracing) {
      console.info('PhraseAssembler initialized. Settings:', { lexiconStore, attributeHandle, enableTracing, activeLanguage });
    }
  }

  function retrievePhrase(identifier) {
    let currentBlock = lexiconStore[activeLanguage] || lexiconStore[Object.keys(lexiconStore)[0]];
    if (!currentBlock) {
      if (enableTracing) console.warn(`PhraseAssembler: No resources for language '${activeLanguage}'.`);
      return `[${identifier}]`;
    }

    const pathSegments = identifier.split('.');
    for (let i = 0; i < pathSegments.length; i++) {
      if (currentBlock && typeof currentBlock === 'object' && currentBlock.hasOwnProperty(pathSegments[i])) {
        currentBlock = currentBlock[pathSegments[i]];
      } else {
        if (enableTracing) console.warn(`PhraseAssembler: Identifier '${identifier}' not found at segment '${pathSegments[i]}' for language '${activeLanguage}'.`);
        return `[${identifier}]`;
      }
    }
    return typeof currentBlock === 'string' ? currentBlock : `[${identifier}]`;
  }

  function processDocumentElements(targetSelector) {
    document.querySelectorAll(targetSelector).forEach(element => {
      const keyReference = element.getAttribute(attributeHandle);
      if (keyReference) {
        const assembledText = retrievePhrase(keyReference);
        element.textContent = assembledText;
        if (enableTracing) console.debug(`PhraseAssembler: Element ${element.tagName} translated using key '${keyReference}' to '${assembledText}'.`);
      } else {
        if (enableTracing) console.warn(`PhraseAssembler: Element ${element.tagName} has no '${attributeHandle}' attribute.`);
      }
    });
  }

  return {
    configureSystem: setup,
    translateElements: processDocumentElements
  };
})();

phraseAssembler.configureSystem({
  resourceMap: dictionaryData,
  keyAttributeName: "phraseKey",
  traceEnabled: true,
  defaultLang: "en"
});

document.addEventListener('DOMContentLoaded', () => {
  phraseAssembler.translateElements("h1");
});