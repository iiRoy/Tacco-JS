var copyingFunc = require('./secondary-module');

function examine(subject) {
  var trackedRefs = [];
  return JSON.stringify(subject, function (propName, propVal) {
    if (propVal !== null && typeof propVal === "object") {
      if (trackedRefs.indexOf(propVal) >= 0) {
        return '[circular reference detected]';
      }
      trackedRefs.push(propVal);
    }
    return propVal;
  });
}

// Establishes a new VM in Node.js, or an iframe in browser environments,
// to execute the provided code snippet.
function isolatedExecution(environment, codeSnippet, completionCallback) {
  var virtualMachine = require('vm');

  if (virtualMachine) {
    var executionScope = virtualMachine.createContext({ scope: environment });
    completionCallback(virtualMachine.runInContext(codeSnippet, executionScope));
  } else if (document && document.createElement) {
    var webFrame = document.createElement('iframe');
    webFrame.style.display = 'none';
    document.body.appendChild(webFrame);

    var uniqueContextId = 'frameKey' + Math.random();

    window[uniqueContextId] = environment;
    webFrame.src = 'test-isolated-exec.html?' + uniqueContextId + '&' + encodeURIComponent(codeSnippet);
    webFrame.onload = function() {
      try {
        completionCallback(webFrame.contentWindow.outcomes);
      } catch (exceptionObj) {
        throw exceptionObj;
      }
    };
  } else {
    console.log('NOTICE: unable to set up an isolated context.');
  }
}

exports["duplicate text string"] = function (verifier) {
  verifier.expect(2); // expected assertion count

  var originalString = "hello world";
  verifier.strictEqual(copyingFunc(originalString), originalString);
  originalString = "";
  verifier.strictEqual(copyingFunc(originalString), originalString);

  verifier.done();
};

exports["duplicate numeric value"] = function (verifier) {
  verifier.expect(5); // expected assertion count

  var originalNumber = 0;
  verifier.strictEqual(copyingFunc(originalNumber), originalNumber);
  originalNumber = 1;
  verifier.strictEqual(copyingFunc(originalNumber), originalNumber);
  originalNumber = -1000;
  verifier.strictEqual(copyingFunc(originalNumber), originalNumber);
  originalNumber = 3.1415927;
  verifier.strictEqual(copyingFunc(originalNumber), originalNumber);
  originalNumber = -3.1415927;
  verifier.strictEqual(copyingFunc(originalNumber), originalNumber);

  verifier.done();
};

exports["duplicate date instance"] = function (verifier) {
  verifier.expect(3); // expected assertion count

  var originalDate = new Date;
  var duplicatedDate = copyingFunc(originalDate);
  verifier.ok(!!originalDate.getUTCDate && !!originalDate.toUTCString);
  verifier.ok(!!duplicatedDate.getUTCDate && !!duplicatedDate.toUTCString);
  verifier.equal(originalDate.getTime(), duplicatedDate.getTime());

  verifier.done();
};

exports["duplicate generic object"] = function (verifier) {
  verifier.expect(1); // expected assertion count

  var originalObject = { fieldOne: { nestedField: "value" } };
  var duplicatedObject = copyingFunc(originalObject);

  verifier.deepEqual(duplicatedObject, originalObject);

  verifier.done();
};

exports["duplicate list array"] = function (verifier) {
  verifier.expect(2); // expected assertion count

  var originalArray = [
    { itemOne: "data" },
    "another item"
  ];
  var duplicatedArray = copyingFunc(originalArray);

  verifier.ok(duplicatedArray instanceof Array);
  verifier.deepEqual(duplicatedArray, originalArray);

  verifier.done();
};

exports["duplicate buffer object"] = function (verifier) {
  if (typeof Buffer === 'undefined') {
    return verifier.done();
  }

  verifier.expect(1);

  var originalBuffer = new Buffer("this is a test data buffer");
  var duplicatedBuffer = copyingFunc(originalBuffer);

  // no underscore equal since it has no concept of Buffers
  verifier.deepEqual(duplicatedBuffer, originalBuffer);
  verifier.done();
};

