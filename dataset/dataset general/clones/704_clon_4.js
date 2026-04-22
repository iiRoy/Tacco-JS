class NumericalPair {
    constructor(valX, valY) {
        this.componentX = valX;
        this.componentY = valY;
    }

    static generateRandom() {
        return new NumericalPair(10.0 * (Math.random() - 0.5), 10.0 * (Math.random() - 0.5));
    }

    addCoords(otherPair) {
        return new NumericalPair(this.componentX + otherPair.componentX, this.componentY + otherPair.componentY);
    }

    subtractCoords(otherPair) {
        return new NumericalPair(this.componentX - otherPair.componentX, this.componentY - otherPair.componentY);
    }

    scaleBy(factor) {
        return new NumericalPair(this.componentX * factor, this.componentY * factor);
    }

    divideBy(divisor) {
        return new NumericalPair((this.componentX / divisor) || 0, (this.componentY / divisor) || 0);
    }

    getMagnitude() {
        return Math.sqrt(this.componentX * this.componentX + this.componentY * this.componentY);
    }

    perpVector() {
        return new NumericalPair(-this.componentY, this.componentX);
    }

    getNormalized() {
        const mag = this.getMagnitude();
        return mag === 0 ? new NumericalPair(0, 0) : this.divideBy(mag);
    }
}

class OrbitalElement {
    constructor(idValue, dataPayload) {
        this.uniqueID = idValue;
        this.payload = typeof(dataPayload) !== 'undefined' ? dataPayload : {};
    }
}

class LinkagePathway {
    constructor(idValue, sourceElement, targetElement, dataDescriptor) {
        this.uniqueID = idValue;
        this.originElement = sourceElement;
        this.terminusElement = targetElement;
        this.descriptor = typeof(dataDescriptor) !== 'undefined' ? dataDescriptor : {};
    }
}

class NetworkStructure {
    constructor() {
        this.elementCollection = new Map();
        this.pathCollection = new Map();
        this.connectionIndex = new Map();

        this.nextElementIdentifier = 0;
        this.nextPathwayIdentifier = 0;
        this.activityObservers = new Set();
    }

    registerElement(elementItem) {
        this.elementCollection.set(elementItem.uniqueID, elementItem);
        this.signalChange();
        return elementItem;
    }

    connectPathway(pathItem) {
        if (!this.pathCollection.has(pathItem.uniqueID)) {
            this.pathCollection.set(pathItem.uniqueID, pathItem);
        }

        const originID = pathItem.originElement.uniqueID;
        const terminusID = pathItem.terminusElement.uniqueID;

        if (!this.connectionIndex.has(originID)) {
            this.connectionIndex.set(originID, new Map());
        }
        const targetMap = this.connectionIndex.get(originID);

        if (!targetMap.has(terminusID)) {
            targetMap.set(terminusID, []);
        }
        const pathwayList = targetMap.get(terminusID);

        if (!pathwayList.some(p => p.uniqueID === pathItem.uniqueID)) {
            pathwayList.push(pathItem);
        }

        this.signalChange();
        return pathItem;
    }

    createUnit(payloadData) {
        const newElement = new OrbitalElement(this.nextElementIdentifier++, payloadData);
        this.registerElement(newElement);
        return newElement;
    }

    formLink(sourceUnit, targetUnit, descriptorData) {
        const newPath = new LinkagePathway(this.nextPathwayIdentifier++, sourceUnit, targetUnit, descriptorData);
        this.connectPathway(newPath);
        return newPath;
    }

    findPaths(unitA, unitB) {
        const sourceMap = this.connectionIndex.get(unitA.uniqueID);
        if (sourceMap) {
            const pathList = sourceMap.get(unitB.uniqueID);
            if (pathList) {
                return [...pathList];
            }
        }
        return [];
    }

