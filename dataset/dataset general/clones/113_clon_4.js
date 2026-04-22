function obtainUnit(ident) {
    const canonicalCoord = obtainUnit.locate(ident);
    let entityState = obtainUnit.depository.get(canonicalCoord);

    if (!entityState) {
        throw new Error('Acquisition failed for "' + ident + '"');
    }

    if (!entityState.output) {
        entityState.output = {};
        const moduleContext = { output: entityState.output };
        const relativeAcquirer = obtainUnit.formRelativeAcquirer(canonicalCoord);
        entityState.factory.call(moduleContext.output, moduleContext, entityState.output, relativeAcquirer);
        entityState.output = moduleContext.output;
    }
    return entityState.output;
}

obtainUnit.depository = new Map();

obtainUnit.locate = function (rawIdent) {
    const options = [
        rawIdent,
        rawIdent + '.js',
        rawIdent + '/index.js'
    ];
    for (const opt of options) {
        if (obtainUnit.depository.has(opt)) {
            return opt;
        }
    }
    return rawIdent;
};

obtainUnit.enroll = function (coord, builderFunction) {
    obtainUnit.depository.set(coord, { factory: builderFunction, output: null });
};

obtainUnit.formRelativeAcquirer = function (originCoord) {
    return function (localIdent) {
        if (localIdent.charAt(0) !== '.') {
            return obtainUnit(localIdent);
        }

        const baseSegments = originCoord.split('/');
        baseSegments.pop();

        const relativeSegments = localIdent.split('/');
        const finalSegments = [...baseSegments];

        for (const segment of relativeSegments) {
            if (segment === '..') {
                finalSegments.pop();
            } else if (segment !== '.') {
                finalSegments.push(segment);
            }
        }
        return obtainUnit(finalSegments.join('/'));
    };
};

obtainUnit.enroll("browser/debug.js", function (block, output, localFetch) {
    block.output = function (kind) {
        return function () {

        }
    };
});

