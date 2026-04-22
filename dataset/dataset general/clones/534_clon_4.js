const testResults = [];
const currentTestSuite = [];
let setupFn = null;
let teardownFn = null;

function assertEqual(actual, expected, message = 'Assertion failed: values are not equal') {
  if (actual !== expected) {
    throw new Error(`${message}. Expected: ${expected}, Actual: ${actual}`);
  }
}

function assertDeepEqual(actual, expected, message = 'Assertion failed: objects are not deeply equal') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

function assertDefined(value, message = 'Assertion failed: value is undefined') {
  if (typeof value === 'undefined') {
    throw new Error(message);
  }
}

function assertUndefined(value, message = 'Assertion failed: value is defined') {
  if (typeof value !== 'undefined') {
    throw new Error(message);
  }
}

function assertTrue(value, message = 'Assertion failed: value is not true') {
  if (value !== true) {
    throw new Error(message);
  }
}

function assertFalse(value, message = 'Assertion failed: value is not false') {
  if (value !== false) {
    throw new Error(message);
  }
}

function TestGroup(name, fn) {
  currentTestSuite.push(name);
  fn();
  currentTestSuite.pop();
}

async function TestCase(name, fn) {
  const fullTestName = currentTestSuite.join(' > ') + ' > ' + name;
  let success = false;
  let error = null;

  try {
    if (setupFn) await setupFn();
    await fn();
    success = true;
  } catch (e) {
    error = e;
  } finally {
    if (teardownFn) await teardownFn();
  }

  testResults.push({ name: fullTestName, success, error });
}

function SetupRoutine(fn) {
  setupFn = fn;
}

function TeardownRoutine(fn) {
  teardownFn = fn;
}

function parseDataString(data) {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }
  return data;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function hasProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

class SimulatedHttpRequest {
  constructor() {
    this.whenRules = [];
    this.expectRules = [];
    this.activeRequests = [];
    this.jsonpCounter = 0;
  }

  when(method, urlPattern) {
    const rule = { method: method.toUpperCase(), urlPattern };
    this.whenRules.push(rule);
    return {
      respond: (statusOrFn, data, headers) => {
        if (typeof statusOrFn === 'function') {
          rule.responseFn = statusOrFn;
        } else {
          rule.responseFn = () => [statusOrFn, data, headers];
        }
      }
    };
  }

  expect(method, urlPattern) {
    const expectation = { method: method.toUpperCase(), urlPattern, resolved: false };
    this.expectRules.push(expectation);
  }

  request(method, url, data, headers) {
    const requestMethod = method.toUpperCase();
    const requestData = data;
    const requestHeaders = headers;

    return new Promise((resolve, reject) => {
      this.activeRequests.push({ requestMethod, url, requestData, requestHeaders, resolve, reject });
    });
  }

  flush() {
    const requestsToFlush = [...this.activeRequests];
    this.activeRequests = [];

    requestsToFlush.forEach(({ requestMethod, url, requestData, requestHeaders, resolve, reject }) => {
      let matchedExpectation = null;
      for (let i = 0; i < this.expectRules.length; i++) {
        const exp = this.expectRules[i];
        if (!exp.resolved && exp.method === requestMethod && this.matchUrl(exp.urlPattern, url)) {
          matchedExpectation = exp;
          exp.resolved = true;
          break;
        }
      }

      if (this.expectRules.length > 0 && !matchedExpectation) {
        return reject(new Error(`No matching expectation for ${requestMethod} ${url}`));
      }

      let matchedWhenRule = null;
      for (let i = this.whenRules.length - 1; i >= 0; i--) {
        const rule = this.whenRules[i];
        if (rule.method === requestMethod && this.matchUrl(rule.urlPattern, url)) {
          matchedWhenRule = rule;
          break;
        }
      }

      if (matchedWhenRule) {
        const [status, responseData, responseHeaders] = matchedWhenRule.responseFn(requestMethod, url, requestData, requestHeaders);
        if (status >= 200 && status < 300) {
          resolve({ status, data: parseDataString(responseData), headers: responseHeaders });
        } else {
          reject({ status, data: parseDataString(responseData), headers: responseHeaders });
        }
      } else if (!matchedExpectation) {
        return reject(new Error(`No matching 'when' rule for ${requestMethod} ${url}`));
      } else {
          return reject(new Error(`Expected request for ${requestMethod} ${url} but no response rule was provided.`));
      }
    });
  }