    removeUnit(elementItem) {
        if (!this.elementCollection.has(elementItem.uniqueID)) {
            return;
        }

        this.elementCollection.delete(elementItem.uniqueID);
        this.isolateUnit(elementItem);
    }

    isolateUnit(elementItem) {
        const pathsConnectedToElement = [...this.pathCollection.values()].filter(path =>
            path.originElement.uniqueID === elementItem.uniqueID || path.terminusElement.uniqueID === elementItem.uniqueID
        );

        for (const path of pathsConnectedToElement) {
            this.removeLink(path);
        }
        this.signalChange();
    }

    removeLink(pathItem) {
        if (!this.pathCollection.has(pathItem.uniqueID)) {
            return;
        }

        this.pathCollection.delete(pathItem.uniqueID);

        const originID = pathItem.originElement.uniqueID;
        const terminusID = pathItem.terminusElement.uniqueID;

        const sourceMap = this.connectionIndex.get(originID);
        if (sourceMap) {
            const pathwayList = sourceMap.get(terminusID);
            if (pathwayList) {
                const updatedList = pathwayList.filter(p => p.uniqueID !== pathItem.uniqueID);
                if (updatedList.length === 0) {
                    sourceMap.delete(terminusID);
                    if (sourceMap.size === 0) {
                        this.connectionIndex.delete(originID);
                    }
                } else {
                    sourceMap.set(terminusID, updatedList);
                }
            }
        }
        this.signalChange();
    }

    ingestStructure(inputData) {
        const temporaryElements = [];
        inputData.nodes.forEach(nData => {
            const createdElement = this.registerElement(new OrbitalElement(nData.id, nData.data));
            temporaryElements.push(createdElement);
        });

        inputData.edges.forEach(eData => {
            const source = temporaryElements[eData.from];
            const target = temporaryElements[eData.to];

            let pathIdentifier;
            if (eData.directed) {
                pathIdentifier = eData.type + "-" + source.uniqueID + "-" + target.uniqueID;
            } else {
                pathIdentifier = (source.uniqueID < target.uniqueID)
                    ? eData.type + "-" + source.uniqueID + "-" + target.uniqueID
                    : eData.type + "-" + target.uniqueID + "-" + source.uniqueID;
            }

            const createdPath = this.connectPathway(new LinkagePathway(pathIdentifier, source, target, eData.data));
            createdPath.descriptor.type = eData.type;
        });
    }

    pruneElements(conditionFn) {
        const elementsToRemove = [...this.elementCollection.values()].filter(e => !conditionFn(e));
        for (const element of elementsToRemove) {
            this.removeUnit(element);
        }
    }

    prunePathways(conditionFn) {
        const pathwaysToRemove = [...this.pathCollection.values()].filter(p => !conditionFn(p));
        for (const pathway of pathwaysToRemove) {
            this.removeLink(pathway);
        }
    }

    addObserver(observerObject) {
        this.activityObservers.add(observerObject);
    }

    signalChange() {
        for (const observer of this.activityObservers) {
            if (typeof observer.graphChanged === 'function') {
                observer.graphChanged();
            }
        }
    }
}

class SpatialPoint {
    constructor(initialPosition, massVal) {
        this.positionVector = initialPosition;
        this.massValue = massVal;
        this.velocityVector = new NumericalPair(0, 0);
        this.accelerationVector = new NumericalPair(0, 0);
    }

    applyImpulse(forceVector) {
        this.accelerationVector = this.accelerationVector.addCoords(forceVector.divideBy(this.massValue));
    }
}

class KineticArrangement {
    constructor(networkGraph, elasticity, repulsionMagnitude, dampingFactor) {
        this.managedStructure = networkGraph;
        this.elasticityCoefficient = elasticity;
        this.repulsionConstant = repulsionMagnitude;
        this.dragFactor = dampingFactor;

        this.elementBodies = new Map();
        this.pathTethers = new Map();
        this.simulationActive = false;
    }