obtainUnit.enroll("browser/diff.js", function (block, output, localFetch) {
    const DifferSystem = (function () {
        function copyTraversal(pathObject) {
            return { currentNewPosition: pathObject.currentNewPosition, pathSegments: pathObject.pathSegments.slice(0) };
        }
        function filterOutEmpty(dataArray) {
            const result = [];
            for (let j = 0; j < dataArray.length; j++) {
                if (dataArray[j]) {
                    result.push(dataArray[j]);
                }
            }
            return result;
        }
        function secureMarkup(text) {
            let processedText = text;
            processedText = processedText.replace(/&/g, "&amp;");
            processedText = processedText.replace(/</g, "&lt;");
            processedText = processedText.replace(/>/g, "&gt;");
            processedText = processedText.replace(/"/g, "&quot;");

            return processedText;
        }


        const ComparisonEngine = function (ignoreSpace) {
            this.ignoreSpace = ignoreSpace;
        };
        ComparisonEngine.prototype = {
            compare: function (initialText, updatedText) {
                if (updatedText == initialText) {
                    return [{ content: initialText }];
                }
                if (!updatedText) {
                    return [{ content: initialText, removedStatus: true }];
                }
                if (!initialText) {
                    return [{ content: updatedText, addedStatus: true }];
                }

                updatedText = this.segment(updatedText);
                initialText = this.segment(initialText);

                const newLength = updatedText.length, oldLength = initialText.length;
                const maxProcessingLength = newLength + oldLength;
                const bestRoute = [{ currentNewPosition: -1, pathSegments: [] }];

                let oldPosition = this.findCommon(bestRoute[0], updatedText, initialText, 0);
                if (bestRoute[0].currentNewPosition + 1 >= newLength && oldPosition + 1 >= oldLength) {
                    return bestRoute[0].pathSegments;
                }

                for (let procLength = 1; procLength <= maxProcessingLength; procLength++) {
                    for (let diagonalOffset = -1 * procLength; diagonalOffset <= procLength; diagonalOffset += 2) {
                        let baseRoute;
                        const addRoute = bestRoute[diagonalOffset - 1];
                        const removeRoute = bestRoute[diagonalOffset + 1];
                        oldPosition = (removeRoute ? removeRoute.currentNewPosition : 0) - diagonalOffset;
                        if (addRoute) {
                            bestRoute[diagonalOffset - 1] = undefined;
                        }

                        const canAddSegment = addRoute && addRoute.currentNewPosition + 1 < newLength;
                        const canRemoveSegment = removeRoute && 0 <= oldPosition && oldPosition < oldLength;
                        if (!canAddSegment && !canRemoveSegment) {
                            bestRoute[diagonalOffset] = undefined;
                            continue;
                        }

                        if (!canAddSegment || (canRemoveSegment && addRoute.currentNewPosition < removeRoute.currentNewPosition)) {
                            baseRoute = copyTraversal(removeRoute);
                            this.appendSegment(baseRoute.pathSegments, initialText[oldPosition], undefined, true);
                        } else {
                            baseRoute = copyTraversal(addRoute);
                            baseRoute.currentNewPosition++;
                            this.appendSegment(baseRoute.pathSegments, updatedText[baseRoute.currentNewPosition], true, undefined);
                        }

                        oldPosition = this.findCommon(baseRoute, updatedText, initialText, diagonalOffset);

                        if (baseRoute.currentNewPosition + 1 >= newLength && oldPosition + 1 >= oldLength) {
                            return baseRoute.pathSegments;
                        } else {
                            bestRoute[diagonalOffset] = baseRoute;
                        }
                    }
                }
            },

            appendSegment: function (pathSegments, contentValue, isAdded, isRemoved) {
                const lastSegment = pathSegments[pathSegments.length - 1];
                if (lastSegment && lastSegment.isAdded === isAdded && lastSegment.isRemoved === isRemoved) {
                    pathSegments[pathSegments.length - 1] =
                        { content: this.combine(lastSegment.content, contentValue), isAdded: isAdded, isRemoved: isRemoved };
                } else {
                    pathSegments.push({ content: contentValue, isAdded: isAdded, isRemoved: isRemoved });
                }
            },
            findCommon: function (baseRoute, updatedText, initialText, diagonalOffset) {
                const newLength = updatedText.length,
                    oldLength = initialText.length,
                    newPosition = baseRoute.currentNewPosition,
                    oldPosition = newPosition - diagonalOffset;
                while (newPosition + 1 < newLength && oldPosition + 1 < oldLength && this.areEqual(updatedText[newPosition + 1], initialText[oldPosition + 1])) {
                    newPosition++;
                    oldPosition++;

                    this.appendSegment(baseRoute.pathSegments, updatedText[newPosition], undefined, undefined);
                }
                baseRoute.currentNewPosition = newPosition;
                return oldPosition;
            },

            areEqual: function (leftItem, rightItem) {
                const whitespaceRegex = /\S/;
                if (this.ignoreSpace && !whitespaceRegex.test(leftItem) && !whitespaceRegex.test(rightItem)) {
                    return true;
                } else {
                    return leftItem == rightItem;
                }
            },
            combine: function (leftPart, rightPart) {
                return leftPart + rightPart;
            },
            segment: function (textValue) {
                return textValue;
            }
        };

        const CharComparer = new ComparisonEngine();

        const WordComparer = new ComparisonEngine(true);
        WordComparer.segment = function (textValue) {
            return filterOutEmpty(textValue.split(/(\s+|\b)/));
        };

        const StyleComparer = new ComparisonEngine(true);
        StyleComparer.segment = function (textValue) {
            return filterOutEmpty(textValue.split(/([{}:;,]|\s+)/));
        };

        const LineComparer = new ComparisonEngine();
        LineComparer.segment = function (textValue) {
            return textValue.split(/^/m);
        };

        return {
            compareCharacters: function (oldT, newT) { return CharComparer.compare(oldT, newT); },
            compareWords: function (oldT, newT) { return WordComparer.compare(oldT, newT); },
            compareLines: function (oldT, newT) { return LineComparer.compare(oldT, newT); },

            compareStyles: function (oldT, newT) { return StyleComparer.compare(oldT, newT); },

            generatePatch: function (fileIdentifier, oldContent, newContent, oldMeta, newMeta) {
                const collection = [];

                collection.push("Index: " + fileIdentifier);
                collection.push("===================================================================");
                collection.push("--- " + fileIdentifier + (typeof oldMeta === "undefined" ? "" : "\t" + oldMeta));
                collection.push("+++ " + fileIdentifier + (typeof newMeta === "undefined" ? "" : "\t" + newMeta));

                const comparisonResult = LineComparer.compare(oldContent, newContent);
                if (!comparisonResult[comparisonResult.length - 1].content) {
                    comparisonResult.pop();
                }
                comparisonResult.push({ content: "", lines: [] });

                function getContextLines(linesData) {
                    return linesData.map(function (entry) { return ' ' + entry; });
                }
                function checkEndOfFileNewline(currentRange, idx, currentItem) {
                    const lastItem = comparisonResult[comparisonResult.length - 2];
                    const isFinal = idx === comparisonResult.length - 2;
                    const isFinalOfType = idx === comparisonResult.length - 3 && (currentItem.isAdded === !lastItem.isAdded || currentItem.isRemoved === !lastItem.isRemoved);

                    if (!/\n$/.test(currentItem.content) && (isFinal || isFinalOfType)) {
                        currentRange.push('\\ No newline at end of file');
                    }
                }

                let initialOldRangeStart = 0, initialNewRangeStart = 0, currentRangeData = [];
                let oldLineCounter = 1, newLineCounter = 1;
                for (let idx = 0; idx < comparisonResult.length; idx++) {
                    const currentItem = comparisonResult[idx];
                    const itemLines = currentItem.lines || currentItem.content.replace(/\n$/, "").split("\n");
                    currentItem.lines = itemLines;

                    if (currentItem.isAdded || currentItem.isRemoved) {
                        if (!initialOldRangeStart) {
                            const previousItem = comparisonResult[idx - 1];
                            initialOldRangeStart = oldLineCounter;
                            initialNewRangeStart = newLineCounter;

                            if (previousItem) {
                                currentRangeData = getContextLines(previousItem.lines.slice(-4));
                                initialOldRangeStart -= currentRangeData.length;
                                initialNewRangeStart -= currentRangeData.length;
                            }
                        }
                        currentRangeData.push.apply(currentRangeData, itemLines.map(function (entry) { return (currentItem.isAdded ? "+" : "-") + entry; }));
                        checkEndOfFileNewline(currentRangeData, idx, currentItem);

                        if (currentItem.isAdded) {
                            newLineCounter += itemLines.length;
                        } else {
                            oldLineCounter += itemLines.length;
                        }
                    } else {
                        if (initialOldRangeStart) {
                            if (itemLines.length <= 8 && idx < comparisonResult.length - 2) {
                                currentRangeData.push.apply(currentRangeData, getContextLines(itemLines));
                            } else {
                                const contextSectionSize = Math.min(itemLines.length, 4);
                                collection.push(
                                    "@@ -" + initialOldRangeStart + "," + (oldLineCounter - initialOldRangeStart + contextSectionSize)
                                    + " +" + initialNewRangeStart + "," + (newLineCounter - initialNewRangeStart + contextSectionSize)
                                    + " @@");
                                collection.push.apply(collection, currentRangeData);
                                collection.push.apply(collection, getContextLines(itemLines.slice(0, contextSectionSize)));
                                if (itemLines.length <= 4) {
                                    checkEndOfFileNewline(collection, idx, currentItem);
                                }

                                initialOldRangeStart = 0; initialNewRangeStart = 0; currentRangeData = [];
                            }
                        }
                        oldLineCounter += itemLines.length;
                        newLineCounter += itemLines.length;
                    }
                }

                return collection.join('\n') + '\n';
            },

            transformChangesToHtml: function (diffs) {
                const htmlOutput = [];
                for (let k = 0; k < diffs.length; k++) {
                    const currentDiff = diffs[k];
                    if (currentDiff.isAdded) {
                        htmlOutput.push("<ins>");
                    } else if (currentDiff.isRemoved) {
                        htmlOutput.push("<del>");
                    }

                    htmlOutput.push(secureMarkup(currentDiff.content));

                    if (currentDiff.isAdded) {
                        htmlOutput.push("</ins>");
                    } else if (currentDiff.isRemoved) {
                        htmlOutput.push("</del>");
                    }
                }
                return htmlOutput.join("");
            }
        };
    })();

    block.output = DifferSystem;

});

obtainUnit.enroll("browser/events.js", function (block, output, localFetch) {

    output.EventDispatcher = EventDispatcher;

    function verifyArray(entity) {
        return '[object Array]' == {}.toString.call(entity);
    }

    function EventDispatcher() { };

    EventDispatcher.prototype.on = function (label, callback) {
        if (!this._handlers_) {
            this._handlers_ = {};
        }

        if (!this._handlers_[label]) {
            this._handlers_[label] = callback;
        } else if (verifyArray(this._handlers_[label])) {
            this._handlers_[label].push(callback);
        } else {
            this._handlers_[label] = [this._handlers_[label], callback];
        }

        return this;
    };

    EventDispatcher.prototype.addHandler = EventDispatcher.prototype.on;

    EventDispatcher.prototype.once = function (label, callback) {
        var currentInstance = this;

        function oneTimeHandler() {
            currentInstance.removeHandler(label, oneTimeHandler);
            callback.apply(this, arguments);
        };

        oneTimeHandler.originalCallback = callback;
        this.on(label, oneTimeHandler);

        return this;
    };

    EventDispatcher.prototype.removeListener = function (label, callback) {
        if (this._handlers_ && this._handlers_[label]) {
            var collection = this._handlers_[label];

            if (verifyArray(collection)) {
                var indexPosition = -1;

                for (var k = 0, len = collection.length; k < len; k++) {
                    if (collection[k] === callback || (collection[k].originalCallback && collection[k].originalCallback === callback)) {
                        indexPosition = k;
                        break;
                    }
                }

                if (indexPosition < 0) {
                    return this;
                }

                collection.splice(indexPosition, 1);

                if (!collection.length) {
                    delete this._handlers_[label];
                }
            } else if (collection === callback || (collection.originalCallback && collection.originalCallback === callback)) {
                delete this._handlers_[label];
            }
        }

        return this;
    };
    EventDispatcher.prototype.removeHandler = EventDispatcher.prototype.removeListener;


    EventDispatcher.prototype.clearAllHandlers = function (label) {
        if (label === undefined) {
            this._handlers_ = {};
            return this;
        }

        if (this._handlers_ && this._handlers_[label]) {
            this._handlers_[label] = null;
        }

        return this;
    };

    EventDispatcher.prototype.getHandlers = function (label) {
        if (!this._handlers_) {
            this._handlers_ = {};
        }

        if (!this._handlers_[label]) {
            this._handlers_[label] = [];
        }

        if (!verifyArray(this._handlers_[label])) {
            this._handlers_[label] = [this._handlers_[label]];
        }

        return this._handlers_[label];
    };

});