  matchUrl(pattern, url) {
    if (typeof pattern === 'string') {
      return pattern === url;
    }
    if (pattern instanceof RegExp) {
      return pattern.test(url);
    }
    return false;
  }

  verifyNoOutstandingExpectation() {
    const outstanding = this.expectRules.filter(exp => !exp.resolved);
    if (outstanding.length > 0) {
      throw new Error(`Outstanding expectations: ${outstanding.map(exp => `${exp.method} ${exp.urlPattern}`).join(', ')}`);
    }
  }

  verifyNoOutstandingRequest() {
    if (this.activeRequests.length > 0) {
      throw new Error(`Outstanding requests: ${this.activeRequests.map(req => `${req.requestMethod} ${req.url}`).join(', ')}`);
    }
  }

  whenJSONP(urlPattern) {
      return this.when('JSONP', urlPattern);
  }

  expectJSONP(urlPattern) {
      this.expect('JSONP', urlPattern);
  }

  requestJSONP(url) {
      this.jsonpCounter++;
      const callbackName = `angular.callbacks._${this.jsonpCounter}`; // Mimic Angular's JSONP callback
      const jsonpUrl = `${url}?callback=${callbackName}`;
      return this.request('JSONP', jsonpUrl);
  }
}

class ResourceInstance {
  constructor(client, config, path, id = null, parent = null, isCollection = false) {
    this._resourceClient = client;
    this._config = { ...config };
    this._path = path;
    this._id = id;
    this._parent = parent;
    this._isCollection = isCollection;
    this._internalProps = ['_path', '_id', '_parent', '_resourceClient', '_config', '_isCollection', '_internalProps', '_extended'];
  }

