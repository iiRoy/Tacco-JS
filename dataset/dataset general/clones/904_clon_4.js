function createReactiveCore(initialState = undefined) {
    let current = initialState;
    const observerList = new Set();

    function accessor(newState) {
        if (arguments.length > 0) {
            if (current !== newState) {
                current = newState;
                observerList.forEach(cb => cb(current));
            }
        }
        return current;
    }

    accessor.register = (cb) => {
        observerList.add(cb);
        return () => observerList.delete(cb);
    };

    accessor.signalUpdate = () => {
        observerList.forEach(cb => cb(current));
    };

    return accessor;
}

function establishTransactionalDatum(initialVal) {
    let provisionalVal = initialVal;
    const committedDatum = createReactiveCore(initialVal);

    const transactionalWrapper = function(incomingVal) {
        if (arguments.length > 0) {
            provisionalVal = incomingVal;
        }
        return committedDatum();
    };

    transactionalWrapper.finalize = () => {
        if (provisionalVal !== committedDatum()) {
            committedDatum(provisionalVal);
        }
    };

    transactionalWrapper.discard = () => {
        committedDatum.signalUpdate();
        provisionalVal = committedDatum();
    };

    return transactionalWrapper;
}

class TransactionalObject {
    constructor(sourceEntity) {
        Object.keys(sourceEntity).forEach(key => {
            this[key] = establishTransactionalDatum(sourceEntity[key]);
        });
    }

    applyAll() {
        Object.keys(this).forEach(key => {
            const prop = this[key];
            if (typeof prop === 'function' && typeof prop.finalize === 'function') {
                prop.finalize();
            }
        });
    }
}

function processEntityCollection(inputSequence) {
    return inputSequence.map(individualItem => {
        return new TransactionalObject(individualItem);
    });
}