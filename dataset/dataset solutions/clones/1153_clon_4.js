class ElementGroupManager {
    #representativeMap;
    #groupSizeMap;

    constructor(entityCount) {
        this.#representativeMap = new Map();
        this.#groupSizeMap = new Map();
        for (let entityIdentifier = 0; entityIdentifier < entityCount; ++entityIdentifier) {
            this.#representativeMap.set(entityIdentifier, entityIdentifier);
            this.#groupSizeMap.set(entityIdentifier, 1);
        }
    }

    #locateRepresentative(individualElement) {
        let currentMember = individualElement;
        const pathElements = [];
        while (this.#representativeMap.get(currentMember) !== currentMember) {
            pathElements.push(currentMember);
            currentMember = this.#representativeMap.get(currentMember);
        }
        for (const elementOnPath of pathElements) {
            this.#representativeMap.set(elementOnPath, currentMember);
        }
        return currentMember;
    }

    #combineGroups(memberOne, memberTwo) {
        let rootOne = this.#locateRepresentative(memberOne);
        let rootTwo = this.#locateRepresentative(memberTwo);

        if (rootOne === rootTwo) {
            return;
        }

        let sizeOfGroupOne = this.#groupSizeMap.get(rootOne);
        let sizeOfGroupTwo = this.#groupSizeMap.get(rootTwo);

        if (sizeOfGroupOne < sizeOfGroupTwo) {
            this.#representativeMap.set(rootOne, rootTwo);
            this.#groupSizeMap.set(rootTwo, sizeOfGroupOne + sizeOfGroupTwo);
            this.#groupSizeMap.delete(rootOne);
        } else {
            this.#representativeMap.set(rootTwo, rootOne);
            this.#groupSizeMap.set(rootOne, sizeOfGroupOne + sizeOfGroupTwo);
            this.#groupSizeMap.delete(rootTwo);
        }
    }

    areElementsConnected(elementA, elementB) {
        return this.#locateRepresentative(elementA) === this.#locateRepresentative(elementB);
    }

    effectGroupMerge(elementA, elementB) {
        this.#combineGroups(elementA, elementB);
    }
}

var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var instructionStream = sourceData.split('\n');

var initialConfiguration = instructionStream.shift().trim().split(' ');
var totalEntitiesCount = +initialConfiguration[0];
var queryTaskCount = +initialConfiguration[1];

const entityLinker = new ElementGroupManager(totalEntitiesCount);

var currentCommandSegment;
while (currentCommandSegment = instructionStream.shift()) {
    var operationComponents = currentCommandSegment.trim().split(' ');
    var actionType = operationComponents[0];
    var firstOperand = +operationComponents[1];
    var secondOperand = +operationComponents[2];

    if (actionType === '0') {
        entityLinker.effectGroupMerge(firstOperand, secondOperand);
    } else {
        console.log(entityLinker.areElementsConnected(firstOperand, secondOperand) ? 1 : 0);
    }
}