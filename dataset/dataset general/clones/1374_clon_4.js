(function (gbl) {

    function obtainZeros(quantity) {
        let outcome = "";
        quantity = parseInt(quantity, 10);
        if (!quantity || quantity < 1) { return outcome; }
        return Array(quantity + 1).join("0");
    }

    function fillWithZeros(textVal, lengthLimit, alignRight) {
        if (textVal === null) { textVal = ""; }
        textVal = "" + textVal;
        const zeroCount = lengthLimit - textVal.length;
        if (zeroCount <= 0) return textVal;
        const zeroString = obtainZeros(zeroCount);
        return alignRight ? (textVal + zeroString) : (zeroString + textVal);
    }

    function isCollection(item) {
        return Object.prototype.toString.call(item) === "[object Array]";
    }

    function isMap(item) {
        return Object.prototype.toString.call(item) === "[object Object]";
    }

    const arrayOperations = {
        traverse: (arr, cb) => {
            if (!arr || !arr.length) { return; }
            for (let i = 0; i < arr.length; i++) {
                if (cb(arr[i], i) === false) { return; }
            }
        },
        transform: (arr, cb) => {
            const res = [];
            if (!arr || !arr.length) { return res; }
            for (let i = 0; i < arr.length; i++) {
                res[i] = cb(arr[i], i);
            }
            return res;
        },
        extractProp: (arr, propName) => {
            return arrayOperations.transform(arr, item => item[propName]);
        },
        filterFalsy: (arr) => {
            return arr.filter(Boolean);
        },
        distinctItems: (arr) => {
            return Array.from(new Set(arr));
        },
        sharedElements: (arrA, arrB) => {
            const setB = new Set(arrB);
            return arrA.filter(item => setB.has(item));
        },
        locateFirst: (arr, predicateOrValue) => {
            if (typeof predicateOrValue !== "function") {
                const matchVal = predicateOrValue;
                predicateOrValue = item => item === matchVal;
            }
            for (let i = 0; i < arr.length; i++) {
                if (predicateOrValue(arr[i])) { return arr[i]; }
            }
            return undefined;
        },
        locateLast: (arr, predicate) => {
            for (let i = arr.length - 1; i >= 0; i--) {
                if (predicate(arr[i])) { return arr[i]; }
            }
            return undefined;
        },
        remainderFromStart: (arr, predicate) => {
            const firstTrueIndex = arr.findIndex(item => !predicate(item));
            return firstTrueIndex === -1 ? [] : arr.slice(firstTrueIndex);
        },
        remainderToEnd: (arr, predicate) => {
            const reversedArr = arr.slice().reverse();
            const firstTrueIndexReversed = reversedArr.findIndex(item => !predicate(item));
            return firstTrueIndexReversed === -1 ? [] : reversedArr.slice(firstTrueIndexReversed).reverse();
        }
    };

    function blendObjects(target, source) {
        for (let key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
        return target;
    }

    let libM;

    if (typeof require === "function") {
        try { libM = require('moment'); }
        catch (e) { /* ignored */ }
    }

    if (!libM && gbl.moment) {
        libM = gbl.moment;
    }

    if (!libM) {
        throw "Duration Rendering Utility requires Moment.js";
    }

    libM.duration.prototype.render = function () {
        const inputArguments = [].slice.call(arguments);
        const currentConfig = blendObjects({}, libM.duration.prototype.render.standardConfigs);

        currentConfig.sourceDuration = this;

        arrayOperations.traverse(inputArguments, arg => {
            if (typeof arg === "string" || typeof arg === "function") {
                currentConfig.renderTemplate = arg;
            } else if (typeof arg === "number") {
                currentConfig.numPrecision = arg;
            } else if (isMap(arg)) {
                blendObjects(currentConfig, arg);
            }
        });

        currentConfig.unitCategories = isCollection(currentConfig.unitCategories) ?
            currentConfig.unitCategories : currentConfig.unitCategories.split(" ");

        if (typeof currentConfig.renderTemplate === "function") {
            currentConfig.renderTemplate = currentConfig.renderTemplate.apply(currentConfig);
        }

        const unitPatterns = arrayOperations.transform(currentConfig.unitCategories, unit => currentConfig.tokenMatchRules[unit].source);
        const combinedPattern = currentConfig.tokenMatchRules.escapePattern.source + "|" +
                                unitPatterns.join("|") + "|" +
                                currentConfig.tokenMatchRules.genericPattern.source;
        const fragmentParser = new RegExp(combinedPattern, "g");

        const identifyFragmentType = (fragText) => {
            if (currentConfig.tokenMatchRules.escapePattern.test(fragText)) return "escape";
            for (let unit of currentConfig.unitCategories) {
                if (currentConfig.tokenMatchRules[unit].test(fragText)) return unit;
            }
            return "generic";
        };

        let parsedFragments = arrayOperations.transform(currentConfig.renderTemplate.match(fragmentParser), (fragText, idx) => {
            const type = identifyFragmentType(fragText);
            return {
                id: idx,
                length: fragText.length,
                text: (type === "escape" ? fragText.replace(currentConfig.tokenMatchRules.escapePattern, "$1") : fragText),
                kind: ((type === "escape" || type === "generic") ? null : type)
            };
        });

        const relevantUnits = arrayOperations.sharedElements(
            currentConfig.unitCategories,
            arrayOperations.distinctItems(arrayOperations.filterFalsy(arrayOperations.extractProp(parsedFragments, "kind")))
        );

        if (!relevantUnits.length) {
            return arrayOperations.extractProp(parsedFragments, "text").join("");
        }

        let unitRemainder = libM.duration(this);

        arrayOperations.traverse(relevantUnits, (unitName, idx) => {
            const fullValue = unitRemainder.as(unitName);
            const intValue = (fullValue > 0 ? Math.floor(fullValue) : Math.ceil(fullValue));
            const decimalPart = fullValue - intValue;

            const isLastUnit = ((idx + 1) === relevantUnits.length);
            const isFirstUnit = (!idx);

            arrayOperations.traverse(parsedFragments, fragment => {
                if (fragment.kind === unitName) {
                    blendObjects(fragment, {
                        value: fullValue,
                        wholeValue: intValue,
                        decimalValue: decimalPart,
                        isLastUnit: isLastUnit,
                        isFirstUnit: isFirstUnit
                    });

                    if (isFirstUnit && currentConfig.enforceLength === null && fragment.length > 1) {
                        currentConfig.enforceLength = true;
                    }
                }
            });
            unitRemainder.subtract(intValue, unitName);
        });

        if (currentConfig.trimStyle) {
            parsedFragments = (currentConfig.trimStyle === "left" ? arrayOperations.remainderFromStart : arrayOperations.remainderToEnd)(parsedFragments, fragment => {
                return !(fragment.isLastUnit || (fragment.kind !== null && fragment.wholeValue));
            });
        }

        let initialSegmentEncountered = false;

        if (currentConfig.trimStyle === "right") {
            parsedFragments.reverse();
        }

        parsedFragments = arrayOperations.transform(parsedFragments, fragment => {
            let processedValue, fractionalString;

            if (!fragment.kind) {
                return fragment.text;
            }

            if (fragment.isLastUnit && (currentConfig.numPrecision < 0)) {
                processedValue = (Math.floor(fragment.wholeValue * Math.pow(10, currentConfig.numPrecision)) * Math.pow(10, -currentConfig.numPrecision)).toString();
            } else {
                processedValue = fragment.wholeValue.toString();
            }

            processedValue = processedValue.replace(/^\-/, "");

            if (fragment.length > 1 && (initialSegmentEncountered || fragment.isFirstUnit || currentConfig.enforceLength)) {
                processedValue = fillWithZeros(processedValue, fragment.length);
            }

            if (fragment.isLastUnit && (currentConfig.numPrecision > 0)) {
                fractionalString = Math.abs(fragment.decimalValue).toFixed(currentConfig.numPrecision);
                processedValue += "." + fractionalString.substring(2);
            }

            if (fragment.isFirstUnit && fragment.value < 0) {
                processedValue = "-" + processedValue;
            }

            initialSegmentEncountered = true;
            return processedValue;
        });

        if (currentConfig.trimStyle === "right") {
            parsedFragments.reverse();
        }

        return parsedFragments.join("");
    };

    libM.duration.prototype.render.standardConfigs = {
        escapePattern: /\[(.+?)\]/,
        yearPattern: /[Yy]+/,
        monthPattern: /M+/,
        weekPattern: /[Ww]+/,
        dayPattern: /[Dd]+/,
        hourPattern: /[Hh]+/,
        minutePattern: /m+/,
        secondPattern: /s+/,
        millisecondPattern: /S+/,
        genericPattern: /.+?/,

        unitCategories: "escape year month week day hour minute second millisecond generic",

        trimStyle: "left",
        numPrecision: 0,
        enforceLength: null,

        renderTemplate: function () {
            const unitTypes = this.unitCategories;
            const currentDur = this.sourceDuration;
            const finalUnit = arrayOperations.locateLast(unitTypes, unit => {
                return currentDur._data[unit];
            });

            switch (finalUnit) {
                case "second":
                    return "h:mm:ss";
                case "minute":
                    return "d[d] h:mm";
                case "hour":
                    return "d[d] h[h]";
                case "day":
                    return "M[m] d[d]";
                case "week":
                    return "y[y] w[w]";
                case "month":
                    return "y[y] M[m]";
                case "year":
                    return "y[y]";
                default:
                    return "y[y] M[m] d[d] h:mm:ss";
            }
        }
    };

})(this);