  _buildUrl(extraPath = '') {
    let urlSegments = [];
    let current = this;
    while (current) {
      if (current._path) {
        urlSegments.unshift(current._path);
      }
      if (current._id !== null) {
        urlSegments.unshift(current._id);
      }
      current = current._parent;
    }
    let url = '/' + urlSegments.join('/');
    if (extraPath) {
        url += '/' + extraPath;
    }
    url = url.replace(/\/\//g, '/');

    if (this._config.requestSuffix && !url.includes('.')) {
        url += this._config.requestSuffix;
    }
    return url;
  }

  _appendParams(url, params) {
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    return queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url;
  }

  _makeRequest(method, extraPath = '', data = null, params = {}, headers = {}) {
    const fullUrl = this._buildUrl(extraPath);
    const urlWithParams = this._appendParams(fullUrl, params);

    let currentData = data;
    let currentHeaders = { ...headers };

    this._config.requestInterceptors.forEach(interceptor => { currentData = interceptor(currentData); });
    this._config.fullRequestInterceptors.forEach(interceptor => {
      const result = interceptor(currentData, method, urlWithParams, currentHeaders, params);
      currentData = result.element || currentData;
      currentHeaders = result.headers || currentHeaders;
    });

    let requestActualPromise;
    if (this._config.jsonpEnabled && (method === 'GET')) { // Only GET can be JSONP
        requestActualPromise = this._resourceClient.http.requestJSONP(urlWithParams);
    } else {
        requestActualPromise = this._resourceClient.http.request(method, urlWithParams, currentData, currentHeaders);
    }

    const promiseWrapper = {
      then: (onFulfilled, onRejected) => {
        return requestActualPromise.then(response => {
          let finalData = response.data;

          this._config.responseInterceptors.forEach(interceptor => {
            finalData = interceptor(finalData, response.status, response.headers);
          });

          if (this._config.transformOnlyServerElements === false || (this._config.transformOnlyServerElements === true && finalData)) {
              const modelName = this._path;
              if (Array.isArray(finalData)) {
                  finalData = finalData.map(item => this._resourceClient._applyModelExtension(modelName, item, this._config, this));
              } else if (typeof finalData === 'object' && finalData !== null) {
                  finalData = this._resourceClient._applyModelExtension(modelName, finalData, this._config, this);
              }
          }

          if (this._isCollection) {
              promiseWrapper.$object.splice(0, promiseWrapper.$object.length, ...finalData);
              this._resourceClient.restangularizeCollection(this._parent, promiseWrapper.$object, this._path);
          } else {
              Object.assign(promiseWrapper.$object, finalData);
              this._resourceClient.restangularizeElement(this._parent, promiseWrapper.$object, this._path);
          }

          return onFulfilled ? onFulfilled(finalData) : finalData;
        }, onRejected);
      },
      catch: (onRejected) => {
        return promiseWrapper.then(null, onRejected);
      },
      finally: (onFinally) => {
          return promiseWrapper.then(onFinally, onFinally);
      },
      $object: this._isCollection ? [] : {}
    };

    return promiseWrapper;
  }

  get(params = {}, headers = {}) { return this._makeRequest('GET', '', null, params, headers); }
  getList(params = {}, headers = {}) { return this._makeRequest('GET', '', null, params, headers); }
  post(data, params = {}, headers = {}) { return this._makeRequest('POST', '', data, params, headers); }
  put(data, params = {}, headers = {}) { return this._makeRequest('PUT', '', data, params, headers); }
  remove(params = {}, headers = {}) { return this._makeRequest('DELETE', '', null, params, headers); }
  head(params = {}, headers = {}) { return this._makeRequest('HEAD', '', null, params, headers); }
  trace(params = {}, headers = {}) { return this._makeRequest('TRACE', '', null, params, headers); }
  options(params = {}, headers = {}) { return this._makeRequest('OPTIONS', '', null, params, headers); }

  customGET(path, params = {}, headers = {}) { return this._makeRequest('GET', path, null, params, headers); }
  customGETLIST(path, params = {}, headers = {}) { return this._makeRequest('GET', path, null, params, headers); }
  customPUT(data, path = '', params = {}, headers = {}) { return this._makeRequest('PUT', path, data, params, headers); }
  customDELETE(path = '', params = {}, headers = {}) { return this._makeRequest('DELETE', path, null, params, headers); }

  getCanonicalPath() { return this._buildUrl(); }
  getLinkPath() { return this._buildUrl(); }

  one(path, id) { return new ResourceInstance(this._resourceClient, this._config, path, id, this, false); }
  all(path) { return new ResourceInstance(this._resourceClient, this._config, path, null, this, true); }
}

class ResourceClient {
  constructor(httpMock) {
    this.http = httpMock;
    this.config = {
      requestInterceptors: [],
      responseInterceptors: [],
      fullRequestInterceptors: [],
      modelTransformers: {},
      transformOnlyServerElements: false,
      jsonpEnabled: false,
      requestSuffix: '',
      useCanonicalId: false,
    };
  }

  all(path) { return new ResourceInstance(this, this.config, path, null, null, true); }
  one(path, id) { return new ResourceInstance(this, this.config, path, id, null, false); }
  several(path, ...ids) {
    const idString = ids.join(',');
    return new ResourceInstance(this, this.config, path, idString, null, true);
  }

  addRequestInterceptor(fn) { this.config.requestInterceptors.push(fn); }
  addResponseInterceptor(fn) { this.config.responseInterceptors.push(fn); }
  addFullRequestInterceptor(fn) { this.config.fullRequestInterceptors.push(fn); }

  extendModel(modelName, transformerFn) {
    this.config.modelTransformers[modelName] = transformerFn;
  }

