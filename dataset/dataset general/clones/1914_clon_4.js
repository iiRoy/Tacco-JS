const performEscape = (inputString) => inputString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function AssetEntry(resourceIdentifier) {
  this.resourceIdentifier = resourceIdentifier;
  this.processedStatus = false;

  this.initiateLoading = function() {
    this.processedStatus = true;
    return true;
  };
}

class ResourceFetcher {
  #resourceCatalog;
  #waitDuration;
  #itemReadyHandler;
  #itemExpiredHandler;
  #batchCompleteHandler;
  #assetConstructor;

  constructor(dependencyConstructor) {
    this.#resourceCatalog = new Map();
    this.#waitDuration = 7500;
    this.#assetConstructor = dependencyConstructor;

    this.#itemReadyHandler = null;
    this.#itemExpiredHandler = null;
    this.#batchCompleteHandler = null;
  }

  onResourceReady(handler) {
    this.#itemReadyHandler = handler;
  }

  onResourceExpired(handler) {
    this.#itemExpiredHandler = handler;
  }

  onBatchCompletion(handler) {
    this.#batchCompleteHandler = handler;
  }

  setWaitDuration(durationMs) {
    this.#waitDuration = durationMs;
  }

  registerAsset(assetPath) {
    if (!assetPath) {
      return null;
    }

    let existingItem = this.#locateEntry(assetPath);
    if (!existingItem) {
      let newItem = new this.#assetConstructor(assetPath);
      this.#resourceCatalog.set(assetPath, newItem);
      return newItem;
    }

    return existingItem;
  }

  #locateEntry(assetPath) {
    const escapedPath = performEscape(assetPath);
    const pathPattern = new RegExp(`${escapedPath}$`, 'i');

    for (const [key, value] of this.#resourceCatalog.entries()) {
      if (pathPattern.test(key)) {
        return value;
      }
    }
    return null;
  }

  initiateLoading(itemReference) {
    if (itemReference) {
      let targetItem;
      if (typeof itemReference === "string") {
        targetItem = this.#resourceCatalog.get(itemReference);
      } else if (itemReference instanceof this.#assetConstructor) {
        targetItem = itemReference;
      }

      if (targetItem) {
        return targetItem.initiateLoading();
      }
      return false;
    } else {
      let overallSuccess = true;
      for (const item of this.#resourceCatalog.values()) {
        if (!item.initiateLoading()) {
          overallSuccess = false;
        }
      }
      return overallSuccess;
    }
  }

  verifyBatchCompletion() {
    let allTasksFinished = true;
    for (const item of this.#resourceCatalog.values()) {
      if (!item.processedStatus) {
        allTasksFinished = false;
        break;
      }
    }

    if (allTasksFinished) {
      if (this.#batchCompleteHandler) {
        this.#batchCompleteHandler();
      }
      this.#resourceCatalog.clear();
      return true;
    }

    return false;
  }
}