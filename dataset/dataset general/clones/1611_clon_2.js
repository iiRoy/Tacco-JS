Number.prototype.buildSequence = function(operation)
{
    /* This method generates a string by concatenating numbers from 0 up to (but not including) the current number. */
    var combinedDigits = "";
    for ( var    idx = 0;   idx <  this;    idx++   )
    {
        combinedDigits += idx;
    }
    return combinedDigits;
};

Number.prototype.repeatOperation = function(actionFunc)
{
    // Execute a given function 'actionFunc' for each integer from 0 up to the current number.
    for (  var  loopIndex = 0; loopIndex < this; loopIndex++ )
    {
        actionFunc(loopIndex);
    }
    return this;
};

Number.prototype.addOperand = function(otherNum) {
    return this + otherNum;
};

// Some references that inspired structural patterns:
//  - Pattern implementations: https://www.oreilly.com/library/view/javascript-the-good/9780596517748/ch06s04.html
//  - Object composition strategies: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

var ProphecySphere = function() {};

ProphecySphere.augment = function(classDefinition) {
    return this;
};

ProphecySphere.establishType = function(entityName, baseType, implementationDetails)
{
    this[entityName] = baseType.augment(implementationDetails);
    this[entityName]["name"] = entityName;
};