  _applyModelExtension(modelName, item, currentConfig, resourceInstance) {
    if (this.config.modelTransformers[modelName]) {
      if (typeof item === 'object' && item !== null && !item._extended) {
        const extendedItem = this.config.modelTransformers[modelName](item);
        extendedItem._extended = true;
        this.restangularizeElement(resourceInstance._parent, extendedItem, modelName);
        return extendedItem;
      }
    }
    return item;
  }

  setTransformOnlyServerElements(value) { this.config.transformOnlyServerElements = value; }
  setJsonp(value) { this.config.jsonpEnabled = value; }
  setRequestSuffix(suffix) { this.config.requestSuffix = suffix; }
  setUseCannonicalId(value) { this.config.useCanonicalId = value; }

  withConfig(configFn) {
    const newClient = new ResourceClient(this.http);
    newClient.config = deepClone(this.config);
    configFn(newClient);
    return newClient;
  }

  restangularizeElement(parent, element, modelName) {
    if (typeof element !== 'object' || element === null || element._extended) return element;

    element._extended = true;

    const tempResource = new ResourceInstance(this, this.config, modelName, element.id, parent, false);
    const methodsToAddElement = ['get', 'put', 'remove', 'head', 'trace', 'options', 'customGET', 'customPUT', 'customDELETE', 'getLinkPath', 'one', 'all'];
    methodsToAddElement.forEach(methodName => {
        if (typeof tempResource[methodName] === 'function') {
            element[methodName] = tempResource[methodName].bind(element);
        }
    });

    element._path = modelName;
    element._id = element.id;
    element._parent = parent;
    element._resourceClient = this;
    element._config = this.config;
    element._isCollection = false;

    return element;
  }

  restangularizeCollection(parent, collection, modelName) {
    if (!Array.isArray(collection) || collection._extended) return collection;

    collection._extended = true;

    collection.forEach(item => this.restangularizeElement(collection, item, modelName));

    const tempResource = new ResourceInstance(this, this.config, modelName, null, parent, true);
    const methodsToAdd = ['get', 'getList', 'post', 'put', 'remove', 'head', 'trace', 'options', 'customGET', 'customGETLIST', 'customPUT', 'customDELETE', 'getLinkPath', 'one', 'all', 'several'];
    methodsToAdd.forEach(methodName => {
        if (typeof tempResource[methodName] === 'function') {
            collection[methodName] = tempResource[methodName].bind(collection);
        }
    });

    collection._path = modelName;
    collection._id = null;
    collection._parent = parent;
    collection._resourceClient = this;
    collection._config = this.config;
    collection._isCollection = true;

    return collection;
  }

  stripRestangular(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.stripRestangular(item));
    }
    if (typeof obj === 'object' && obj !== null) {
      const newObj = {};
      const internalProps = new ResourceInstance(this, {}, '', '')._internalProps;
      for (const key in obj) {
        if (hasProperty(obj, key) && !internalProps.includes(key) && typeof obj[key] !== 'function' && !key.startsWith('_')) {
          newObj[key] = this.stripRestangular(obj[key]);
        }
      }
      return newObj;
    }
    return obj;
  }

  copy(obj) { return deepClone(obj); }
}

let testClient, mockHttp;
let accountData, notificationFeed, newEntry;
let clientDataCollections, clientDataItemZero, clientDataItemOne;

