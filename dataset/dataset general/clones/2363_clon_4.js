var whisper = {};

function retrieveGlobal() {
  return (function() {
    return this.whisper;
  }).call(null);
}

(function(whisper) {

  whisper.vault = new Map();

  whisper.store = function(label, blueprint) {
    if (!label) return;
    whisper.vault.set(label, blueprint);
  };

  whisper.process = function(label, dataModel, completionHandler) {
    const collector = new Collector(completionHandler);
    whisper.fetch(label, collector.prime, Scaffold.encapsulate(dataModel)).terminate();
  };

  whisper.conduit = function(label, dataModel) {
    const emitter = new Emitter();
    whisper.scheduleExecution(() => {
      whisper.fetch(label, emitter.prime, Scaffold.encapsulate(dataModel)).terminate();
    });
    return emitter;
  };

  whisper.transcribe = function(sourceCode, dataModel, completionHandler) {
    return whisper.compose(sourceCode)(dataModel, completionHandler);
  };

  whisper.compose = function(functionBodyString, label) {
    const blueprint = whisper.ingest(functionBodyString);
    if (label) {
      whisper.store(label, blueprint);
    }
    return function(dataModel, completionHandler) {
      const mainOutput = completionHandler ? new Collector(completionHandler) : new Emitter();
      whisper.scheduleExecution(() => {
        blueprint(mainOutput.prime, Scaffold.encapsulate(dataModel)).terminate();
      });
      return mainOutput;
    }
  };

  whisper.fetch = function(label, currentParcel, currentScaffold) {
    let blueprint = whisper.vault.get(label);
    if (blueprint) {
      return blueprint(currentParcel, currentScaffold);
    } else {
      if (whisper.onRetrieve) {
        return currentParcel.divert(branchParcel => {
          whisper.onRetrieve(label, (issue, content) => {
            if (issue) return branchParcel.signalError(issue);
            if (!whisper.vault.has(label)) {
              const fetchedBlueprint = whisper.ingest(content);
              whisper.store(label, fetchedBlueprint);
            }
            whisper.vault.get(label)(branchParcel, currentScaffold).terminate();
          });
        });
      }
      return currentParcel.signalError(new Error("Blueprint Not Found: " + label));
    }
  };

  whisper.ingest = function(functionBodyString) {
    return new Function('outputParcel', 'dataScaffold', functionBodyString);
  };

  whisper.isCollection = Array.isArray ? Array.isArray : function(collection) {
    return Object.prototype.toString.call(collection) === "[object Array]";
  };

  whisper.scheduleExecution = (function() {
    if (typeof process !== "undefined" && process.nextTick) {
      return process.nextTick;
    } else if (typeof queueMicrotask !== "undefined") {
      return queueMicrotask;
    } else {
      return function(action) {
        setTimeout(action, 0);
      }
    }
  })();

  whisper.isVacant = function(item) {
    if (whisper.isCollection(item) && !item.length) return true;
    if (item === 0) return false;
    return (!item);
  };

  whisper.transform = function(text, autoTransform, specificTransforms) {
    if (specificTransforms) {
      for (let k = 0, total = specificTransforms.length; k < total; k++) {
        const typeName = specificTransforms[k];
        if (typeName === "s") {
          autoTransform = null;
        } else {
          text = whisper.transformers[typeName](text);
        }
      }
    }
    if (autoTransform) {
      text = whisper.transformers[autoTransform](text);
    }
    return text;
  };

  whisper.transformers = {
    markup: function(val) {
      return whisper.sanitizeMarkup(val);
    },
    script: function(val) {
      return whisper.sanitizeScript(val);
    },
    urlEncode: encodeURI,
    urlEncodeComp: encodeURIComponent,
    jsonSerialize: function(val) {
      if (typeof JSON === 'undefined') {
        return val;
      }
      return JSON.stringify(val);
    },
    jsonDeserialize: function(val) {
      if (typeof JSON === 'undefined') {
        return val;
      }
      return JSON.parse(val);
    }
  };

  const MARKUP_SPECIALS = new RegExp(/[&<>\"\']/),
    AMPERSAND_RE = /&/g,
    LESS_THAN_RE = /</g,
    GREATER_THAN_RE = />/g,
    DOUBLE_QUOTE_RE = /\"/g,
    SINGLE_QUOTE_RE = /\'/g;

  whisper.sanitizeMarkup = function(content) {
    if (typeof content === "string") {
      if (!MARKUP_SPECIALS.test(content)) {
        return content;
      }
      return content.replace(AMPERSAND_RE, '&amp;')
        .replace(LESS_THAN_RE, '&lt;')
        .replace(GREATER_THAN_RE, '&gt;')
        .replace(DOUBLE_QUOTE_RE, '&quot;')
        .replace(SINGLE_QUOTE_RE, '&#39;');
    }
    return content;
  };

  whisper.sanitizeScript = function(content) {
    if (typeof content === "string") {
      if (!MARKUP_SPECIALS.test(content)) {
        return content;
      }
      return content.replace(DOUBLE_QUOTE_RE, '\\"')
        .replace(SINGLE_QUOTE_RE, "\\'")
        .replace(LESS_THAN_RE, '\\u003C')
        .replace(GREATER_THAN_RE, '\\u003E')
        .replace(AMPERSAND_RE, '\\u0026');
    }
    return content;
  };

  function Scaffold(scopePath, globalData, blockDefinitions) {
    this.scopePath = scopePath;
    this.globalData = globalData;
    this.blockDefinitions = blockDefinitions;
  }

  whisper.createBase = function(globalData) {
    return new Scaffold([{}], globalData);
  };

  Scaffold.encapsulate = function(input) {
    if (input instanceof Scaffold) {
      return input;
    }
    return new Scaffold([input || {}]);
  };

  Scaffold.prototype.locate = function(key) {
    for (let j = this.scopePath.length - 1; j >= 0; j--) {
      const currentScope = this.scopePath[j];
      if (currentScope && typeof currentScope === "object") {
        const value = currentScope[key];
        if (value !== undefined) {
          return value;
        }
      }
    }
    return this.globalData ? this.globalData[key] : undefined;
  };

  Scaffold.prototype.probe = function(current, pathSegments) {
    let currentItem = this.scopePath[this.scopePath.length - 1];
    if (current && pathSegments.length === 0) return currentItem;

    let currentRef = currentItem;
    let segmentIndex = 0;
    while (currentRef && segmentIndex < pathSegments.length) {
      currentRef = currentRef[pathSegments[segmentIndex]];
      segmentIndex++;
    }
    return currentRef;
  };

  Scaffold.prototype.inject = function(segment, index, total) {
    const newScopePath = this.scopePath.slice();
    if (segment && typeof segment === 'object') {
      segment['$index'] = index;
      segment['$count'] = total;
    }
    newScopePath.push(segment);
    return new Scaffold(newScopePath, this.globalData, this.blockDefinitions);
  };

  Scaffold.prototype.realign = function(newHead) {
    return new Scaffold([newHead], this.globalData, this.blockDefinitions);
  };

  Scaffold.prototype.currentSegment = function() {
    return this.scopePath[this.scopePath.length - 1];
  };

  Scaffold.prototype.retrieveBlock = function(key) {
    const definitions = this.blockDefinitions;
    if (!definitions) return;
    for (let b = definitions.length - 1; b >= 0; b--) {
      const func = definitions[b][key];
      if (func) return func;
    }
  };

  Scaffold.prototype.shiftBlocks = function(localBlocks) {
    let newDefinitions;
    if (localBlocks) {
      if (!this.blockDefinitions) {
        newDefinitions = [localBlocks];
      } else {
        newDefinitions = this.blockDefinitions.concat([localBlocks]);
      }
      return new Scaffold(this.scopePath, this.globalData, newDefinitions);
    }
    return this;
  };

  function Collector(finishCallback) {
    this.prime = new Parcel(this);
    this.finishCallback = finishCallback;
    this.outputAccumulator = '';
  }

  Collector.prototype.discharge = function() {
    let current = this.prime;
    while (current) {
      if (current.readyToDischarge) {
        this.outputAccumulator += current.content;
      } else if (current.issue) {
        this.finishCallback(current.issue);
        this.discharge = function() {};
        return;
      } else {
        return;
      }
      current = current.nextParcel;
      this.prime = current;
    }
    this.finishCallback(null, this.outputAccumulator);
  };

  function Emitter() {
    this.prime = new Parcel(this);
    this.eventHandlers = {};
  }

  Emitter.prototype.discharge = function() {
    let current = this.prime;
    while (current) {
      if (current.readyToDischarge) {
        this.trigger('data', current.content);
      } else if (current.issue) {
        this.trigger('error', current.issue);
        this.discharge = function() {};
        return;
      } else {
        return;
      }
      current = current.nextParcel;
      this.prime = current;
    }
    this.trigger('end');
  };

  Emitter.prototype.trigger = function(eventType, payload) {
    const handler = this.eventHandlers[eventType];
    if (handler) {
      handler(payload);
    }
  };

  Emitter.prototype.onEvent = function(eventType, handler) {
    this.eventHandlers[eventType] = handler;
    return this;
  };

  function Parcel(originator, nextParcel, wispChain) {
    this.originator = originator;
    this.nextParcel = nextParcel;
    this.content = '';
    this.readyToDischarge = false;
    this.wispChain = wispChain;
  }

  Parcel.prototype.compose = function(data) {
    let processedData = data;
    if (this.wispChain) {
      processedData = this.wispChain.processValue(data);
    }
    this.content += processedData;
    return this;
  };

  Parcel.prototype.terminate = function(data) {
    if (data) {
      this.compose(data);
    }
    this.readyToDischarge = true;
    this.originator.discharge();
    return this;
  };

  Parcel.prototype.divert = function(operation) {
    const cursor = new Parcel(this.originator, this.nextParcel, this.wispChain);
    const branch = new Parcel(this.originator, cursor, this.wispChain);

    this.nextParcel = branch;
    this.readyToDischarge = true;
    operation(branch);
    return cursor;
  };

  Parcel.prototype.applyWisp = function(wisp) {
    if (this.wispChain) {
      this.wispChain = this.wispChain.append(wisp);
    } else {
      this.wispChain = new Wisp(wisp);
    }
    return this;
  };

  Parcel.prototype.removeWisp = function() {
    if (this.wispChain) {
      this.wispChain = this.wispChain.previousWisp;
    }
    return this;
  };

  Parcel.prototype.execute = function(bodyFunction, currentScaffold) {
    return bodyFunction(this, currentScaffold);
  };

  Parcel.prototype.resolveRef = function(element, currentScaffold, autoTransform, specificTransforms) {
    let resolvedElement = element;
    if (typeof resolvedElement === "function") {
      resolvedElement = resolvedElement(this, currentScaffold, null, {
        auto: autoTransform,
        filters: specificTransforms
      });
      if (resolvedElement instanceof Parcel) {
        return resolvedElement;
      }
    }
    if (!whisper.isVacant(resolvedElement)) {
      return this.compose(whisper.transform(resolvedElement, autoTransform, specificTransforms));
    } else {
      return this;
    }
  };

  Parcel.prototype.flow = function(element, currentScaffold, bodyFunctions, parameters) {
    let processedElement = element;
    if (typeof processedElement === "function") {
      processedElement = processedElement(this, currentScaffold, bodyFunctions, parameters);
      if (processedElement instanceof Parcel) {
        return processedElement;
      }
    }

    const mainBody = bodyFunctions.main;
    const alternateBody = bodyFunctions['fallback'];

    let contextForSection = currentScaffold;
    if (parameters) {
      contextForSection = currentScaffold.inject(parameters);
    }

    if (whisper.isCollection(processedElement)) {
      if (mainBody) {
        let currentOutput = this;
        for (let i = 0, total = processedElement.length; i < total; i++) {
          currentOutput = mainBody(currentOutput, contextForSection.inject(processedElement[i], i, total));
        }
        return currentOutput;
      }
    } else if (processedElement === true) {
      if (mainBody) return mainBody(this, contextForSection);
    } else if (processedElement || processedElement === 0) {
      if (mainBody) return mainBody(this, contextForSection.inject(processedElement));
    } else if (alternateBody) {
      return alternateBody(this, contextForSection);
    }
    return this;
  };

  Parcel.prototype.ifExists = function(element, currentScaffold, bodyFunctions) {
    const mainBody = bodyFunctions.main;
    const alternateBody = bodyFunctions['fallback'];

    if (!whisper.isVacant(element)) {
      if (mainBody) return mainBody(this, currentScaffold);
    } else if (alternateBody) {
      return alternateBody(this, currentScaffold);
    }
    return this;
  };

  Parcel.prototype.ifNotExists = function(element, currentScaffold, bodyFunctions) {
    const mainBody = bodyFunctions.main;
    const alternateBody = bodyFunctions['fallback'];

    if (whisper.isVacant(element)) {
      if (mainBody) return mainBody(this, currentScaffold);
    } else if (alternateBody) {
      return alternateBody(this, currentScaffold);
    }
    return this;
  };

  Parcel.prototype.defineBlock = function(element, currentScaffold, bodyFunctions) {
    const mainBody = bodyFunctions.main;

    let effectiveBody = mainBody;
    if (element) {
      effectiveBody = element;
    }

    if (effectiveBody) {
      return effectiveBody(this, currentScaffold);
    }
    return this;
  };

  Parcel.prototype.embed = function(element, currentScaffold, parameters) {
    const currentPath = currentScaffold.scopePath;
    const currentHead = currentPath[currentPath.length - 1];

    let contextForEmbed = currentScaffold;
    if (parameters) {
      const pathWithoutHead = currentPath.slice(0, currentPath.length - 1);
      contextForEmbed = new Scaffold(pathWithoutHead, currentScaffold.globalData, currentScaffold.blockDefinitions);
      contextForEmbed = contextForEmbed.inject(parameters);
      contextForEmbed = contextForEmbed.inject(currentHead);
    }

    if (typeof element === "function") {
      return this.captureOutput(element, contextForEmbed, (nameToLoad, capturedParcel) => {
        whisper.fetch(nameToLoad, capturedParcel, contextForEmbed).terminate();
      });
    }
    return whisper.fetch(element, this, contextForEmbed);
  };

  Parcel.prototype.invokeHelper = function(helperName, currentScaffold, bodyFunctions, parameters) {
    return whisper.assistants[helperName](this, currentScaffold, bodyFunctions, parameters);
  };

  Parcel.prototype.captureOutput = function(bodyFunction, currentScaffold, resultCallback) {
    return this.divert(branchParcel => {
      const collector = new Collector((issue, collectedOutput) => {
        if (issue) {
          branchParcel.signalError(issue);
        } else {
          resultCallback(collectedOutput, branchParcel);
        }
      });
      bodyFunction(collector.prime, currentScaffold).terminate();
    });
  };

  Parcel.prototype.signalError = function(err) {
    this.issue = err;
    this.originator.discharge();
    return this;
  };

  function Wisp(headFunction, previousWisp) {
    this.headFunction = headFunction;
    this.previousWisp = previousWisp;
  }

  Wisp.prototype.append = function(newFunction) {
    return new Wisp(newFunction, this);
  };

  Wisp.prototype.processValue = function(val) {
    let currentVal = val;
    let currentWisp = this;
    const functionsToApply = [];

    while (currentWisp) {
      functionsToApply.unshift(currentWisp.headFunction);
      currentWisp = currentWisp.previousWisp;
    }

    for (let i = 0; i < functionsToApply.length; i++) {
      currentVal = functionsToApply[i](currentVal);
    }
    return currentVal;
  };

  whisper.assistants = {};

})(retrieveGlobal().whisper || (retrieveGlobal().whisper = {}));