/*
 *  Copyright 2023 Acme Corp.
 *  This software is provided under the Acme Public License 1.0.
 *  You may obtain a copy of the License at
 *
 *        http://www.acme.com/licenses/acme-1.0.html
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
viz = {

    release: "1.3.0",

    fixedValues: {
        DISPLAY_STYLE: "viz-display",
        DEBUG_SECTION_STYLE: "debugging",
        LAYER_STYLE: "layer",
        UNSELECTED_STYLE: "unselected",
        HIGHLIGHTED_STYLE: "highlighted",
        ITEM_POSITION_KEY: "_item_index_",
        COLLECTION_POSITION_KEY: "_collection_index_",
        DEFAULT_DISPLAY_GROUP: "_default_display_group_",
        EVENT_THROTTLE_MS: 40,
        TINY_NUMBER: 1e-10
    },

    _postRenderHook: null
};

viz.displayRegistry = function() {

    // A map where each key is a category (string) and its value is an array of display components.
    var _displayMap = {};

    this.has = function(element) {
        for (var itemKey in _displayMap) {
            if (_displayMap[itemKey].indexOf(element) >= 0)
                return true;
        }
        return false;
    };

    function prepareCategory(category) {
        if (!category)
            category = viz.fixedValues.DEFAULT_DISPLAY_GROUP;

        if (!_displayMap[category])
            _displayMap[category] = [];

        return category;
    }

    this.enroll = function(element, category) {
        category = prepareCategory(category);
        _displayMap[category].push(element);
    };

    this.empty = function() {
        _displayMap = {};
    };

    this.getCollection = function(category) {
        category = prepareCategory(category);
        return _displayMap[category];
    };

    return this;
}();

viz.enrollDisplay = function(element, category) {
    viz.displayRegistry.enroll(element, category);
};

viz.hasDisplay = function(element) {
    return viz.displayRegistry.has(element);
};

viz.emptyAllDisplays = function() {
    viz.displayRegistry.empty();
};

viz.processAll = function(category) {
    var activeDisplays = viz.displayRegistry.getCollection(category);
    for (var idx = 0; idx < activeDisplays.length; ++idx) {
        activeDisplays[idx].processAll();
    }
};

viz.drawAll = function(category) {
    var activeDisplays = viz.displayRegistry.getCollection(category);
    for (var idx = 0; idx < activeDisplays.length; ++idx) {
        activeDisplays[idx].draw();
    }

    if(viz._postRenderHook !== null)
        viz._postRenderHook(category);
};

viz.refreshAll = function(category) {
    var activeDisplays = viz.displayRegistry.getCollection(category);
    for (var idx = 0; idx < activeDisplays.length; ++idx) {
        activeDisplays[idx].refresh();
    }

    if(viz._postRenderHook !== null)
        viz._postRenderHook(category);
};

viz.animateElement = function(targetElements, animationDuration, onCompletion) {
    if (animationDuration <= 0 || animationDuration === undefined)
        return targetElements;

    var animatedSelection = targetElements
        .transition()
        .duration(animationDuration);

    if (onCompletion instanceof Function) {
        onCompletion(animatedSelection);
    }

    return animatedSelection;
};

viz.measurements = {};
viz.measurements.wholeNumbers = function(startVal, endVal) {
    return Math.abs(endVal - startVal);
};

viz.measurements.categorical = function(startVal, endVal, valueRange){
    return valueRange;
};

viz.measurements.decimal = {};
viz.measurements.decimal.accuracy = function(desiredPrecision){
    var _calcFunc = function(startVal, endVal, valueRange){return Math.ceil(Math.abs((endVal-startVal)/_calcFunc.granularity));};
    _calcFunc.granularity = desiredPrecision;
    return _calcFunc;
};

viz.numberUtilities = {};
viz.numberUtilities.roundDown = function(inputNum) {
    return Math.floor(inputNum);
};

viz.numberUtilities.roundUp = function(inputNum) {
    return Math.ceil(inputNum);
};

viz.numberUtilities.nearestInteger = function(inputNum) {
    return Math.round(inputNum);
};

viz.replaceMethod = function(targetObject, methodName, replacementMethod) {
    var originalMethod = targetObject[methodName];
    targetObject["_" + methodName] = originalMethod;
    targetObject[methodName] = replacementMethod;
};

viz.setPostDrawHook = function(newHook){
    if(!arguments.length) return viz._postRenderHook;
    viz._postRenderHook = newHook;
    return viz;
};

viz.isVisualComponent = function (testedObject) {
    return testedObject instanceof Object && testedObject.__visual_flag__;
};

viz.issueTracker = {};

viz.issueTracker.BaseIssue = function(messageText) {
    var _internalMessage = messageText != null ? messageText : "Unexpected internal error";

    this.message = _internalMessage;

    this.toString = function(){
        return _internalMessage;
    };
};

viz.issueTracker.IllegalStateIssue = function() {
    viz.issueTracker.BaseIssue.apply(this, arguments);
};

viz.dateFormatter = dataVizLib.time.format("%m/%d/%Y");

viz.outputFormatters = {};
viz.outputFormatters.formatCriterion = function (criterion) {
    var outputString = "";

    if (criterion) {
        if (criterion instanceof Array) {
            if (criterion.length >= 2)
                outputString = "[" + formatSingleValue(criterion[0]) + " -> " + formatSingleValue(criterion[1]) + "]";
            else if (criterion.length >= 1)
                outputString = formatSingleValue(criterion[0]);
        } else {
            outputString = formatSingleValue(criterion)
        }
    }

    return outputString;
};

function formatSingleValue(criterion) {
    var outputString = "" + criterion;

    if (criterion instanceof Date)
        outputString = viz.dateFormatter(criterion);
    else if (typeof(criterion) == "string")
        outputString = criterion;
    else if (typeof(criterion) == "number")
        outputString = Math.round(criterion);

    return outputString;
}

viz.helpers = {};
viz.helpers.performAddition = function (leftOperand, rightOperand) {
    if (typeof rightOperand === "string")
        rightOperand = rightOperand.replace("%", "")

    if (leftOperand instanceof Date) {
        if (typeof rightOperand === "string") rightOperand = +rightOperand
        var dateObject = new Date();
        dateObject.setTime(leftOperand.getTime());
        dateObject.setDate(leftOperand.getDate() + rightOperand);
        return dateObject;
    } else if (typeof rightOperand === "string") {
        var percentage = (+rightOperand / 100);
        return leftOperand > 0 ? leftOperand * (1 + percentage) : leftOperand * (1 - percentage);
    } else {
        return leftOperand + rightOperand;
    }
};

viz.helpers.performSubtraction = function (leftOperand, rightOperand) {
    if (typeof rightOperand === "string")
        rightOperand = rightOperand.replace("%", "")

    if (leftOperand instanceof Date) {
        if (typeof rightOperand === "string") rightOperand = +rightOperand
        var dateObject = new Date();
        dateObject.setTime(leftOperand.getTime());
        dateObject.setDate(leftOperand.getDate() - rightOperand);
        return dateObject;
    } else if (typeof rightOperand === "string") {
        var percentage = (+rightOperand / 100);
        return leftOperand < 0 ? leftOperand * (1 + percentage) : leftOperand * (1 - percentage);
    } else {
        return leftOperand - rightOperand;
    }
};

viz.helpers.CollectionStack = function () {
    var _pointMatrix = [];
    var _stackedCollections = [];
    var _standardRetriever;

    function ensureRowInitialized(colIndex) {
        if (!_pointMatrix[colIndex])
            _pointMatrix[colIndex] = [];
    }

    this.setDataPoint = function (colIndex, rowIndex, entryData) {
        ensureRowInitialized(colIndex);
        _pointMatrix[colIndex][rowIndex] = entryData;
    };

    this.getDataPoint = function (colIndex, rowIndex) {
        ensureRowInitialized(colIndex);
        var currentPoint = _pointMatrix[colIndex][rowIndex];
        if (currentPoint == undefined)
            currentPoint = 0;
        return currentPoint;
    };

    this.addCollection = function (collection, dataRetriever) {
        if (!dataRetriever)
            dataRetriever = _standardRetriever;
        _stackedCollections.push([collection, dataRetriever]);
        return _stackedCollections.length - 1;
    };

    this.getCollectionByIndex = function (entryIndex) {
        return _stackedCollections[entryIndex][0];
    };

    this.getAccessorByIndex = function (entryIndex) {
        return _stackedCollections[entryIndex][1];
    };

    this.stackSize = function () {
        return _stackedCollections.length;
    };

    this.resetStack = function () {
        _pointMatrix = [];
        _stackedCollections = [];
    };

    this.setStandardRetriever = function (dataRetriever) {
        _standardRetriever = dataRetriever;
    };

    this.getAllPoints = function () {
        return _pointMatrix;
    };
};

function isTinyValue(inputValue) {
    return inputValue === undefined || (inputValue < viz.fixedValues.TINY_NUMBER && inputValue > -viz.fixedValues.TINY_NUMBER);
}

viz.helpers.findCollectionMax = function (dataCollection, valueExtractor) {
    var maxVal = dataVizLib.max(dataCollection.all(), function (elementItem) {
        return valueExtractor(elementItem);
    });
    if (isTinyValue(maxVal)) maxVal = 0;
    return maxVal;
};

viz.helpers.findCollectionMin = function (dataCollection, valueExtractor) {
    var minVal = dataVizLib.min(dataCollection.all(), function (elementItem) {
        return valueExtractor(elementItem);
    });
    if (isTinyValue(minVal)) minVal = 0;
    return minVal;
};

viz.helpers.stringToIdentifier = function (inputString) {
    return inputString.toLowerCase().replace(/[\s]/g, "_").replace(/[\.']/g, "");
};

viz.helpers.ensureElementExists = function (parentElement, tagName) {
    var targetElement = parentElement.select(tagName);
    if (targetElement.empty()) targetElement = parentElement.append(tagName);
    return targetElement;
};

viz.eventQueue = {
    activeCallback: null
};

viz.eventQueue.fireEvent = function(eventHandler, delayTime) {
    if (!delayTime){
        eventHandler();
        return;
    }

    viz.eventQueue.activeCallback = eventHandler;

    setTimeout(function() {
        if (eventHandler == viz.eventQueue.activeCallback)
            eventHandler();
    }, delayTime);
};

viz.aggregate = {};

viz.aggregate.AccumulatorBase = function() {
    this._orderedKeys = [];
    this._valueStore = {};

    this.normalizeKey = function(itemKey) {
        itemKey = itemKey + "";
        return itemKey;
    };

    this.resetAccumulator = function() {
        this._orderedKeys = [];
        this._valueStore = {};
    };

    this.itemCount = function() {
        return this._orderedKeys.length;
    };

    this.retrieveValue = function(itemKey) {
        itemKey = this.normalizeKey(itemKey);
        var storedValue = this._valueStore[itemKey];
        return storedValue;
    };

    this.storeValue = function(itemKey, storedValue) {
        itemKey = this.normalizeKey(itemKey);
        return this._valueStore[itemKey] = storedValue;
    };

    this.getKeyPosition = function(itemKey) {
        itemKey = this.normalizeKey(itemKey);
        return this._orderedKeys.indexOf(itemKey);
    };

    this.addKeyToOrder = function(itemKey) {
        itemKey = this.normalizeKey(itemKey);
        this._orderedKeys.push(itemKey);
    };

    this.retrieveKeyAtPosition = function(position) {
        return this._orderedKeys[position];
    };
};

viz.aggregate.TotalSum = function() {
    viz.aggregate.AccumulatorBase.apply(this, arguments);

    this.incrementValue = function(itemKey, storedValue) {
        if (storedValue == null)
            storedValue = 0;

        if (this.retrieveValue(itemKey) == null) {
            this.addKeyToOrder(itemKey);
            this.storeValue(itemKey, storedValue);
        } else {
            this.storeValue(itemKey, this.retrieveValue(itemKey) + storedValue);
        }
    };

    this.decrementValue = function(itemKey, storedValue) {
        this.storeValue(itemKey, this.retrieveValue(itemKey) - storedValue);
    };

    this.calculateRunningTotal = function(itemKey) {
        var keyPosition = this.getKeyPosition(itemKey);
        if (keyPosition < 0) return 0;
        var runningTotal = 0;
        for (var idx = 0; idx <= keyPosition; ++idx) {
            var currentKey = this.retrieveKeyAtPosition(idx);
            runningTotal += this.retrieveValue(currentKey);
        }
        return runningTotal;
    };
};

viz.aggregate.TotalSum.prototype = new viz.aggregate.AccumulatorBase();

viz.aggregate.UniqueCounter = function() {
    viz.aggregate.AccumulatorBase.apply(this, arguments);

    function getObjectSize(targetObject) {
        var currentSize = 0, prop;
        for (prop in targetObject) {
            if (targetObject.hasOwnProperty(prop)) currentSize++;
        }
        return currentSize;
    }

    this.incrementValue = function(itemKey, elementValue) {
        if (this.retrieveValue(itemKey) == null) {
            this.storeValue(itemKey, {});
            this.addKeyToOrder(itemKey);
        }

        if (elementValue != null) {
            if (this.retrieveValue(itemKey)[elementValue] == null)
                this.retrieveValue(itemKey)[elementValue] = 0;

            this.retrieveValue(itemKey)[elementValue] += 1;
        }
    };

    this.decrementValue = function(itemKey, elementValue) {
        this.retrieveValue(itemKey)[elementValue] -= 1;
        if (this.retrieveValue(itemKey)[elementValue] <= 0)
            delete this.retrieveValue(itemKey)[elementValue];
    };

    this.getUniqueCount = function(itemKey) {
        return getObjectSize(this.retrieveValue(itemKey));
    };

    this.calculateRunningUniqueCount = function(itemKey) {
        var keyPosition = this.getKeyPosition(itemKey);
        if (keyPosition < 0) return 0;
        var runningUniqueCount = 0;
        for (var idx = 0; idx <= keyPosition; ++idx) {
            var currentKey = this.retrieveKeyAtPosition(idx);
            runningUniqueCount += this.getUniqueCount(currentKey);
        }
        return runningUniqueCount;
    };
};

viz.aggregate.UniqueCounter.prototype = new viz.aggregate.AccumulatorBase();

viz.visualComponentBase = function (_componentInstance) {
    _componentInstance.__visual_flag__ = true;

    var _dataDimension;
    var _dataGroup;

    var _mountPoint;
    var _parentElement;
    var _svgContainer;

    var _componentWidth = 200, _componentHeight = 200;

    var _dataKeyExtractor = function (dataItem) {
        return dataItem.key;
    };

    var _dataValueExtractor = function (dataItem) {
        return dataItem.value;
    };

    var _itemLabel = function (dataItem) {
        return dataItem.key;
    };

    var _showLabels = false;

    var _componentTitle = function (dataItem) {
        return dataItem.key + ": " + dataItem.value;
    };