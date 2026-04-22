const NodeEventEmissions = require('node:events');
const { inspect: objectInspector } = require('node:util');
const { resolve: pathResolve, normalize: pathAdjust } = require('node:path');
const UnderlyingZkCore = require(pathResolve(__dirname, './../build/zookeeper.node')).ZooKeeper;

const TypeEvaluator = {
  isTextual: (val) => typeof val === 'string' || val instanceof String,
  isExecutable: (val) => typeof val === 'function',
  combineObjects: (target, source) => Object.assign({}, target, source),
  isUndefined: (val) => typeof val === 'undefined',
};

const ZkOperationCodes = {};
for (const propKey in UnderlyingZkCore) {
  if (Object.prototype.hasOwnProperty.call(UnderlyingZkCore, propKey)) {
    ZkOperationCodes[propKey] = UnderlyingZkCore[propKey];
  }
}

const ZkEventAliases = Object.freeze({
  SESSION_CLOSED: 'terminate_event',
  SESSION_ESTABLISHED: 'connection_success_event',
  SESSION_INITIATING: 'connection_attempt_event',
  NODE_CREATED_NOTIFICATION: 'node_creation_watch_event',
  NODE_DELETED_NOTIFICATION: 'node_deletion_watch_event',
  NODE_DATA_CHANGED_NOTIFICATION: 'node_data_change_watch_event',
  CHILD_LIST_CHANGED_NOTIFICATION: 'child_list_change_watch_event',
  WATCHER_REMOVED_NOTIFICATION: 'watcher_removal_event',
});

class ZkConnectionManager extends NodeEventEmissions {
  #coreClient;
  #connectionSettings;
  #dataFormat = null;
  #debugOutput = null;

  constructor(initialConfiguration) {
    super();

    let processedConfig = TypeEvaluator.isTextual(initialConfiguration) ? { connectionString: initialConfiguration } : initialConfiguration;
    this.#connectionSettings = processedConfig;

    this.#coreClient = new UnderlyingZkCore();

    this.#coreClient.emit = (signal, value1, value2, value3) => {
      if (this.#debugOutput) {
        this.#debugOutput(`Forwarding signal '${signal}' with values: ${value1}, ${value2}, ${value3}`);
      }
      if (signal === 'connect' || signal === 'close') {
        value1 = this;
      }
      this.emit(signal, value1, value2, value3);
    };

