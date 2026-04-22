const testReport = [];
let testCounter = 0;
let passCounter = 0;
let failCounter = 0;

const assertCondition = (condition, description) => {
    testCounter++;
    if (condition) {
        passCounter++;
    } else {
        failCounter++;
        testReport.push(`[FAIL] Test ${testCounter}: ${description}`);
    }
};

const defineSection = (title, blockFn) => {
    blockFn();
};

const makeAssertion = (description, assertionFn) => {
    assertionFn();
};

const typeInspector = (() => {
    const internalChecks = {
        isArguments: (v) => Object.prototype.toString.call(v) === '[object Arguments]',
        isArray: (v) => Array.isArray(v),
        isBoolean: (v) => typeof v === 'boolean',
        isDate: (v) => v instanceof Date,
        isError: (v) => v instanceof Error,
        isFunction: (v) => typeof v === 'function',
        isNan: (v) => typeof v === 'number' && isNaN(v),
        isNull: (v) => v === null,
        isNumber: (v) => typeof v === 'number' && !isNaN(v),
        isObject: (v) => typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date) && !(v instanceof Error) && !(v instanceof RegExp),
        isJson: (v) => typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date) && !(v instanceof Error) && !(v instanceof RegExp),
        isRegExp: (v) => v instanceof RegExp,
    };

    const processInputs = (args) => {
        if (args.length === 1 && Array.isArray(args[0])) {
            return args[0];
        }
        return Array.from(args);
    };

    const api = {};

    for (const typeName in internalChecks) {
        if (Object.hasOwnProperty.call(internalChecks, typeName)) {
            const checkFn = internalChecks[typeName];

            api[typeName] = checkFn;

            if (!api.negate) api.negate = {};
            api.negate[typeName] = (v) => !checkFn(v);

            if (!api.all) api.all = {};
            api.all[typeName] = (...args) => processInputs(args).every(checkFn);

            if (!api.any) api.any = {};
            api.any[typeName] = (...args) => processInputs(args).some(checkFn);
        }
    }
    return api;
})();

