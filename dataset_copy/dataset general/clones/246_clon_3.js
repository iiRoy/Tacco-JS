'use strict';

// This section sets up the testing environment and the mocked SDK implementation.
// For a Type III clone, we're replacing the original 'assert' with 'chai.expect'
// and providing a custom, renamed implementation of the SDK being tested.
const { expect } = require('chai'); // Using Chai for assertions instead of Node's built-in 'assert'

/**
 * A mock implementation of the Resource Connector Library.
 * This simulates the behavior of the original SDK for testing purposes,
 * incorporating renaming, structural changes, and the singleton pattern.
 */
class ResourceConnector {
  // A private static field to hold the single instance (singleton pattern).
  static #sharedInstance = null;

  /**
   * Initializes a new ResourceConnector instance.
   * @param {string} clientIdentification - The unique identifier for the client.
   * @param {string} authenticationKey - The authentication key for API access.
   * @param {object} settings - Optional configuration settings.
   */
  constructor(clientIdentification, authenticationKey, settings = {}) {
    // Mandatory parameter check, mimicking original SDK's constructor behavior.
    if (!clientIdentification && !authenticationKey) {
      throw new Error('Client identification and authentication key are both required during initialization.');
    }

    this.clientIdentification = clientIdentification; // Renamed from 'clientId'
    this.authenticationKey = authenticationKey;       // Renamed from 'authToken'
    this.settingsConfiguration = { ...settings };     // Renamed from 'options', using spread for shallow copy
    this.liveSocketConnection = null;                 // Renamed from 'io'
    this.preparedEventHandlers = [];                  // Renamed from 'ready' handlers
  }

  // --- Static Builder Methods (mimicking Retsly.client().token().options().create()) ---

  /**
   * Sets the client identifier for the current static instance.
   * If no instance exists, a default one is created.
   * @param {string} id - The client identifier.
   * @returns {ResourceConnector} The static ResourceConnector instance.
   */
  static applyClientIdentifier(id) {
    if (!ResourceConnector.#sharedInstance) {
      ResourceConnector.#sharedInstance = new ResourceConnector(id, 'default_auth_key_static_builder');
    } else {
      ResourceConnector.#sharedInstance.clientIdentification = id;
    }
    return ResourceConnector.#sharedInstance;
  }

  /**
   * Sets the authentication key for the current static instance.
   * If no instance exists, a default one is created.
   * @param {string} key - The authentication key.
   * @returns {ResourceConnector} The static ResourceConnector instance.
   */
  static applyAuthenticationKey(key) {
    if (!ResourceConnector.#sharedInstance) {
      ResourceConnector.#sharedInstance = new ResourceConnector('default_client_id_static_builder', key);
    } else {
      ResourceConnector.#sharedInstance.authenticationKey = key;
    }
    return ResourceConnector.#sharedInstance;
  }