TestGroup("APIClientSimulation", function() {
  SetupRoutine(async function() {
    mockHttp = new SimulatedHttpRequest();
    testClient = new ResourceClient(mockHttp);

    accountData = [
      {id: 0, user: "Martin ", amount: 42, transactions: []},
      {id: 1, user: "Paul", amount: 3.1416, transactions: [{from: "Martin", amount: 3, id: 0}, {from: "Anonymous", amount: 0.1416, id:1}]}
    ];

    newEntry = {id: 44, user: "First User", amount: 45, transactions: []};
    notificationFeed = [{id: 23, name: "Gonto"}, {id: 45, name: "John"}];

    mockHttp.when("HEAD", "/accounts").respond(200);
    mockHttp.when("TRACE", "/accounts").respond(200);
    mockHttp.when("OPTIONS", "/accounts").respond(200);

    mockHttp.when("GET", "/accounts").respond(200, accountData);
    mockHttp.when("JSONP", /\/accounts\?callback=.*/).respond(200, accountData);
    mockHttp.when("GET", "/accounts/0,1").respond(200, accountData);
    mockHttp.when("GET", "/accounts/messages").respond(200, notificationFeed);
    mockHttp.when("GET", "/accounts/1/message").respond(200, notificationFeed[0]);
    mockHttp.when("GET", "/accounts/1/messages").respond(200, notificationFeed);
    mockHttp.when("GET", "/accounts/0").respond(200, accountData[0]);
    mockHttp.when("GET", "/accounts/1").respond(200, accountData[1]);
    mockHttp.when("JSONP", /\/accounts\/1\?callback=.*/).respond(200, accountData[1]);
    mockHttp.when("GET", "/accounts/1/transactions").respond(200, accountData[1].transactions);
    mockHttp.when("GET", "/accounts/1/transactions/1").respond(200, accountData[1].transactions[1]);

    mockHttp.when("GET", "http://accounts.com/all").respond(200, accountData);

    mockHttp.when("POST", "/accounts").respond(function(method, url, data) {
      let incomingData = parseDataString(data);
      incomingData.fromServer = true;
      return [201, JSON.stringify(incomingData), ""];
    });

    mockHttp.when("POST", "/accounts/1/transactions").respond(201, "", "");
    mockHttp.when("DELETE", "/accounts/1/transactions/1").respond(200, "", "");
    mockHttp.when("DELETE", "/accounts/1").respond(200, "", "");
    mockHttp.when("PUT", "/accounts/1").respond(function(method, url, data) {
      accountData[1] = parseDataString(data);
      return [201, data, ""];
    });

    clientDataCollections = testClient.all("accounts");
    clientDataItemZero = testClient.one("accounts", 0);
    clientDataItemOne = testClient.one("accounts", 1);
  });

  TeardownRoutine(function() {
    mockHttp.verifyNoOutstandingExpectation();
    mockHttp.verifyNoOutstandingRequest();
  });

  TestGroup("Interceptors", function() {
    TestCase("Should add multiple request and response interceptors", async function() {
      testClient.addRequestInterceptor(function(elem) {
        elem.firstRequestInterceptor = true;
        return elem;
      });
      testClient.addRequestInterceptor(function(elem) {
        elem.secondRequestInterceptor = true;
        return elem;
      });
      testClient.addFullRequestInterceptor(function(elem) {
        elem.thirdRequestInterceptor = true;
        return {
          element: elem
        };
      });

      testClient.addResponseInterceptor(function(elem) {
        elem.firstResponseInterceptor = true;
        return elem;
      });

      testClient.addResponseInterceptor(function(elem) {
        elem.secondResponseInterceptor = true;
        return elem;
      });

      mockHttp.when("POST", "/list").respond(function(method, url, data, headers) {
        var elem = parseDataString(data);
        assertDefined(elem.firstRequestInterceptor);
        assertDefined(elem.secondRequestInterceptor);
        assertDefined(elem.thirdRequestInterceptor);
        return [200, elem, ""];
      });

      mockHttp.expect("POST", '/list');

      const responsePromise = testClient.all('list').post({name: "Gonto"});
      await responsePromise.then(function(elem) {
        assertDefined(elem.firstResponseInterceptor);
        assertDefined(elem.secondResponseInterceptor);
      });

      mockHttp.flush();
    });
  });

  TestGroup("Transformers", function() {
    TestCase("Should decorate element both on server and local by default", async function() {
      testClient.extendModel('accounts', function(account) {
        account.extended = function() {return true;}
        return account;
      });

      const responsePromise = testClient.one('accounts', 1).get();
      await responsePromise.then(function(account) {
        assertDefined(account.extended);
      });

      var local = {};
      testClient.restangularizeElement(null, local, 'accounts');
      assertDefined(local.extended);

      mockHttp.flush();
    });

    TestCase("Should decorate element only server if config set", async function() {
      testClient.extendModel('accounts', function(account) {
        account.extended = function() {return true;}
        return account;
      });

      testClient.setTransformOnlyServerElements(true)

      const responsePromise = testClient.one('accounts', 1).get();
      await responsePromise.then(function(account) {
        assertDefined(account.extended);
      });

      var local = {};
      testClient.restangularizeElement(null, local, 'accounts');
      assertUndefined(local.extended);

      mockHttp.flush();
    });
  });

  TestGroup("With Url", function() {
    TestCase("Shouldn't add suffix to URL", async function() {
      var suffixClient = testClient.withConfig(function(clientConfigurer) {
        clientConfigurer.setRequestSuffix('.json');
      });

      mockHttp.expect("GET", 'http://accounts.com/all');
      await suffixClient.all('accounts').all('http://accounts.com/all').getList();
      mockHttp.flush();
    });
  });

  TestGroup("JSONp", function() {
    TestCase("should work for get", async function() {
      testClient.setJsonp(true);
      testClient.one('accounts', 1).get();

      mockHttp.expectJSONP(/\/accounts\/1\?callback=.*/);
      mockHttp.flush();
    });

    TestCase("should work for getList", async function() {
      testClient.setJsonp(true);
      testClient.all('accounts').getList();

      mockHttp.expectJSONP(/\/accounts\?callback=.*/);
      mockHttp.flush();
    });

    TestCase("shouldn't override post", async function() {
      testClient.setJsonp(true);
      clientDataCollections.post({id: 2, user: "Someone"});

      mockHttp.expect("POST", '/accounts');
      mockHttp.flush();
    });
  });

  TestGroup("Local data", function() {
    TestCase("Should restangularize a collection OK", function() {
      var collection = deepClone(accountData);

      testClient.restangularizeCollection(null, collection, 'accounts');

      assertTrue(hasProperty(collection, 'get')); // get method should be added
      assertTrue(hasProperty(collection[0], 'get')); // get method should be added to items

      assertEqual(collection.getLinkPath(), '/accounts');
      assertEqual(collection[0].getLinkPath(), '/accounts/0');
    });
  });

  TestGroup("$object", function() {
    TestCase("Should work for single get", async function() {
      var promise = testClient.one('accounts', 1).get();
      var obj = promise.$object;
      assertDefined(obj);
      assertUndefined(obj.amount);

      mockHttp.flush();

      assertEqual(obj.amount, 3.1416);
    });

    TestCase("Should be restangularized by default", async function() {
      testClient.extendModel('accounts', function(account) {
        account.extended = function() {return true;}
        return account;
      });

      var promise = testClient.one('accounts', 1).get();
      var obj = promise.$object;
      assertDefined(obj);
      assertDefined(obj.extended);

      mockHttp.flush();
    });

    TestCase("Should work for collection get", async function() {
      var promise = testClient.all('accounts').getList();
      var list = promise.$object;
      assertDefined(list);
      assertEqual(list.length, 0);

      mockHttp.flush();

      assertEqual(list.length, 2);
      assertEqual(list[1].amount, 3.1416);
    });
  });

  TestGroup("ALL", function() {
    TestCase("getList() should return an array of items", async function() {
      const responsePromise = clientDataCollections.getList();
      await responsePromise.then(function(accounts) {
        assertDeepEqual(testClient.stripRestangular(accounts), testClient.stripRestangular(accountData));
      });

      mockHttp.flush();
    });

    TestCase("several getList() should return an array of items", async function() {
      mockHttp.expect("GET", '/accounts/0,1');
      const responsePromise = testClient.several("accounts", 0, 1).getList();
      await responsePromise.then(function(accounts) {
        assertDeepEqual(testClient.stripRestangular(accounts), testClient.stripRestangular(accountData));
      });

      mockHttp.flush();
    });

    TestCase("several remove() should work", async function() {
      mockHttp.expect("DELETE", '/accounts/0,1');
      testClient.several("accounts", 0, 1).remove();

      mockHttp.flush();
    });

    TestCase("get(id) should return the item with given id", async function() {
      const responsePromise = clientDataCollections.get(0);
      await responsePromise.then(function(account) {
        assertDeepEqual(testClient.stripRestangular(account), testClient.stripRestangular(accountData[0]));
      });

      mockHttp.flush();
    });

    TestCase('uses all to get the list without parameters', async function() {
      testClient.one('accounts', 1).all('messages').getList();
      mockHttp.expect("GET", '/accounts/1/messages');
      mockHttp.flush();
    });

    TestCase("Custom GET methods should work", async function() {
      const responsePromise = clientDataCollections.customGETLIST("messages");
      await responsePromise.then(function(msgs) {
        assertDeepEqual(testClient.stripRestangular(msgs), testClient.stripRestangular(notificationFeed));
      });

      mockHttp.flush();
    });

    TestCase("post() should add a new item", async function() {
     const responsePromise = clientDataCollections.post({id: 2, user: "Someone"});
     await responsePromise.then(function() {
       assertEqual(accountData.length, 2); // This assertion in original tests the mock, not the actual model
     });

    mockHttp.expect("POST", '/accounts');
    mockHttp.flush();
   });

    TestCase("post() should work with arrays", async function() {
     const responsePromise = testClient.all('places').post([{name: "Gonto"}, {name: 'John'}]);
     await responsePromise.then(function(value) {
       assertEqual(value.length, 2);
     });

    mockHttp.when("POST", '/places').respond(function(method, url, data) {
      return [201, parseDataString(data), ""];
    });

    mockHttp.flush();
   });

    TestCase("post() should add a new item with data and return the data from the server", async function() {
     const responsePromise = clientDataCollections.post(newEntry);
     await responsePromise.then(function(added) {
       assertTrue(added.fromServer);
       assertEqual(added.id, newEntry.id);
     });

    mockHttp.expect("POST", '/accounts');
    mockHttp.flush();
   });

    TestCase("Doing a post and then other operation (delete) should call right URLs", async function() {
      const responsePromise = clientDataCollections.post(newEntry);
      await responsePromise.then(function(added) {
        added.remove();
        mockHttp.expect("DELETE", '/accounts/44');
      });

      mockHttp.flush();
    });

    TestCase("Doing a post to a server that returns no element will return undefined", async function() {
      const accountsPromise = clientDataCollections.getList();
      await accountsPromise.then(async function(accounts) {
        var newTransaction = {id: 1, name: "Gonto"};
        const transactionPromise = accounts[1].post('transactions', newTransaction);
        await transactionPromise.then(function(transaction) {
          assertUndefined(transaction);
        });
      });

      mockHttp.flush();
    });

    TestCase("head() should safely return", async function() {
      const responsePromise = clientDataCollections.head();
      await responsePromise.then(function() {
        assertTrue(true);
      });
      mockHttp.flush();
    });

    TestCase("trace()  should safely return", async function() {
      const responsePromise = clientDataCollections.trace();
      await responsePromise.then(function() {
        assertTrue(true);
      });

      mockHttp.flush();
    });

    TestCase("customPUT should work", async function() {
      mockHttp.expect("PUT", '/accounts/hey');
      clientDataCollections.customPUT({key: 'value'}, 'hey');

      mockHttp.flush();
    });

    TestCase("options()  should safely return", async function() {
      const responsePromise = clientDataCollections.options();
      await responsePromise.then(function() {
        assertTrue(true);
      });

      mockHttp.flush();
    });

     TestCase("getList() should correctly handle params after customDELETE", async function() {
      mockHttp.expect("GET", '/accounts?foo=1');
      const firstGetPromise = clientDataCollections.getList({foo: 1});
      await firstGetPromise.then(async function(){
        mockHttp.expect("DELETE", '/accounts?id=1');
        const deletePromise = clientDataCollections.customDELETE('', {id: 1});
        return deletePromise;
      }).then(async function() {
          mockHttp.expect("GET", '/accounts?foo=1');
          const secondGetPromise = clientDataCollections.getList({foo: 1});
          return secondGetPromise;
        }).then(function(accounts) {
          assertDeepEqual(testClient.stripRestangular(accounts), testClient.stripRestangular(accountData));
        });

      mockHttp.flush();
    });
  });

  TestGroup("ONE", function() {
    TestCase("get() should return a JSON item", async function() {
      const responsePromise = clientDataItemOne.get();
      await responsePromise.then(function(account) {
        assertDeepEqual(testClient.stripRestangular(account), testClient.stripRestangular(accountData[1]));
      });

      mockHttp.flush();
    });

    TestCase("Should make RequestLess connections with one", async function() {
      const responsePromise = clientDataItemOne.one("transactions", 1).get();
      await responsePromise.then(function(transaction) {
        assertDeepEqual(testClient.stripRestangular(transaction), testClient.stripRestangular(accountData[1].transactions[1]));
      });

      mockHttp.flush();
    });

    TestCase("Should make RequestLess connections with all", async function() {
      const responsePromise = clientDataItemOne.all("transactions").getList();
      await responsePromise.then(function(transactions) {
        assertDeepEqual(testClient.stripRestangular(transactions), testClient.stripRestangular(accountData[1].transactions));
      });

      mockHttp.flush();
    });

    TestCase("Custom GET methods should work", async function() {
      const responsePromise = clientDataItemOne.customGET("message");
      await responsePromise.then(function(msg) {
        assertDeepEqual(testClient.stripRestangular(msg), testClient.stripRestangular(notificationFeed[0]));
      });

      mockHttp.flush();
    });

    TestCase("put() should update the value", async function() {
      const getPromise = clientDataItemOne.get();
      await getPromise.then(async function(account) {
        account.amount = 1.618;
        const putPromise = account.put();
        mockHttp.expect("PUT", "/accounts/1");
        await putPromise.then(function(newAc) {
          assertEqual(accountData[1].amount, 1.618);
          newAc.remove();
          mockHttp.expect("DELETE", "/accounts/1");
        });
      });

      mockHttp.flush();
    });

    TestCase("should return an array when accessing a subvalue", async function() {
      const getPromise = clientDataItemOne.get();
      await getPromise.then(async function(account) {
        const getListPromise = account.getList("transactions");
        await getListPromise.then(function(transactions) {
          assertDeepEqual(testClient.stripRestangular(transactions), testClient.stripRestangular(accountData[1].transactions));
        });
      });

      mockHttp.flush();
    });
  });

  TestGroup("COPY", function() {
    TestCase("should copy an object and 'this' should reference the copied object", function() {
      var copiedAccount = testClient.copy(accountData[0]);
      var that;

      copiedAccount.user = "Copied string";
      assertFalse(copiedAccount === accountData[0]);

      copiedAccount.getLinkPath = function() { // Mocking the method to capture 'this'
        that = this;
        return "/accounts/0";
      };

      copiedAccount.getLinkPath();
      assertEqual(that, copiedAccount);
    });
  });

  TestGroup("getLinkPath", function() {
    TestCase("should return the generated URL when you chain ResourceClient methods together", function() {
      var clientSpaces = testClient.one("accounts",123).one("buildings", 456).all("spaces");
      assertEqual(clientSpaces.getLinkPath(), "/accounts/123/buildings/456/spaces");
    });
  });

  TestGroup("getLinkPath with useCanonicalId set to true", function() {
    TestCase("should return the generated URL when you chain ResourceClient methods together", function() {
      var R = testClient.withConfig(function(config) {
        config.setUseCannonicalId(true);
      });
      var clientSpaces = R.one("accounts",123).one("buildings", 456).all("spaces");
      assertEqual(clientSpaces.getLinkPath(), "/accounts/123/buildings/456/spaces");
    });
  });
});