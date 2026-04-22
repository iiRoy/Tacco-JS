function GroveStructure(configOptions) {
    var configuration = configOptions || {};
    this.subsidiaryAttribute = configuration.subsidiaryAttribute || 'children';
    this.comparisonProcedure = configuration.comparisonProcedure || null;
}

function BranchUnit(payloadData) {
    this.payload = payloadData;
    this.originator = undefined;
    this.offspring = [];
}

GroveStructure.prototype.construct = function(initialData) {
    if (typeof initialData !== 'object' || initialData === null) {
        throw new TypeError('Payload must be of type object.');
    }

    var groveBuilder = this;

    function formBranch(dataSegment, parentBranch) {
        if (typeof dataSegment !== 'object' || dataSegment === null) {
            throw new TypeError('Payload must be of type object.');
        }

        var currentSegment = new BranchUnit(dataSegment);
        currentSegment.originator = parentBranch;

        var subElements = dataSegment[groveBuilder.subsidiaryAttribute];
        if (Array.isArray(subElements) && subElements.length > 0) {
            var temporaryOffspring = subElements.map(function(subDataElement) {
                return formBranch(subDataElement, currentSegment);
            });

            if (groveBuilder.comparisonProcedure) {
                var indexedOffspring = temporaryOffspring.map(function(item, index) {
                    return { item: item, initialOrder: index };
                });

                indexedOffspring.sort(function(itemA, itemB) {
                    var comparisonResult = groveBuilder.comparisonProcedure(itemA.item.payload, itemB.item.payload);
                    if (comparisonResult === 0) {
                        return itemA.initialOrder - itemB.initialOrder;
                    }
                    return comparisonResult;
                });

                currentSegment.offspring = indexedOffspring.map(function(pair) {
                    return pair.item;
                });
            } else {
                currentSegment.offspring = temporaryOffspring;
            }
        } else {
            currentSegment.offspring = [];
        }
        return currentSegment;
    }

    return formBranch(initialData, undefined);
};


BranchUnit.prototype.appendKid = function(newOffspring) {
    if (!(newOffspring instanceof BranchUnit)) {
        throw new TypeError('Kid must be a BranchUnit instance.');
    }
    this.offspring.push(newOffspring);
    newOffspring.originator = this;
};

BranchUnit.prototype.insertKidAt = function(newOffspring, insertionPoint) {
    if (!(newOffspring instanceof BranchUnit)) {
        throw new TypeError('Kid must be a BranchUnit instance.');
    }
    if (insertionPoint < 0 || insertionPoint > this.offspring.length) {
        throw new Error('Invalid insertion point.');
    }
    this.offspring.splice(insertionPoint, 0, newOffspring);
    newOffspring.originator = this;
};

BranchUnit.prototype.traceRoute = function() {
    var pathElements = [];
    var currentElement = this;
    while (currentElement) {
        pathElements.unshift(currentElement);
        currentElement = currentElement.originator;
    }
    return pathElements;
};

BranchUnit.prototype.navigate = function(traversalArguments, actionProcedure, executionContext) {
    var procedure = actionProcedure;
    var contextRef = executionContext;
    var options = {};

    if (typeof traversalArguments === 'object' && traversalArguments !== null) {
        options = traversalArguments;
    } else {
        procedure = traversalArguments;
        contextRef = actionProcedure;
    }

    var methodChoice = options.strategy || 'pre';

    switch (methodChoice) {
        case 'pre':
            var stackPreOrder = [this];
            while (stackPreOrder.length > 0) {
                var currentItem = stackPreOrder.pop();
                if (procedure.call(contextRef, currentItem) === false) {
                    return;
                }
                for (var i = currentItem.offspring.length - 1; i >= 0; i--) {
                    stackPreOrder.push(currentItem.offspring[i]);
                }
            }
            break;
        case 'post':
            var stackStage1 = [this];
            var stackStage2 = [];
            while (stackStage1.length > 0) {
                var currentStage1 = stackStage1.pop();
                stackStage2.push(currentStage1);
                for (var j = 0; j < currentStage1.offspring.length; j++) {
                    stackStage1.push(currentStage1.offspring[j]);
                }
            }
            while (stackStage2.length > 0) {
                var currentStage2 = stackStage2.pop();
                if (procedure.call(contextRef, currentStage2) === false) {
                    return;
                }
            }
            break;
        case 'breadth':
            var queueBreadthFirst = [this];
            var currentIndex = 0;
            while (currentIndex < queueBreadthFirst.length) {
                var currentBreadth = queueBreadthFirst[currentIndex++];
                if (procedure.call(contextRef, currentBreadth) === false) {
                    return;
                }
                for (var k = 0; k < currentBreadth.offspring.length; k++) {
                    queueBreadthFirst.push(currentBreadth.offspring[k]);
                }
            }
            break;
        default:
            throw new Error('Unrecognized traversal method. Permissible methods are \'pre\' [default], \'post\' and \'breadth\'.');
    }
};

BranchUnit.prototype.locateAll = function(evaluationPredicate) {
    var gatheredUnits = [];
    this.navigate(function(unitToEvaluate) {
        if (evaluationPredicate(unitToEvaluate)) {
            gatheredUnits.push(unitToEvaluate);
        }
    });
    return gatheredUnits;
};

BranchUnit.prototype.locateOne = function(evaluationPredicate) {
    var discoveredUnit = undefined;
    this.navigate(function(unitToEvaluate) {
        if (evaluationPredicate(unitToEvaluate)) {
            discoveredUnit = unitToEvaluate;
            return false;
        }
    });
    return discoveredUnit;
};

BranchUnit.prototype.sever = function() {
    if (this.originator) {
        var positionToRemove = this.originator.offspring.indexOf(this);
        if (positionToRemove > -1) {
            this.originator.offspring.splice(positionToRemove, 1);
        }
        this.originator = undefined;
    }
    return this;
};

BranchUnit.prototype.possessesOffspring = function() {
    return this.offspring.length > 0;
};

module.exports = GroveStructure;