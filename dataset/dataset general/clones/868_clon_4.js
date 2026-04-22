(function(globalKit) {

globalKit = globalKit || {};

if (!window.WebKitShadowRoot) {
  console.error('Shadow DOM capabilities are indispensable.');
  return;
}

const _IterateCollection_ = (collection, operation, context) => {
  Array.from(collection).forEach(operation, context);
};

const _EmptyFunction_ = () => {};

globalKit._ComponentBlueprint_ = function(elementLabel, baseTagIdentifier, definitionContext) {
  this._designation_ = elementLabel;
  this._extendedTag_ = baseTagIdentifier;
  this._behaviorContext_ = definitionContext;
  this._behaviorContext_._elementBlueprint_ = this;

  this._constructedPrototype_ = this._establishPrototypicalChain_();
  this._generatedConstructor_ = this._createCustomConstructor_();
  this._attributeMonitor_ = null;

  this._applyComponentLogic_ = this._applyComponentLogic_.bind(this);
};

globalKit._ComponentBlueprint_.prototype = {
  _establishPrototypicalChain_: function() {
    const temporaryElement = document.createElement(this._extendedTag_);
    return Object.create(Object.getPrototypeOf(temporaryElement));
  },

  _createCustomConstructor_: function() {
    const baseTagName = this._extendedTag_;
    const initialCreationHook = this._behaviorContext_._onBuild_;
    const prototypeForInstances = this._constructedPrototype_;

    const elementConstructor = function() {
      const newElement = document.createElement(baseTagName);
      Object.setPrototypeOf(prototypeForInstances, Object.getPrototypeOf(newElement));
      Object.setPrototypeOf(newElement, prototypeForInstances);

      initialCreationHook.call(newElement);
      return newElement;
    };
    elementConstructor.prototype = prototypeForInstances;
    return elementConstructor;
  },

  _processScript_: function(scriptNode, lifecycleAssigner) {
    const scriptFn = new Function('lifecycle', scriptNode.textContent);
    scriptFn.call(this._behaviorContext_, lifecycleAssigner);
  },

  _attachTemplate_: function(templateNode) {
    this._templateNode_ = templateNode;
  },

  _applyComponentLogic_: function(targetElement) {
    Object.setPrototypeOf(
        this._generatedConstructor_.prototype,
        Object.getPrototypeOf(document.createElement(this._extendedTag_))
    );

    Object.setPrototypeOf(targetElement, this._generatedConstructor_.prototype);

    const shadowHost = this._generateShadowHost_(targetElement);

    this._behaviorContext_._onBuild_ && this._behaviorContext_._onBuild_.call(targetElement, shadowHost);
    this._behaviorContext_._onInsert_ && this._behaviorContext_._onInsert_.call(targetElement, shadowHost);

    if (this._behaviorContext_._onAttrChange_) {
      const attributeTracker = new WebKitMutationObserver((modifications) => {
        _IterateCollection_(modifications, (singleModification) => {
          this._behaviorContext_._onAttrChange_(
            singleModification.attributeName,
            singleModification.oldValue,
            singleModification.target.getAttribute(singleModification.attributeName)
          );
        });
      });

      attributeTracker.observe(shadowHost.host, {
        attributes: true,
        attributeOldValue: true
      });
      this._attributeMonitor_ = attributeTracker;
    }
  },

  _generateShadowHost_: function(hostElement) {
    if (!this._templateNode_) {
      return undefined;
    }

    const newShadowRoot = new WebKitShadowRoot(hostElement);
    newShadowRoot.host = hostElement;
    _IterateCollection_(this._templateNode_.content.childNodes, (nodeCopy) => {
      newShadowRoot.appendChild(nodeCopy.cloneNode(true));
    });

    return newShadowRoot;
  }
};

globalKit._ComponentRegistrar_ = function() {
  this._handleComponentElement_ = this._handleComponentElement_.bind(this);
};

globalKit._ComponentRegistrar_.prototype = {
  _onBlueprintCreated_: null,

  _handleComponentElement_: function(markupNode) {
    const componentName = markupNode.getAttribute('name');
    if (!componentName) {
      console.error('Component definition requires a "name" attribute.');
      return;
    }
    const baseTag = markupNode.getAttribute('extends');
    if (!baseTag) {
      console.error('Component definition requires an "extends" attribute.');
      return;
    }
    const constructorAlias = markupNode.getAttribute('constructor');

    const lifecycleContainer = {
        _onBuild_: _EmptyFunction_,
        _onInsert_: _EmptyFunction_,
        _onAttrChange_: _EmptyFunction_
    };

    const lifecycleAssignmentMethod = function(dict) {
        this._onBuild_ = dict.created || _EmptyFunction_;
        this._onInsert_ = dict.inserted || _EmptyFunction_;
        this._onAttrChange_ = dict.attributeChanged || _EmptyFunction_;
    };

    _IterateCollection_(markupNode.querySelectorAll('script'), (scriptEl) => {
        const scriptExecutor = new Function('lifecycle', scriptEl.textContent);
        scriptExecutor.call(lifecycleContainer, lifecycleAssignmentMethod.bind(lifecycleContainer));
    });

    const blueprintInstance = new globalKit._ComponentBlueprint_(componentName, baseTag, lifecycleContainer);

    if (constructorAlias) {
      window[constructorAlias] = blueprintInstance._generatedConstructor_;
    }

    const templateMarkup = markupNode.querySelector('template');
    templateMarkup && blueprintInstance._attachTemplate_(templateMarkup);

    this._onBlueprintCreated_ && this._onBlueprintCreated_(blueprintInstance);
  }
};

globalKit._MarkupProcessor_ = function() {
  this._processHtmlContent_ = this._processHtmlContent_.bind(this);
};

globalKit._MarkupProcessor_.prototype = {
  _onDefinitionFound_: null,

  _processHtmlContent_: function(htmlText) {
    const tempDoc = document.implementation.createHTMLDocument('');
    tempDoc.body.innerHTML = htmlText;
    _IterateCollection_(tempDoc.querySelectorAll('element'), (elementNode) => {
      this._onDefinitionFound_ && this._onDefinitionFound_(elementNode);
    }, this);
  }
};

globalKit._ResourceFetcher_ = function() {
  this._initiateLoading_ = this._initiateLoading_.bind(this);
};

globalKit._ResourceFetcher_.prototype = {
  _onDataReceived_: null,
  _onLoadingError_: null,

  _initiateLoading_: function() {
    _IterateCollection_(document.querySelectorAll('link[rel=components]'), (linkElement) => {
      this._retrieveUrlContent_(linkElement.href);
    }, this);
  },

  _retrieveUrlContent_: function(targetUrl) {
    const xhrRequest = new XMLHttpRequest();
    const currentFetcher = this;

    xhrRequest.open('GET', targetUrl);
    xhrRequest.onloadend = function() {
      if ((xhrRequest.status >= 200 && xhrRequest.status < 300) || xhrRequest.status === 304) {
        currentFetcher._onDataReceived_ && currentFetcher._onDataReceived_(xhrRequest.response);
      } else {
        currentFetcher._onLoadingError_ && currentFetcher._onLoadingError_(xhrRequest.status, xhrRequest);
      }
    };
    xhrRequest.send();
  }
};

globalKit._InitializeComponentSystem_ = function() {
  const dataLoader = new globalKit._ResourceFetcher_();
  document.addEventListener('DOMContentLoaded', dataLoader._initiateLoading_);

  const contentProcessor = new globalKit._MarkupProcessor_();
  dataLoader._onDataReceived_ = contentProcessor._processHtmlContent_;
  dataLoader._onLoadingError_ = (httpStatus, responseObj) => {
    console.error("Failed to acquire component resource: HTTP " + httpStatus + " - " + responseObj.statusText);
  };

  const blueprintFactory = new globalKit._ComponentRegistrar_();
  contentProcessor._onDefinitionFound_ = blueprintFactory._handleComponentElement_;
  blueprintFactory._onBlueprintCreated_ = (componentBlueprint) => {
    _IterateCollection_(
      document.querySelectorAll(
        componentBlueprint._extendedTag_ + '[is=' + componentBlueprint._designation_ + ']'
      ),
      componentBlueprint._applyComponentLogic_
    );
  };
};

if (!globalKit._manualActivation_) {
  globalKit._InitializeComponentSystem_();
}

})(window._ComponentKit_);