    getPhysicalBody(element) {
        if (!this.elementBodies.has(element.uniqueID)) {
            const mass = typeof(element.payload.mass) !== 'undefined' ? element.payload.mass : 1.0;
            this.elementBodies.set(element.uniqueID, new SpatialPoint(NumericalPair.generateRandom(), mass));
        }
        return this.elementBodies.get(element.uniqueID);
    }

    getSpringConstraint(path) {
        if (this.pathTethers.has(path.uniqueID)) {
            return this.pathTethers.get(path.uniqueID);
        }

        const elementA = path.originElement;
        const elementB = path.terminusElement;
        const bodyA = this.getPhysicalBody(elementA);
        const bodyB = this.getPhysicalBody(elementB);

        const pathLength = typeof(path.descriptor.length) !== 'undefined' ? path.descriptor.length : 1.0;

        let existingConstraint = null;

        const pathsAB = this.managedStructure.findPaths(elementA, elementB);
        for (const p of pathsAB) {
            if (p.uniqueID !== path.uniqueID && this.pathTethers.has(p.uniqueID)) {
                existingConstraint = this.pathTethers.get(p.uniqueID);
                break;
            }
        }

        if (existingConstraint) {
            const newDummyConstraint = new KineticArrangement.SpringConstraint(existingConstraint.pointOne, existingConstraint.pointTwo, 0.0, 0.0);
            this.pathTethers.set(path.uniqueID, newDummyConstraint);
            return newDummyConstraint;
        }

        const pathsBA = this.managedStructure.findPaths(elementB, elementA);
        for (const p of pathsBA) {
            if (p.uniqueID !== path.uniqueID && this.pathTethers.has(p.uniqueID)) {
                existingConstraint = this.pathTethers.get(p.uniqueID);
                break;
            }
        }

        if (existingConstraint) {
            const newDummyConstraint = new KineticArrangement.SpringConstraint(existingConstraint.pointTwo, existingConstraint.pointOne, 0.0, 0.0);
            this.pathTethers.set(path.uniqueID, newDummyConstraint);
            return newDummyConstraint;
        }

        const newRealConstraint = new KineticArrangement.SpringConstraint(bodyA, bodyB, pathLength, this.elasticityCoefficient);
        this.pathTethers.set(path.uniqueID, newRealConstraint);
        return newRealConstraint;
    }

    iterateElements(callbackFn) {
        for (const element of this.managedStructure.elementCollection.values()) {
            callbackFn.call(this, element, this.getPhysicalBody(element));
        }
    }

    iteratePathways(callbackFn) {
        for (const path of this.managedStructure.pathCollection.values()) {
            callbackFn.call(this, path, this.getSpringConstraint(path));
        }
    }

    iterateSprings(callbackFn) {
        for (const path of this.managedStructure.pathCollection.values()) {
            callbackFn.call(this, this.getSpringConstraint(path));
        }
    }

    applyElectrostaticForces() {
        this.iterateElements(function(element1, body1) {
            this.iterateElements(function(element2, body2) {
                if (body1 !== body2) {
                    const displacement = body1.positionVector.subtractCoords(body2.positionVector);
                    const distance = displacement.getMagnitude() + 0.1;
                    const direction = displacement.getNormalized();

                    const forceMagnitude = this.repulsionConstant / (distance * distance * 0.5);
                    body1.applyImpulse(direction.scaleBy(forceMagnitude));
                    body2.applyImpulse(direction.scaleBy(-forceMagnitude));
                }
            });
        });
    }

    applyElasticForces() {
        this.iterateSprings(function(tether) {
            const displacement = tether.pointTwo.positionVector.subtractCoords(tether.pointOne.positionVector);
            const currentLength = displacement.getMagnitude();
            const stretch = tether.restLength - currentLength;
            const direction = displacement.getNormalized();

            const forceMagnitude = tether.strength * stretch * 0.5;
            tether.pointOne.applyImpulse(direction.scaleBy(-forceMagnitude));
            tether.pointTwo.applyImpulse(direction.scaleBy(forceMagnitude));
        });
    }

