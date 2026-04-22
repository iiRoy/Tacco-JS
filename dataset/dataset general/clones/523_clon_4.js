const policyVariants = {
  ITEM_COUNT: Symbol('ITEM_COUNT'),
  MEMORY_USAGE: Symbol('MEMORY_USAGE'),
};

class LinkedListNode {
  constructor(identifier, storedValue) {
    this.identifier = identifier;
    this.storedValue = storedValue;
    this.previous = null;
    this.next = null;
  }
}

class LinkedSequence {
  constructor() {
    this.first = null;
    this.last = null;
  }

  append(node) {
    if (!this.first) {
      this.first = node;
      this.last = node;
    } else {
      this.last.next = node;
      node.previous = this.last;
      this.last = node;
    }
  }

  moveToEnd(node) {
    if (node === this.last) return;

    if (node === this.first) {
      this.first = node.next;
      if (this.first) {
        this.first.previous = null;
      } else {
        this.last = null;
      }
    } else {
      node.previous.next = node.next;
      node.next.previous = node.previous;
    }

    if (this.last) {
      this.last.next = node;
      node.previous = this.last;
    } else {
      this.first = node;
      node.previous = null;
    }
    node.next = null;
    this.last = node;
  }

  removeFirst() {
    if (!this.first) return null;
    const node = this.first;
    if (this.first === this.last) {
      this.first = null;
      this.last = null;
    } else {
      this.first = node.next;
      this.first.previous = null;
    }
    node.next = null;
    node.previous = null;
    return node;
  }
}

let currentMemorySnapshot = 0;
let memoryUpdateTimer = null;

function acquireMemorySnapshot() {
  if (memoryUpdateTimer === null) {
    memoryUpdateTimer = setInterval(updateMemorySnapshot, 60 * 1000);
    return updateMemorySnapshot();
  } else {
    return currentMemorySnapshot;
  }
}

function updateMemorySnapshot() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return currentMemorySnapshot = process.memoryUsage().heapTotal;
  }
  return currentMemorySnapshot = 0;
}

class AuxiliaryCache {
  constructor(maximumCapacity, managementPolicy) {
    this.maximumCapacity = maximumCapacity;
    this.managementPolicy = policyVariants[managementPolicy] || policyVariants.ITEM_COUNT;

    this.internalStorage = new Map();
    this.accessOrder = new LinkedSequence();
  }

  store(accessKey, valueToStore) {
    let existingNode = this.internalStorage.get(accessKey);

    if (existingNode) {
      existingNode.storedValue = valueToStore;
      this.accessOrder.moveToEnd(existingNode);
    } else {
      let elementsToRemoveCount = this.assessCapacityViolation();
      for (let i = 0; i < elementsToRemoveCount; i++) {
        const oldestNode = this.accessOrder.removeFirst();
        if (oldestNode) {
          this.internalStorage.delete(oldestNode.identifier);
        }
      }

      const newNode = new LinkedListNode(accessKey, valueToStore);
      this.internalStorage.set(accessKey, newNode);
      this.accessOrder.append(newNode);
    }
  }

  retrieve(accessKey) {
    const existingNode = this.internalStorage.get(accessKey);
    if (existingNode) {
      this.accessOrder.moveToEnd(existingNode);
      return existingNode.storedValue;
    }
    return undefined;
  }

  checkPresence(accessKey) {
    return this.internalStorage.has(accessKey);
  }

  assessCapacityViolation() {
    if (this.managementPolicy === policyVariants.ITEM_COUNT) {
      return Math.max(0, this.internalStorage.size - this.maximumCapacity);
    } else if (this.managementPolicy === policyVariants.MEMORY_USAGE) {
      if (acquireMemorySnapshot() >= this.maximumCapacity) {
        console.log('MEMORY POLICY HEURISTIC heap:', acquireMemorySnapshot());
        return Math.floor(this.internalStorage.size / 2);
      } else {
        return 0;
      }
    } else {
      console.error("Unknown policy '" + String(this.managementPolicy) + "' for cache.");
      return 1;
    }
  }
}