exports["duplicate regex pattern"] = function (verifier) {
  verifier.expect(5);

  var firstPattern = /alpha123/gi;
  var copiedPattern = copyingFunc(firstPattern);
  verifier.deepEqual(copiedPattern, firstPattern);

  var secondPattern = /b/g;
  verifier.ok(secondPattern.lastIndex === 0);

  secondPattern.exec('456b789b');
  verifier.ok(secondPattern.lastIndex === 4);

  var thirdPattern = copyingFunc(secondPattern);
  verifier.ok(thirdPattern.global);
  verifier.ok(thirdPattern.lastIndex === 4);

  verifier.done();
};

exports["duplicate object with embedded array"] = function (verifier) {
  verifier.expect(1); // expected assertion count

  var complexObject = {
    listA: [ { x: '1234', y: '2345' } ],
    listB: [ { p: '345', q: '456' } ]
  };

  var copiedComplexObject = copyingFunc(complexObject);

  verifier.deepEqual(copiedComplexObject, complexObject);

  verifier.done();
};

exports["duplicate object with cyclical references"] = function (verifier) {
  verifier.expect(8); // expected assertion count

  var thirdVal = [1, "test", {'message': 'world'}, function () {}, false, [2]];
  var secondVal = [thirdVal, 2, 3, 4];

  var firstVal = {'fieldB': secondVal, 'fieldC': thirdVal};
  firstVal.loopRef = firstVal;
  firstVal.anotherLoopRef = firstVal;
  thirdVal.selfRef = thirdVal;
  thirdVal.parentRef = firstVal;

  var firstValCopy = copyingFunc(firstVal);
  verifier.ok(firstVal !== firstValCopy);
  verifier.ok(firstVal.fieldC !== firstValCopy.fieldC);
  verifier.ok(firstValCopy.fieldC === firstValCopy.fieldB[0]);
  verifier.ok(firstValCopy.fieldC.selfRef.selfRef.parentRef === firstValCopy);
  verifier.ok(firstValCopy.fieldC[0] === firstVal.fieldC[0]);

  verifier.ok(compareStructure(firstVal, firstValCopy));
  firstValCopy.fieldC[0] = 2;
  verifier.ok(!compareStructure(firstVal, firstValCopy));
  firstValCopy.fieldC = "2";
  verifier.ok(!compareStructure(firstVal, firstValCopy));

  function compareStructure(leftObj, rightObj) {
    return examine(leftObj) === examine(rightObj);
  }

  verifier.done();
};

exports['duplicate prototype chain'] = function (verifier) {
  verifier.expect(3); // expected assertion count

  var sourceObj = {
    id: "identity",
    count: 123,
    value: 45.65
  };
  var protoCopy = copyingFunc.clonePrototype(sourceObj);

  verifier.strictEqual(protoCopy.id, sourceObj.id);
  verifier.strictEqual(protoCopy.count, sourceObj.count);
  verifier.strictEqual(protoCopy.value, sourceObj.value);

  verifier.done();
};

exports['duplicate within an isolated environment'] = function (verifier) {
  var outcomes = isolatedExecution({ copier: copyingFunc },
      "outcomes = scope.copier({ arrayProp: [1, 2, 3], dateProp: new Date(), regexProp: /^test$/ig })",
      function (outcomes) {
    verifier.ok(outcomes.arrayProp.constructor.toString() === Array.toString());
    verifier.ok(outcomes.dateProp.constructor.toString() === Date.toString());
    verifier.ok(outcomes.regexProp.constructor.toString() === RegExp.toString());
    verifier.done();
  });
};

exports['duplicate object with no constructor property'] = function (verifier) {
  verifier.expect(3);

  var nullProto = null;

  var testObj = { prop: 'val' };
  testObj.__proto__ = nullProto;
  verifier.ok(typeof testObj === 'object');
  verifier.ok(typeof testObj !== null);

  var copiedTestObj = copyingFunc(testObj);
  verifier.ok(testObj.prop, copiedTestObj.prop);

  verifier.done();
};

exports['duplicate object with specified depth parameter'] = function (verifier) {
  verifier.expect(6);

  var deepObj = {
    level1: {
      level2 : {
        level3 : 'deepValue'
      }
    }
  };

  var shallowCopy = copyingFunc(deepObj, false, 1);
  verifier.deepEqual(shallowCopy, deepObj);
  verifier.notEqual(shallowCopy, deepObj);
  verifier.strictEqual(shallowCopy.level1, deepObj.level1);

  shallowCopy = copyingFunc(deepObj, true, 2);
  verifier.deepEqual(shallowCopy, deepObj);
  verifier.notEqual(shallowCopy.level1, deepObj.level1);
  verifier.strictEqual(shallowCopy.level1.level2, deepObj.level1.level2);

  verifier.done();
};