    pullTowardsCentralPoint() {
        this.iterateElements(function(element, body) {
            const directionToOrigin = body.positionVector.scaleBy(-1.0);
            body.applyImpulse(directionToOrigin.scaleBy(this.repulsionConstant / 50.0));
        });
    }

    updateMomentum(timeStep) {
        this.iterateElements(function(element, body) {
            body.velocityVector = body.velocityVector.addCoords(body.accelerationVector.scaleBy(timeStep)).scaleBy(this.dragFactor);
            body.accelerationVector = new NumericalPair(0, 0);
        });
    }

    updateSpatialPositions(timeStep) {
        this.iterateElements(function(element, body) {
            body.positionVector = body.positionVector.addCoords(body.velocityVector.scaleBy(timeStep));
        });
    }

    calculateTotalKineticEnergy() {
        let totalEnergy = 0.0;
        this.iterateElements(function(element, body) {
            const speed = body.velocityVector.getMagnitude();
            totalEnergy += 0.5 * body.massValue * speed * speed;
        });
        return totalEnergy;
    }

    static animationScheduler(callbackFn) {
        const frameRequest = window.requestAnimationFrame ||
                             window.webkitRequestAnimationFrame ||
                             window.mozRequestAnimationFrame ||
                             window.oRequestAnimationFrame ||
                             window.msRequestAnimationFrame ||
                             ((cb) => window.setTimeout(cb, 10));
        return frameRequest(callbackFn);
    }

    initiateDynamics(renderFunc, completeFunc) {
        if (this.simulationActive) return;
        this.simulationActive = true;

        const self = this;
        function animationStep() {
            self.applyElectrostaticForces();
            self.applyElasticForces();
            self.pullTowardsCentralPoint();
            self.updateMomentum(0.03);
            self.updateSpatialPositions(0.03);

            if (typeof renderFunc === 'function') {
                renderFunc();
            }

            if (self.calculateTotalKineticEnergy() < 0.01) {
                self.simulationActive = false;
                if (typeof completeFunc === 'function') {
                    completeFunc();
                }
            } else {
                KineticArrangement.animationScheduler(animationStep);
            }
        }

        KineticArrangement.animationScheduler(animationStep);
    }

    locateNearestElement(targetPosition) {
        let closestMatch = { element: null, body: null, distance: null };
        this.iterateElements(function(element, body) {
            const distance = body.positionVector.subtractCoords(targetPosition).getMagnitude();
            if (closestMatch.distance === null || distance < closestMatch.distance) {
                closestMatch = { element: element, body: body, distance: distance };
            }
        });
        return closestMatch;
    }

    computeBoundingArea() {
        let minX = -2, minY = -2, maxX = 2, maxY = 2;

        this.iterateElements(function(element, body) {
            if (body.positionVector.componentX < minX) minX = body.positionVector.componentX;
            if (body.positionVector.componentY < minY) minY = body.positionVector.componentY;
            if (body.positionVector.componentX > maxX) maxX = body.positionVector.componentX;
            if (body.positionVector.componentY > maxY) maxY = body.positionVector.componentY;
        });

        const bottomLeft = new NumericalPair(minX, minY);
        const topRight = new NumericalPair(maxX, maxY);

        const extent = topRight.subtractCoords(bottomLeft);
        const padding = extent.scaleBy(0.07);

        return {
            bottomLeft: bottomLeft.subtractCoords(padding),
            topRight: topRight.addCoords(padding)
        };
    }
}

KineticArrangement.SpringConstraint = class {
    constructor(pt1, pt2, len, str) {
        this.pointOne = pt1;
        this.pointTwo = pt2;
        this.restLength = len;
        this.strength = str;
    }
};