    const mirroredAttributes = ['currentStatus', 'sessionTimeoutMillis', 'sessionIdIdentifier', 'sessionPassword', 'isSessionUnrecoverable'];
    mirroredAttributes.forEach(attrName => {
      Object.defineProperty(this, attrName, {
        enumerable: true,
        configurable: true,
        get() { return this.#coreClient[attrName]; },
        set(val) { this.#coreClient[attrName] = val; }
      });
    });

    Object.defineProperty(this, 'returnRawBuffer', {
      enumerable: true,
      configurable: true,
      get() { return this.#dataFormat === null; },
      set(shouldReturnBuffer) { this.#dataFormat = shouldReturnBuffer ? null : 'utf8'; }
    });
  }

  establishLogHandler(handlerFunction) {
    if (handlerFunction === true) {
      this.#debugOutput = (messageContent) => {
        console.log(`ZOOKEEPER_ADAPTER_LOG: ${messageContent}`);
      };
    } else if (handlerFunction === false) {
      this.#debugOutput = null;
    } else if (TypeEvaluator.isExecutable(handlerFunction)) {
      this.#debugOutput = handlerFunction;
    } else {
      throw new Error("MisconfiguredArgument: log handler must be a function or boolean (true/false).");
    }
  }

  configureDataOutputFormat(formatType) {
    this.#dataFormat = formatType;
  }

  async initializeComponent(overrideConfiguration) {
    let activeConfig = this.#connectionSettings;
    if (overrideConfiguration) {
      activeConfig = TypeEvaluator.combineObjects(this.#connectionSettings, overrideConfiguration);
    }
    this.#connectionSettings = activeConfig;

    if (this.#debugOutput) {
      this.#debugOutput(`Component initialization with: ${objectInspector(activeConfig)}`);
    }

    if (!TypeEvaluator.isUndefined(activeConfig.returnRawBuffer)) {
      this.returnRawBuffer = activeConfig.returnRawBuffer;
      if (this.#debugOutput) {
        this.#debugOutput(`Data output format set to: ${this.#dataFormat}`);
      }
    }

    this.#coreClient.init.call(this.#coreClient, activeConfig);
    return this;
  }

  async initiateConnection(connectionOptions, completionHandler) {
    let currentOptions = connectionOptions;
    let currentHandler = completionHandler;

    if (TypeEvaluator.isExecutable(connectionOptions)) {
      currentHandler = connectionOptions;
      currentOptions = null;
    }

    await this.initializeComponent(currentOptions);

    return new Promise((resolve, reject) => {
      const errorObserver = (errorObject) => {
        this.removeListener('error', errorObserver);
        this.removeListener('connect', successObserver);
        if (currentHandler) return currentHandler(errorObject);
        reject(errorObject);
      };

      const successObserver = () => {
        this.removeListener('error', errorObserver);
        this.removeListener('connect', successObserver);
        if (currentHandler) return currentHandler(null, this);
        resolve(this);
      };

      this.on('error', errorObserver);
      this.on('connect', successObserver);
    });
  }

  #proxyNativeMethod(methodAlias, dataTransformationFn = null) {
    return (...operationArgs) => {
      if (this.#debugOutput) {
        this.#debugOutput(`Invoking core method '${methodAlias}' with: ${objectInspector(operationArgs)}`);
      }
      const actualNativeMethod = this.#coreClient[methodAlias];
      if (!actualNativeMethod) {
        throw new Error(`Core method '${methodAlias}' is not available.`);
      }

      if (dataTransformationFn) {
        const originalCallback = operationArgs[operationArgs.length - 1];
        if (!TypeEvaluator.isExecutable(originalCallback)) {
          throw new Error(`Last argument for '${methodAlias}' must be a callback.`);
        }
        operationArgs[operationArgs.length - 1] = (code, err, stats, data) => {
          dataTransformationFn(code, err, stats, data, originalCallback);
        };
      }
      return actualNativeMethod.apply(this.#coreClient, operationArgs);
    };
  }

  endSession = this.#proxyNativeMethod('close');
  asyncCreateEntry = this.#proxyNativeMethod('a_create');
  asyncCheckEntryExistence = this.#proxyNativeMethod('a_exists');
  asyncCheckEntryExistenceWithWatch = this.#proxyNativeMethod('aw_exists');

  asyncRetrieveEntryData = this.#proxyNativeMethod('a_get', (code, err, stats, data, originalCallback) => {
    if (data && this.#dataFormat) {
      data = data.toString(this.#dataFormat);
    }
    originalCallback(code, err, stats, data);
  });

  asyncRetrieveEntryDataWithWatch = this.#proxyNativeMethod('aw_get', (code, err, stats, data, originalCallback) => {
    if (data && this.#dataFormat) {
      data = data.toString(this.#dataFormat);
    }
    originalCallback(code, err, stats, data);
  });

  asyncListChildEntries = this.#proxyNativeMethod('a_get_children');
  asyncListChildEntriesWithWatch = this.#proxyNativeMethod('aw_get_children');
  asyncListChildEntriesWithStats = this.#proxyNativeMethod('a_get_children2');
  asyncListChildEntriesWithStatsAndWatch = this.#proxyNativeMethod('aw_get_children2');
  asyncUpdateEntryData = this.#proxyNativeMethod('a_set');
  asyncDeleteEntry = this.#proxyNativeMethod('a_delete_');
  asyncGetEntryAcl = this.#proxyNativeMethod('a_get_acl');
  asyncSetEntryAcl = this.#proxyNativeMethod('a_set_acl');
  addAuthCredentials = this.#proxyNativeMethod('add_auth');

  async ensureFullPath(targetNodePath, finalCallback) {
    if (this.#debugOutput) {
      this.#debugOutput(`Initiating full path creation for: ${objectInspector(targetNodePath)}`);
    }

    const adjustedPath = pathAdjust(targetNodePath);
    const pathParts = adjustedPath.split('/').filter(part => part.length > 0);

    let currentSegmentPath = '';
    for (const segment of pathParts) {
      currentSegmentPath = pathAdjust(`${currentSegmentPath}/${segment}`);
      try {
        await this.#createNodeIfNeeded(currentSegmentPath);
      } catch (operationError) {
        if (finalCallback) return finalCallback(operationError);
        throw operationError;
      }
    }
    if (finalCallback) return finalCallback(null, true);
    return true;
  }

  async #createNodeIfNeeded(nodeLocation) {
    return new Promise((resolve, reject) => {
      const defaultPayload = Buffer.from('default_payload_for_node');
      const creationFlags = 0;

      this.asyncCreateEntry(nodeLocation, defaultPayload, creationFlags, (code, err, createdNodeIdentifier) => {
        if (code === ZkOperationCodes.ZNODEEXISTS) {
          return resolve();
        }
        if (code !== 0) {
          return reject(new Error(`Zookeeper Node Creation Failed: code=${code} - ${err}`));
        }
        return resolve();
      });
    });
  }
}

module.exports = ZkConnectionManager;
module.exports.ZkEventAliases = ZkEventAliases;
module.exports.ZkOperationCodes = ZkOperationCodes;