class TreeNode {
    constructor(val) {
        this.value = val;
        this.ancestor = null;
        this.leftDescendant = null;
        this.rightDescendant = null;
    }
}

class TreeStructureManager {
    constructor() {
        this.nodeRegistry = new Map();
        this.principalNode = null;
    }

    _obtainNode(val) {
        if (val === -1) {
            return null;
        }
        if (!this.nodeRegistry.has(val)) {
            this.nodeRegistry.set(val, new TreeNode(val));
        }
        return this.nodeRegistry.get(val);
    }

    establishLinks(nodeVal, leftChildVal, rightChildVal) {
        const currentEntity = this._obtainNode(nodeVal);
        if (!currentEntity) return;

        const leftEntity = this._obtainNode(leftChildVal);
        const rightEntity = this._obtainNode(rightChildVal);

        currentEntity.leftDescendant = leftEntity;
        currentEntity.rightDescendant = rightEntity;

        if (leftEntity) {
            leftEntity.ancestor = currentEntity;
        }
        if (rightEntity) {
            rightEntity.ancestor = currentEntity;
        }
    }

    discoverOrigin() {
        if (this.principalNode) {
            return this.principalNode;
        }
        for (const entity of this.nodeRegistry.values()) {
            if (entity.ancestor === null) {
                this.principalNode = entity;
                return entity;
            }
        }
        return null;
    }

    inspectPrefix(entity = this.discoverOrigin()) {
        if (entity === null) return;
        process.stdout.write(` ${entity.value}`);
        this.inspectPrefix(entity.leftDescendant);
        this.inspectPrefix(entity.rightDescendant);
    }

    inspectInfix(entity = this.discoverOrigin()) {
        if (entity === null) return;
        this.inspectInfix(entity.leftDescendant);
        process.stdout.write(` ${entity.value}`);
        this.inspectInfix(entity.rightDescendant);
    }

    inspectPostfix(entity = this.discoverOrigin()) {
        if (entity === null) return;
        this.inspectPostfix(entity.leftDescendant);
        this.inspectPostfix(entity.rightDescendant);
        process.stdout.write(` ${entity.value}`);
    }
}

function executeSystem() {
    const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    const totalNodes = Number(inputData.shift());
    const manager = new TreeStructureManager();

    inputData.map(line => line.split(' ').map(Number)).forEach(numericLine => {
        manager.establishLinks(...numericLine);
    });

    console.log('Preorder');
    manager.inspectPrefix();
    console.log('\nInorder');
    manager.inspectInfix();
    console.log('\nPostorder');
    manager.inspectPostfix();
    console.log();
}

executeSystem();