defineSection("typeInspector.isArguments functionality", () => {
    makeAssertion("should confirm an arguments object", () => {
        const fetchArgs = function() { return arguments; };
        const argInstance = fetchArgs('alpha');
        assertCondition(typeInspector.isArguments(argInstance), "isArguments confirms arguments");
    });
    makeAssertion("should reject non-arguments object", () => {
        const nonArgs = ['alpha'];
        assertCondition(typeInspector.isArguments(nonArgs) === false, "isArguments rejects non-arguments");
    });
});
defineSection("typeInspector.negate.isArguments functionality", () => {
    makeAssertion("should reject arguments object", () => {
        const fetchArgs = function() { return arguments; };
        const argInstance = fetchArgs('beta');
        assertCondition(typeInspector.negate.isArguments(argInstance) === false, "negate.isArguments rejects arguments");
    });
    makeAssertion("should confirm non-arguments object", () => {
        const nonArgs = ['beta'];
        assertCondition(typeInspector.negate.isArguments(nonArgs), "negate.isArguments confirms non-arguments");
    });
});
defineSection("typeInspector.all.isArguments functionality", () => {
    makeAssertion("should confirm if all parameters are arguments", () => {
        const argSupplier = function() { return arguments; };
        const argOne = argSupplier('gamma');
        const argTwo = argSupplier('delta');
        assertCondition(typeInspector.all.isArguments(argOne, argTwo), "all.isArguments confirms multiple arguments");
        assertCondition(typeInspector.all.isArguments([argOne, argTwo]), "all.isArguments confirms array of arguments");
    });
    makeAssertion("should reject if any parameter is not arguments", () => {
        const nonArg = ['epsilon'];
        const argSupplier = function() { return arguments; };
        const argInstance = argSupplier('zeta');
        assertCondition(typeInspector.all.isArguments(argInstance, nonArg) === false, "all.isArguments rejects mixed types (variadic)");
        assertCondition(typeInspector.all.isArguments([argInstance, nonArg]) === false, "all.isArguments rejects mixed types (array)");
    });
});
defineSection("typeInspector.any.isArguments functionality", () => {
    makeAssertion("should confirm if any parameter is arguments", () => {
        const argSupplier = function() { return arguments; };
        const argInstance = argSupplier('eta');
        assertCondition(typeInspector.any.isArguments('theta', argInstance), "any.isArguments confirms one argument (variadic)");
        assertCondition(typeInspector.any.isArguments(['iota', argInstance]), "any.isArguments confirms one argument (array)");
    });
    makeAssertion("should reject if no parameter is arguments", () => {
        assertCondition(typeInspector.any.isArguments('kappa', null) === false, "any.isArguments rejects all non-arguments (variadic)");
        assertCondition(typeInspector.any.isArguments(['lambda', null]) === false, "any.isArguments rejects all non-arguments (array)");
    });
});
defineSection("typeInspector.isArray functionality", () => {
    makeAssertion("should confirm an array object", () => {
        const listObject = ['mu'];
        assertCondition(typeInspector.isArray(listObject), "isArray confirms array");
    });
    makeAssertion("should reject a non-array object", () => {
        const nonList = 'nu';
        assertCondition(typeInspector.isArray(nonList) === false, "isArray rejects non-array");
    });
});
defineSection("typeInspector.negate.isArray functionality", () => {
    makeAssertion("should reject an array object", () => {
        const listObject = ['xi'];
        assertCondition(typeInspector.negate.isArray(listObject) === false, "negate.isArray rejects array");
    });
    makeAssertion("should confirm a non-array object", () => {
        const nonList = 'omicron';
        assertCondition(typeInspector.negate.isArray(nonList), "negate.isArray confirms non-array");
    });
});
defineSection("typeInspector.all.isArray functionality", () => {
    makeAssertion("should confirm if all parameters are arrays", () => {
        const listOne = ['pi'];
        const listTwo = ['rho'];
        assertCondition(typeInspector.all.isArray(listOne, listTwo), "all.isArray confirms multiple arrays");
        assertCondition(typeInspector.all.isArray([listOne, listTwo]), "all.isArray confirms array of arrays");
    });
    makeAssertion("should reject if any parameter is not an array", () => {
        const nonList = 'sigma';
        const listObject = ['tau'];
        assertCondition(typeInspector.all.isArray(nonList, listObject) === false, "all.isArray rejects mixed types (variadic)");
        assertCondition(typeInspector.all.isArray([nonList, listObject]) === false, "all.isArray rejects mixed types (array)");
    });
});
defineSection("typeInspector.any.isArray functionality", () => {
    makeAssertion("should confirm if any parameter is an array", () => {
        const listObject = ['upsilon'];
        const listTwo = ['phi'];
        assertCondition(typeInspector.any.isArray(listObject, listTwo, 'chi'), "any.isArray confirms one array (variadic)");
        assertCondition(typeInspector.any.isArray([listObject, listTwo, 'psi']), "any.isArray confirms one array (array)");
    });
    makeAssertion("should reject if no parameter is an array", () => {
        assertCondition(typeInspector.any.isArray('omega', 'alpha') === false, "any.isArray rejects all non-arrays (variadic)");
        assertCondition(typeInspector.any.isArray(['beta', 'gamma']) === false, "any.isArray rejects all non-arrays (array)");
    });
});
defineSection("typeInspector.isBoolean functionality", () => {
    makeAssertion("should confirm a boolean value", () => {
        const logicValue = true;
        assertCondition(typeInspector.isBoolean(logicValue), "isBoolean confirms boolean");
    });
    makeAssertion("should reject a non-boolean value", () => {
        const nonLogic = 'delta';
        assertCondition(typeInspector.isBoolean(nonLogic) === false, "isBoolean rejects non-boolean");
    });
});
defineSection("typeInspector.negate.isBoolean functionality", () => {
    makeAssertion("should confirm a non-boolean value", () => {
        const nonLogic = 'epsilon';
        assertCondition(typeInspector.negate.isBoolean(nonLogic), "negate.isBoolean confirms non-boolean");
    });
    makeAssertion("should reject a boolean value", () => {
        const logicValue = true;
        assertCondition(typeInspector.negate.isBoolean(logicValue) === false, "negate.isBoolean rejects boolean");
    });
});
defineSection("typeInspector.all.isBoolean functionality", () => {
    makeAssertion("should confirm if all parameters are booleans", () => {
        const logicOne = true;
        const logicTwo = false;
        assertCondition(typeInspector.all.isBoolean(logicOne, logicTwo), "all.isBoolean confirms multiple booleans");
        assertCondition(typeInspector.all.isBoolean([logicOne, logicTwo]), "all.isBoolean confirms array of booleans");
    });
    makeAssertion("should reject if any parameter is not a boolean", () => {
        const logicValue = true;
        const nonLogic = 'zeta';
        assertCondition(typeInspector.all.isBoolean(logicValue, nonLogic) === false, "all.isBoolean rejects mixed types (variadic)");
        assertCondition(typeInspector.all.isBoolean([logicValue, nonLogic]) === false, "all.isBoolean rejects mixed types (array)");
    });
});
defineSection("typeInspector.any.isBoolean functionality", () => {
    makeAssertion("should confirm if any parameter is a boolean", () => {
        const logicOne = true;
        const logicTwo = false;
        assertCondition(typeInspector.any.isBoolean(logicOne, logicTwo, ['eta']), "any.isBoolean confirms one boolean (variadic)");
        assertCondition(typeInspector.any.isBoolean([logicOne, logicTwo, ['theta']]), "any.isBoolean confirms one boolean (array)");
    });
    makeAssertion("should reject if no parameter is a boolean", () => {
        assertCondition(typeInspector.any.isBoolean('iota', {}, null) === false, "any.isBoolean rejects all non-booleans (variadic)");
        assertCondition(typeInspector.any.isBoolean(['kappa', {}, null]) === false, "any.isBoolean rejects all non-booleans (array)");
    });
});
defineSection("typeInspector.isDate functionality", () => {
    makeAssertion("should confirm a Date object", () => {
        const momentObj = new Date();
        assertCondition(typeInspector.isDate(momentObj), "isDate confirms Date");
    });
    makeAssertion("should reject a non-Date object", () => {
        const nonMoment = 'lambda';
        assertCondition(typeInspector.isDate(nonMoment) === false, "isDate rejects non-Date");
    });
});
defineSection("typeInspector.negate.isDate functionality", () => {
    makeAssertion("should reject a Date object", () => {
        const momentObj = new Date();
        assertCondition(typeInspector.negate.isDate(momentObj) === false, "negate.isDate rejects Date");
    });
    makeAssertion("should confirm a non-Date object", () => {
        const nonMoment = 'mu';
        assertCondition(typeInspector.negate.isDate(nonMoment), "negate.isDate confirms non-Date");
    });
});
defineSection("typeInspector.all.isDate functionality", () => {
    makeAssertion("should confirm if all parameters are Dates", () => {
        const myBirthMoment = new Date('06-28-1986');
        const momentObj = new Date();
        assertCondition(typeInspector.all.isDate(myBirthMoment, momentObj), "all.isDate confirms multiple Dates");
        assertCondition(typeInspector.all.isDate([myBirthMoment, momentObj]), "all.isDate confirms array of Dates");
    });
    makeAssertion("should reject if any parameter is not a Date", () => {
        const momentObj = new Date();
        const nonMoment = 'nu';
        assertCondition(typeInspector.all.isDate(momentObj, nonMoment) === false, "all.isDate rejects mixed types (variadic)");
        assertCondition(typeInspector.all.isDate([momentObj, nonMoment]) === false, "all.isDate rejects mixed types (array)");
    });
});
defineSection("typeInspector.any.isDate functionality", () => {
    makeAssertion("should confirm if any parameter is a Date", () => {
        const momentObj = new Date();
        assertCondition(typeInspector.any.isDate('xi', momentObj), "any.isDate confirms one Date (variadic)");
        assertCondition(typeInspector.any.isDate(['omicron', momentObj]), "any.isDate confirms one Date (array)");
    });
    makeAssertion("should reject if no parameter is a Date", () => {
        assertCondition(typeInspector.any.isDate('pi', 1, undefined) === false, "any.isDate rejects all non-Dates (variadic)");
        assertCondition(typeInspector.any.isDate(['rho', 1, undefined]) === false, "any.isDate rejects all non-Dates (array)");
    });
});
defineSection("typeInspector.isError functionality", () => {
    makeAssertion("should confirm an Error object", () => {
        const issueObj = new Error();
        assertCondition(typeInspector.isError(issueObj), "isError confirms Error");
    });
    makeAssertion("should reject a non-Error object", () => {
        const nonIssue = 'sigma';
        assertCondition(typeInspector.isError(nonIssue) === false, "isError rejects non-Error");
    });
});
defineSection("typeInspector.negate.isError functionality", () => {
    makeAssertion("should reject an Error object", () => {
        const issueObj = new Error();
        assertCondition(typeInspector.negate.isError(issueObj) === false, "negate.isError rejects Error");
    });
    makeAssertion("should confirm a non-Error object", () => {
        const nonIssue = 'tau';
        assertCondition(typeInspector.negate.isError(nonIssue), "negate.isError confirms non-Error");
    });
});
defineSection("typeInspector.all.isError functionality", () => {
    makeAssertion("should confirm if all parameters are Errors", () => {
        const issueOne = new Error();
        const issueTwo = new Error();
        assertCondition(typeInspector.all.isError(issueOne, issueTwo), "all.isError confirms multiple Errors");
        assertCondition(typeInspector.all.isError([issueOne, issueTwo]), "all.isError confirms array of Errors");
    });
    makeAssertion("should reject if any parameter is not an Error", () => {
        const issueObj = new Error();
        const nonIssue = 'upsilon';
        assertCondition(typeInspector.all.isError(issueObj, nonIssue) === false, "all.isError rejects mixed types (variadic)");
        assertCondition(typeInspector.all.isError([issueObj, nonIssue]) === false, "all.isError rejects mixed types (array)");
    });
});
defineSection("typeInspector.any.isError functionality", () => {
    makeAssertion("should confirm if any parameter is an Error", () => {
        const issueOne = new Error();
        assertCondition(typeInspector.any.isError(issueOne, new Date()), "any.isError confirms one Error (variadic)");
        assertCondition(typeInspector.any.isError([issueOne, new Date()]), "any.isError confirms one Error (array)");
    });
    makeAssertion("should reject if no parameter is an Error", () => {
        assertCondition(typeInspector.any.isError(1, 2, 3) === false, "any.isError rejects all non-Errors (variadic)");
        assertCondition(typeInspector.any.isError([1, 2, 3]) === false, "any.isError rejects all non-Errors (array)");
    });
});
defineSection("typeInspector.isFunction functionality", () => {
    makeAssertion("should confirm a function", () => {
        assertCondition(typeInspector.isFunction(typeInspector.isFunction), "isFunction confirms function");
    });
    makeAssertion("should reject a non-function", () => {
        const nonAction = 'phi';
        assertCondition(typeInspector.isFunction(nonAction) === false, "isFunction rejects non-function");
    });
});
defineSection("typeInspector.negate.isFunction functionality", () => {
    makeAssertion("should reject a function", () => {
        assertCondition(typeInspector.negate.isFunction(typeInspector.isFunction) === false, "negate.isFunction rejects function");
    });
    makeAssertion("should confirm a non-function", () => {
        const nonAction = 'chi';
        assertCondition(typeInspector.negate.isFunction(nonAction), "negate.isFunction confirms non-function");
    });
});
defineSection("typeInspector.all.isFunction functionality", () => {
    makeAssertion("should confirm if all parameters are functions", () => {
        assertCondition(typeInspector.all.isFunction(typeInspector.isFunction, typeInspector.isArray), "all.isFunction confirms multiple functions");
        assertCondition(typeInspector.all.isFunction([typeInspector.isFunction, typeInspector.isArray]), "all.isFunction confirms array of functions");
    });
    makeAssertion("should reject if any parameter is not a function", () => {
        const nonAction = 'psi';
        assertCondition(typeInspector.all.isFunction(typeInspector.isFunction, nonAction) === false, "all.isFunction rejects mixed types (variadic)");
        assertCondition(typeInspector.all.isFunction([typeInspector.isFunction, nonAction]) === false, "all.isFunction rejects mixed types (array)");
    });
});
defineSection("typeInspector.any.isFunction functionality", () => {
    makeAssertion("should confirm if any parameter is a function", () => {
        assertCondition(typeInspector.any.isFunction(typeInspector.isFunction, []), "any.isFunction confirms one function (variadic)");
        assertCondition(typeInspector.any.isFunction([typeInspector.isFunction, []]), "any.isFunction confirms one function (array)");
    });
    makeAssertion("should reject if no parameter is a function", () => {
        assertCondition(typeInspector.any.isFunction(2, 'omega') === false, "any.isFunction rejects all non-functions (variadic)");
        assertCondition(typeInspector.any.isFunction([2, 'alpha']) === false, "any.isFunction rejects all non-functions (array)");
    });
});
defineSection("typeInspector.isNan functionality", () => {
    makeAssertion("should confirm NaN", () => {
        assertCondition(typeInspector.isNan(NaN), "isNan confirms NaN");
    });
    makeAssertion("should reject non-NaN", () => {
        const nonNumericalAnomaly = 'beta';
        assertCondition(typeInspector.isNan(nonNumericalAnomaly) === false, "isNan rejects non-NaN");
    });
});
defineSection("typeInspector.negate.isNan functionality", () => {
    makeAssertion("should reject NaN", () => {
        assertCondition(typeInspector.negate.isNan(NaN) === false, "negate.isNan rejects NaN");
    });
    makeAssertion("should confirm non-NaN", () => {
        const nonNumericalAnomaly = 'gamma';
        assertCondition(typeInspector.negate.isNan(nonNumericalAnomaly), "negate.isNan confirms non-NaN");
    });
});
defineSection("typeInspector.all.isNan functionality", () => {
    makeAssertion("should confirm if all parameters are NaN", () => {
        assertCondition(typeInspector.all.isNan(NaN, NaN), "all.isNan confirms multiple NaN");
        assertCondition(typeInspector.all.isNan([NaN, NaN]), "all.isNan confirms array of NaN");
    });
    makeAssertion("should reject if any parameter is not NaN", () => {
        const nonNumericalAnomaly = 'delta';
        assertCondition(typeInspector.all.isNan(NaN, nonNumericalAnomaly) === false, "all.isNan rejects mixed types (variadic)");
        assertCondition(typeInspector.all.isNan([NaN, nonNumericalAnomaly]) === false, "all.isNan rejects mixed types (array)");
    });
});
defineSection("typeInspector.any.isNan functionality", () => {
    makeAssertion("should confirm if any parameter is NaN", () => {
        assertCondition(typeInspector.any.isNan(NaN, NaN, 'epsilon'), "any.isNan confirms one NaN (variadic)");
        assertCondition(typeInspector.any.isNan([NaN, NaN, 'zeta']), "any.isNan confirms one NaN (array)");
    });
    makeAssertion("should reject if no parameter is NaN", () => {
        assertCondition(typeInspector.any.isNan('eta', new RegExp()) === false, "any.isNan rejects all non-NaN (variadic)");
        assertCondition(typeInspector.any.isNan(['theta', new RegExp()]) === false, "any.isNan rejects all non-NaN (array)");
    });
});
defineSection("typeInspector.isNull functionality", () => {
    makeAssertion("should confirm null", () => {
        assertCondition(typeInspector.isNull(null), "isNull confirms null");
    });
    makeAssertion("should reject non-null", () => {
        const nonEmptyRef = 'iota';
        assertCondition(typeInspector.isNull(nonEmptyRef) === false, "isNull rejects non-null");
    });
});
defineSection("typeInspector.negate.isNull functionality", () => {
    makeAssertion("should reject null", () => {
        assertCondition(typeInspector.negate.isNull(null) === false, "negate.isNull rejects null");
    });
    makeAssertion("should confirm non-null", () => {
        const nonEmptyRef = 'kappa';
        assertCondition(typeInspector.negate.isNull(nonEmptyRef), "negate.isNull confirms non-null");
    });
});
defineSection("typeInspector.all.isNull functionality", () => {
    makeAssertion("should confirm if all parameters are null", () => {
        assertCondition(typeInspector.all.isNull(null, null), "all.isNull confirms multiple nulls");
        assertCondition(typeInspector.all.isNull([null, null]), "all.isNull confirms array of nulls");
    });
    makeAssertion("should reject if any parameter is not null", () => {
        const nonEmptyRef = 'lambda';
        assertCondition(typeInspector.all.isNull(null, nonEmptyRef) === false, "all.isNull rejects mixed types (variadic)");
        assertCondition(typeInspector.all.isNull([null, nonEmptyRef]) === false, "all.isNull rejects mixed types (array)");
    });
});
defineSection("typeInspector.any.isNull functionality", () => {
    makeAssertion("should confirm if any parameter is null", () => {
        assertCondition(typeInspector.any.isNull(null, null, undefined), "any.isNull confirms one null (variadic)");
        assertCondition(typeInspector.any.isNull([null, null, undefined]), "any.isNull confirms one null (array)");
    });
    makeAssertion("should reject if no parameter is null", () => {
        assertCondition(typeInspector.any.isNull(1, 2) === false, "any.isNull rejects all non-null (variadic)");
        assertCondition(typeInspector.any.isNull([1, 2]) === false, "any.isNull rejects all non-null (array)");
    });
});
defineSection("typeInspector.isNumber functionality", () => {
    makeAssertion("should confirm a number", () => {
        assertCondition(typeInspector.isNumber(1), "isNumber confirms number");
    });
    makeAssertion("should reject a non-number", () => {
        const nonNumeric = 'mu';
        assertCondition(typeInspector.isNumber(nonNumeric) === false, "isNumber rejects non-number");
    });
    makeAssertion("should reject NaN", () => {
        assertCondition(typeInspector.isNumber(NaN) === false, "isNumber rejects NaN");
    });
});
defineSection("typeInspector.negate.isNumber functionality", () => {
    makeAssertion("should reject a number", () => {
        assertCondition(typeInspector.negate.isNumber(1) === false, "negate.isNumber rejects number");
    });
    makeAssertion("should confirm a non-number", () => {
        const nonNumeric = 'nu';
        assertCondition(typeInspector.negate.isNumber(nonNumeric), "negate.isNumber confirms non-number");
    });
    makeAssertion("should confirm NaN", () => {
        assertCondition(typeInspector.negate.isNumber(NaN), "negate.isNumber confirms NaN");
    });
});
defineSection("typeInspector.all.isNumber functionality", () => {
    makeAssertion("should confirm if all parameters are numbers", () => {
        assertCondition(typeInspector.all.isNumber(1, 2), "all.isNumber confirms multiple numbers");
        assertCondition(typeInspector.all.isNumber([1, 2]), "all.isNumber confirms array of numbers");
    });
    makeAssertion("should reject if any parameter is not a number", () => {
        const nonNumeric = 'xi';
        assertCondition(typeInspector.all.isNumber(1, nonNumeric) === false, "all.isNumber rejects mixed types (variadic)");
        assertCondition(typeInspector.all.isNumber([1, nonNumeric]) === false, "all.isNumber rejects mixed types (array)");
    });
});
defineSection("typeInspector.any.isNumber functionality", () => {
    makeAssertion("should confirm if any parameter is a number", () => {
        assertCondition(typeInspector.any.isNumber(1, 2, NaN), "any.isNumber confirms one number (variadic)");
        assertCondition(typeInspector.any.isNumber([1, 2, NaN]), "any.isNumber confirms one number (array)");
    });
    makeAssertion("should reject if no parameter is a number", () => {
        assertCondition(typeInspector.any.isNumber(null, 'omicron') === false, "any.isNumber rejects all non-numbers (variadic)");
        assertCondition(typeInspector.any.isNumber([null, 'pi']) === false, "any.isNumber rejects all non-numbers (array)");
    });
});
defineSection("typeInspector.isObject functionality", () => {
    makeAssertion("should confirm an object", () => {
        assertCondition(typeInspector.isObject({}), "isObject confirms object");
    });
    makeAssertion("should reject a non-object", () => {
        const nonStructure = 'rho';
        assertCondition(typeInspector.isObject(nonStructure) === false, "isObject rejects non-object");
    });
});
defineSection("typeInspector.negate.isObject functionality", () => {
    makeAssertion("should reject an object", () => {
        assertCondition(typeInspector.negate.isObject({}) === false, "negate.isObject rejects object");
    });
    makeAssertion("should confirm a non-object", () => {
        const nonStructure = 'sigma';
        assertCondition(typeInspector.negate.isObject(nonStructure), "negate.isObject confirms non-object");
    });
});
defineSection("typeInspector.all.isObject functionality", () => {
    makeAssertion("should confirm if all parameters are objects", () => {
        assertCondition(typeInspector.all.isObject({}, {}), "all.isObject confirms multiple objects");
        assertCondition(typeInspector.all.isObject([{}, {}]), "all.isObject confirms array of objects");
    });
    makeAssertion("should reject if any parameter is not an object", () => {
        const nonStructure = 'tau';
        assertCondition(typeInspector.all.isObject({}, nonStructure) === false, "all.isObject rejects mixed types (variadic)");
        assertCondition(typeInspector.all.isObject([{}, nonStructure]) === false, "all.isObject rejects mixed types (array)");
    });
});
defineSection("typeInspector.any.isObject functionality", () => {
    makeAssertion("should confirm if any parameter is an object", () => {
        assertCondition(typeInspector.any.isObject({}, {}, 'upsilon'), "any.isObject confirms one object (variadic)");
        assertCondition(typeInspector.any.isObject([{}, {}, 'phi']), "any.isObject confirms one object (array)");
    });
    makeAssertion("should reject if no parameter is an object", () => {
        assertCondition(typeInspector.any.isObject(1, 2, 3) === false, "any.isObject rejects all non-objects (variadic)");
        assertCondition(typeInspector.any.isObject([1, 2, 3]) === false, "any.isObject rejects all non-objects (array)");
    });
});
defineSection("typeInspector.isJson functionality", () => {
    makeAssertion("should confirm a json object", () => {
        assertCondition(typeInspector.isJson({}), "isJson confirms json object");
    });
    makeAssertion("should reject a non-json object", () => {
        const nonStructure = 'chi';
        assertCondition(typeInspector.isJson(nonStructure) === false, "isJson rejects non-json object");
    });
});
defineSection("typeInspector.negate.isJson functionality", () => {
    makeAssertion("should reject a json object", () => {
        assertCondition(typeInspector.negate.isJson({}) === false, "negate.isJson rejects json object");
    });
    makeAssertion("should confirm a non-json object", () => {
        const nonStructure = 'psi';
        assertCondition(typeInspector.negate.isJson(nonStructure), "negate.isJson confirms non-json object");
    });
});
defineSection("typeInspector.all.isJson functionality", () => {
    makeAssertion("should confirm if all parameters are json objects", () => {
        assertCondition(typeInspector.all.isJson({}, {}), "all.isJson confirms multiple json objects");
        assertCondition(typeInspector.all.isJson([{}, {}]), "all.isJson confirms array of json objects");
    });
    makeAssertion("should reject if any parameter is not a json object", () => {
        const nonStructure = 'omega';
        assertCondition(typeInspector.all.isJson({}, nonStructure, []) === false, "all.isJson rejects mixed types (variadic)");
        assertCondition(typeInspector.all.isJson([{}, nonStructure, ""]) === false, "all.isJson rejects mixed types (array)");
    });
});
defineSection("typeInspector.any.isJson functionality", () => {
    makeAssertion("should confirm if any parameter is a json object", () => {
        assertCondition(typeInspector.any.isJson({}, {}, 'alpha'), "any.isJson confirms one json object (variadic)");
        assertCondition(typeInspector.any.isJson([{}, {}, 'beta']), "any.isJson confirms one json object (array)");
    });
    makeAssertion("should reject if no parameter is a json object", () => {
        assertCondition(typeInspector.any.isJson(1, 2, 3) === false, "any.isJson rejects all non-json objects (variadic)");
        assertCondition(typeInspector.any.isJson([1, 2, 3]) === false, "any.isJson rejects all non-json objects (array)");
    });
});
defineSection("typeInspector.isRegExp functionality", () => {
    makeAssertion("should confirm a RegExp object", () => {
        const patternObj = new RegExp();
        assertCondition(typeInspector.isRegExp(patternObj), "isRegExp confirms RegExp");
    });
    makeAssertion("should reject a non-RegExp object", () => {
        const nonPattern = 'gamma';
        assertCondition(typeInspector.isRegExp(nonPattern) === false, "isRegExp rejects non-RegExp");
    });
});
defineSection("typeInspector.negate.isRegExp functionality", () => {
    makeAssertion("should reject a RegExp object", () => {
        const patternObj = new RegExp();
        assertCondition(typeInspector.negate.isRegExp(patternObj) === false, "negate.isRegExp rejects RegExp");
    });
});