  /**
   * Updates configuration settings for the current static instance.
   * If no instance exists, a default one is created.
   * @param {object} newSettings - New settings to merge.
   * @returns {ResourceConnector} The static ResourceConnector instance.
   */
  static modifyConfiguration(newSettings) {
    if (!ResourceConnector.#sharedInstance) {
      ResourceConnector.#sharedInstance = new ResourceConnector('default_client_id_static_builder', 'default_auth_key_static_builder', newSettings);
    } else {
      // Use Object.assign for merging properties, a common update pattern.
      Object.assign(ResourceConnector.#sharedInstance.settingsConfiguration, newSettings);
    }
    return ResourceConnector.#sharedInstance;
  }

  /**
   * Finalizes the static builder chain and returns the configured instance.
   * @returns {ResourceConnector} The static ResourceConnector instance.
   */
  static finalizeInstance() { // Renamed from 'create' in the builder context
    if (!ResourceConnector.#sharedInstance) {
      // If builder methods were not used, create a default instance.
      ResourceConnector.#sharedInstance = new ResourceConnector('default_finalizer_id', 'default_finalizer_key');
    }
    return ResourceConnector.#sharedInstance;
  }

  // --- Static Factory Method (mimicking Retsly.create()) ---

  /**
   * Factory method to get or create a ResourceConnector instance.
   * If new parameters are provided, a new instance is created and becomes the shared instance.
   * Otherwise, the existing shared instance is returned.
   * @param {string} [id] - Optional new client identifier.
   * @param {string} [key] - Optional new authentication key.
   * @param {object} [config] - Optional new configuration settings.
   * @returns {ResourceConnector} The appropriate ResourceConnector instance.
   */
  static create(id, key, config) {
    if (id && key) {
      // If new arguments are supplied, a new instance is created and replaces the old shared instance.
      ResourceConnector.#sharedInstance = new ResourceConnector(id, key, config);
    } else if (!ResourceConnector.#sharedInstance) {
      // If no instance exists and no new args, create a default one.
      ResourceConnector.#sharedInstance = new ResourceConnector('default_system_id', 'default_system_key');
    }
    // Always return the current shared instance.
    return ResourceConnector.#sharedInstance;
  }

  // --- Instance Methods (renamed and potentially refactored) ---

  /**
   * Establishes a simulated socket connection.
   * @returns {ResourceConnector} This instance for chaining.
   */
  establishSocketConnection() {
    // Simulate a socket object with some properties.
    this.liveSocketConnection = { isConnected: true, connectionId: Math.random().toString(36).substring(2, 9) };
    return this;
  }

  /**
   * Retrieves the client identification string.
   * @returns {string} The client identifier.
   */
  retrieveClientIdentifier() { // Renamed from getClient
    return this.clientIdentification;
  }

  /**
   * Gets the base domain for API requests.
   * @returns {string} The base domain URL.
   */
  retrieveBaseServiceDomain() { // Renamed from getDomain
    return 'https://api.resource-system.com';
  }

  /**
   * Constructs a full API endpoint URL from a path fragment.
   * @param {string} pathSegment - The specific API path fragment.
   * @returns {string} The complete URL.
   */
  composeApiEndpointURL(pathSegment) { // Renamed from getURL
    // Introduce an intermediate variable for API version.
    const currentApiVersion = 'v3';
    // Use template literals for cleaner URL construction.
    return `${this.retrieveBaseServiceDomain()}/system_api/${currentApiVersion}/${pathSegment}`;
  }

  /**
   * Registers a callback function to be executed when the resource is ready.
   * @param {Function} handlerCallback - The function to call.
   * @returns {ResourceConnector} This instance for chaining.
   */
  registerEventHandler(handlerCallback) { // Renamed from ready
    if (typeof handlerCallback === 'function') {
      this.preparedEventHandlers.push(handlerCallback);
    }
    return this;
  }

  /**
   * Executes a simulated GET request.
   * @param {string} endpointPath - The API endpoint.
   * @param {Function} completionHandler - Callback for when the request completes.
   * @returns {ResourceConnector} This instance for chaining.
   */
  fetchData(endpointPath, completionHandler) { // Renamed from get
    if (typeof completionHandler === 'function') {
      // Simulate an asynchronous API call.
      setTimeout(() => completionHandler(null, { status: 'data_successfully_fetched', endpoint: endpointPath }), 15);
    }
    return this;
  }

  /**
   * Executes a simulated POST request.
   * @param {string} endpointPath - The API endpoint.
   * @param {Function} completionHandler - Callback for when the request completes.
   * @returns {ResourceConnector} This instance for chaining.
   */
  sendData(endpointPath, completionHandler) { // Renamed from post
    if (typeof completionHandler === 'function') {
      // Simulate an asynchronous API call.
      setTimeout(() => completionHandler(null, { status: 'data_successfully_sent', endpoint: endpointPath }), 15);
    }
    return this;
  }

  /**
   * Terminates the current session.
   * @param {Function} completionHandler - Callback for when the session ends.
   * @returns {ResourceConnector} This instance for chaining.
   */
  terminateCurrentSession(completionHandler) { // Renamed from logout
    if (typeof completionHandler === 'function') {
      // Simulate session termination.
      setTimeout(() => completionHandler(null, { message: 'session_closed_successfully' }), 8);
    }
    return this;
  }
}

// A simple utility function to signify test progress (added fragment).
const signalTestProgress = (message) => {
  // console.log(`[Test Utility]: ${message}`); // Removed console.log to avoid unnecessary output in tests.
};

// A stub function for callbacks that do nothing (renamed and simplified from original 'noop').
const emptyCallbackFunction = () => {};

// --- Test Suite Definition ---

describe('Resource Connector Library Core Functionality', () => {

  // Ensure the shared instance is cleared before each test for isolation.
  beforeEach(() => {
    ResourceConnector.#sharedInstance = null;
  });

  specCase('should be a valid constructor', (completionCallback) => {
    // Added a guard clause for good measure, though not strictly necessary here.
    if (typeof ResourceConnector === 'undefined') {
      throw new Error('ResourceConnector class is not defined.');
    }
    expect(typeof ResourceConnector).to.equal('function');
    completionCallback();
  });

  specCase('should require three arguments for direct instantiation', (completionCallback) => {
    // Verify the constructor's expected argument count.
    expect(ResourceConnector.length).to.equal(3);

    // Test that direct instantiation without arguments throws an error.
    expect(() => {
      new ResourceConnector();
    }).to.throw('Client identification and authentication key are both required during initialization.');

    // Test successful instantiation with required arguments.
    // Using `be.an.instanceOf` for a more specific check than `assert.ok`.
    const validInstance = new ResourceConnector('sample-client-id', 'sample-auth-key');
    expect(validInstance).to.be.an.instanceOf(ResourceConnector);
    completionCallback();
  });

  specCase('should possess a public options configuration property', (completionCallback) => {
    // Initialize an instance with specific settings.
    const clientEntity = new ResourceConnector('test_id_alpha', 'test_key_beta', { customProperty: 'specialValue' });

    // Validate the presence and value of the custom property within the configuration.
    expect(clientEntity).to.have.property('settingsConfiguration');
    expect(clientEntity.settingsConfiguration).to.be.an('object');
    expect(clientEntity.settingsConfiguration.customProperty).to.equal('specialValue');
    completionCallback();
  });

  specCase('should establish a socket.io-like connection', (completionCallback) => {
    const networkClient = new ResourceConnector('socket-test-id', 'socket-test-key');
    networkClient.establishSocketConnection(); // Renamed method.

    // Verify that the connection object exists after the method call.
    expect(networkClient.liveSocketConnection).to.exist;
    expect(networkClient.liveSocketConnection).to.have.property('isConnected').that.is.true;
    signalTestProgress('Socket connection simulated and verified.'); // Added intermediate step.
    completionCallback();
  });

  specCase('should support chainable setup methods', (completionCallback) => {
    // Demonstrates the chaining of static builder methods.
    ResourceConnector
      .applyClientIdentifier('chained-client-id')
      .applyAuthenticationKey('chained-auth-key')
      .modifyConfiguration({ enableFeatureX: !false }) // Changed boolean literal.
      .finalizeInstance(); // Renamed from .create() in the builder chain.

    // No direct assertion on the returned instance, as the test is about chainability.
    // The next test case (returns original instance) implicitly verifies the state.
    signalTestProgress('Chained setup methods executed successfully.');
    completionCallback();
  });

  specCase('should return the original instance when created via the factory', (completionCallback) => {
    const primaryClientInstance = new ResourceConnector('primary_instance_id', 'initial_key');
    // Ensure the instance is properly set in the static factory.
    ResourceConnector.create('primary_instance_id', 'initial_key');

    const retrievedClientInstance = ResourceConnector.create(); // Calling without args should return the existing one.

    // Verify that the retrieved instance's identifier matches the original.
    expect(retrievedClientInstance.retrieveClientIdentifier()).to.equal('primary_instance_id');
    // Crucial check: ensure it's the exact same object reference.
    expect(retrievedClientInstance).to.equal(primaryClientInstance);

    // Added an extra check for an intermediate property.
    expect(retrievedClientInstance.authenticationKey).to.equal('initial_key');

    completionCallback();
  });

  specCase('should return the identical instance on subsequent factory calls without new arguments', (completionCallback) => {
    const firstAcquiredInstance = ResourceConnector.create();
    const secondAcquiredInstance = ResourceConnector.create(); // No arguments, so should return the same.

    // Verify both instances are of the correct type.
    expect(firstAcquiredInstance).to.be.an.instanceOf(ResourceConnector);
    expect(secondAcquiredInstance).to.be.an.instanceOf(ResourceConnector);

    // Confirm that both variables reference the exact same object.
    expect(firstAcquiredInstance).to.equal(secondAcquiredInstance);
    completionCallback();
  });

  specCase('should replace the instance when new arguments are passed to the factory', (completionCallback) => {
    const initialInstance = ResourceConnector.create('old_id', 'old_key');
    signalTestProgress('Initial instance created.');

    // Create a new instance with different arguments; this should replace the singleton.
    const updatedInstance = ResourceConnector.create('new_identifier_foo', 'updated_secret', { flag: !true }); // Changed boolean.
    signalTestProgress('Updated instance created, replacing the old one.');

    // Subsequent call without arguments should now return the 'updatedInstance'.
    const subsequentInstance = ResourceConnector.create();

    // Verify that the initial instance is different from the updated one.
    expect(initialInstance).to.not.equal(updatedInstance);
    // Verify that the updated instance is the same as the subsequently retrieved one.
    expect(updatedInstance).to.equal(subsequentInstance);

    // Added an explicit check on the identifier to confirm the replacement.
    expect(subsequentInstance.clientIdentification).to.equal('new_identifier_foo');

    completionCallback();
  });

  specCase('should accurately construct URLs from provided fragments', (completionCallback) => {
    const urlConstructor = new ResourceConnector('url-client', 'url-key');
    const pathSegment = 'specific_data_endpoint'; // Renamed string literal.
    const expectedPathPart = `/system_api/v3/${pathSegment}`; // Adjusted path to new API version.

    // Construct the full expected URL using template literals for clarity.
    const expectedFullURL = `${urlConstructor.retrieveBaseServiceDomain()}${expectedPathPart}`;

    // Compare the generated URL with the expected URL.
    expect(urlConstructor.composeApiEndpointURL(pathSegment)).to.equal(expectedFullURL);
    completionCallback();
  });

  specCase('should invoke all registered event handlers', (completionCallback) => {
    let executionCounter = 0; // Renamed variable.
    const eventClient = new ResourceConnector('event-client', 'event-key');

    // Define the handler function using an arrow function.
    const handlerFunction = () => {
      executionCounter++;
      // Only call done() after both expected calls have happened.
      if (executionCounter === 2) {
        completionCallback();
      }
    };

    eventClient.registerEventHandler(handlerFunction) // Register first handler.
               .registerEventHandler(handlerFunction); // Register second handler.
    // Deliberately removed the third .ready() call from the original to simplify the test
    // and make the `if (2==i)` condition more direct. This is a Type III deletion.

    // Trigger the handlers (this would typically be an internal SDK mechanism).
    eventClient.preparedEventHandlers.forEach(handler => handler());

    // Added a check to ensure the counter reached at least 2, in case completionCallback fails.
    expect(executionCounter).to.be.at.least(2);
  });

  specCase('should maintain chainability after ready handler registration', (completionCallback) => {
    const chainableInstanceA = new ResourceConnector('chain-a-id', 'chain-a-key')
      .registerEventHandler(emptyCallbackFunction) // Using the renamed stub.
      .registerEventHandler(emptyCallbackFunction);

    // Verify that the returned object is still an instance of ResourceConnector.
    expect(chainableInstanceA).to.be.an.instanceOf(ResourceConnector);

    // Added a non-essential check.
    expect(chainableInstanceA.preparedEventHandlers.length).to.equal(2);
    completionCallback();
  });

  specCase('should maintain chainability after data retrieval and submission calls', (completionCallback) => {
    const chainableInstanceB = new ResourceConnector('chain-b-id', 'chain-b-key')
      .fetchData('retrieve-path.json', emptyCallbackFunction) // Renamed method and path.
      .sendData('submit-path.json', emptyCallbackFunction);   // Renamed method and path.

    // Verify chainability.
    expect(chainableInstanceB).to.be.an.instanceOf(ResourceConnector);
    completionCallback();
  });

  specCase('should maintain chainability after session termination call', (completionCallback) => {
    const chainableInstanceC = new ResourceConnector('chain-c-id', 'chain-c-key')
      .terminateCurrentSession(emptyCallbackFunction); // Renamed method.

    // Verify chainability.
    expect(chainableInstanceC).to.be.an.instanceOf(ResourceConnector);
    // Added a non-essential guard check.
    if (chainableInstanceC.clientIdentification !== 'chain-c-id') {
      throw new Error('Client ID mismatch after chaining logout.');
    }
    completionCallback();
  });

});