exports['preserve prototype chain in duplicated objects'] = function (verifier) {
  verifier.expect(1);

  function MyConstructor() {}

  var originalInstance = new MyConstructor();
  var duplicatedInstance = copyingFunc(originalInstance);
  verifier.strictEqual(Object.getPrototypeOf(originalInstance), Object.getPrototypeOf(duplicatedInstance));

  verifier.done();
};

exports['parent prototype is replaced with provided prototype'] = function (verifier) {
  verifier.expect(1);

  function BaseType() {}

  var originalInstance = new BaseType();
  var modifiedInstance = copyingFunc(originalInstance, true, Infinity, null);
  verifier.strictEqual(modifiedInstance.__defineSetter__, undefined);

  verifier.done();
};

exports['duplicate object with null nested properties'] = function (verifier) {
  verifier.expect(1);
  var complexData = {
    fieldA: {
      subField: null,
      anotherSubField: {
        booleanVal: false
      }
    }
  };

  var copiedComplexData = copyingFunc(complexData);

  verifier.deepEqual(copiedComplexData, complexData);
  verifier.done();
};

exports['duplicate instance with getter method'] = function (verifier) {
  verifier.expect(1);
  function EntityConstructor() {};
  Object.defineProperty(EntityConstructor.prototype, 'attribute', {
    configurable: true,
    enumerable: true,
    get: function() {
      return 'retrieved_value';
    }
  });

  var originalEntity = new EntityConstructor();
  var copiedEntity = copyingFunc(originalEntity);

  verifier.strictEqual(copiedEntity.attribute, 'retrieved_value');
  verifier.done();
};

exports['retrieve RegExp flags'] = function (verifier) {
  verifier.strictEqual(copyingFunc.__getRegExpFlags(/x/),   ''  );
  verifier.strictEqual(copyingFunc.__getRegExpFlags(/x/i),  'i' );
  verifier.strictEqual(copyingFunc.__getRegExpFlags(/x/g),  'g' );
  verifier.strictEqual(copyingFunc.__getRegExpFlags(/x/gi), 'gi');
  verifier.strictEqual(copyingFunc.__getRegExpFlags(/x/m),  'm' );

  verifier.done();
};

exports["identify Array object"] = function (verifier) {
  var outcomes = isolatedExecution(null, "outcomes = [10, 20, 30]", function(foreignArray) {
    var domesticArray = [40, 50, 60];
    verifier.ok(copyingFunc.__isArray(foreignArray)); // identify in different context.
    verifier.ok(copyingFunc.__isArray(domesticArray)); // identify in local context.
    verifier.ok(!copyingFunc.__isDate(foreignArray));
    verifier.ok(!copyingFunc.__isDate(domesticArray));
    verifier.ok(!copyingFunc.__isRegExp(foreignArray));
    verifier.ok(!copyingFunc.__isRegExp(domesticArray));
    verifier.done();
  });
};

exports["identify Date object"] = function (verifier) {
  var outcomes = isolatedExecution(null, "outcomes = new Date()", function(foreignDate) {
    var domesticDate = new Date();

    verifier.ok(copyingFunc.__isDate(foreignDate)); // identify in different context.
    verifier.ok(copyingFunc.__isDate(domesticDate)); // identify in local context.
    verifier.ok(!copyingFunc.__isArray(foreignDate));
    verifier.ok(!copyingFunc.__isArray(domesticDate));
    verifier.ok(!copyingFunc.__isRegExp(foreignDate));
    verifier.ok(!copyingFunc.__isRegExp(domesticDate));

    verifier.done();
  });
};

exports["identify RegExp object"] = function (verifier) {
  var outcomes = isolatedExecution(null, "outcomes = /pattern/", function(foreignRegExp) {
    var domesticRegExp = /expression/;

    verifier.ok(copyingFunc.__isRegExp(foreignRegExp)); // identify in different context.
    verifier.ok(copyingFunc.__isRegExp(domesticRegExp)); // identify in local context.
    verifier.ok(!copyingFunc.__isArray(foreignRegExp));
    verifier.ok(!copyingFunc.__isArray(domesticRegExp));
    verifier.ok(!copyingFunc.__isDate(foreignRegExp));
    verifier.ok(!copyingFunc.__isDate(domesticRegExp));
    verifier.done();
  });
};