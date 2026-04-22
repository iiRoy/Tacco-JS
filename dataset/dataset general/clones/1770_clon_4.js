const _util = (function() {
    const internal = {};

    internal.augment = function(receiver, donor) {
        if (!receiver || typeof receiver !== 'object') {
            receiver = {};
        }
        for (const property in donor) {
            if (Object.prototype.hasOwnProperty.call(donor, property)) {
                receiver[property] = donor[property];
            }
        }
        return receiver;
    };

    internal.transformArray = function(collection, operation) {
        if (!Array.isArray(collection)) {
            collection = Array.from(collection);
        }
        return collection.map(operation);
    };

    internal.traverse = function(collection, action) {
        if (!Array.isArray(collection)) {
            collection = Array.from(collection);
        }
        collection.forEach(action);
    };

    internal.copyObject = function(source) {
        return internal.augment({}, source);
    };

    internal.extractValues = function(collection, key) {
        return internal.transformArray(collection, item => item[key]);
    };

    internal.isContained = function(collection, item) {
        if (!Array.isArray(collection)) {
            collection = Array.from(collection);
        }
        return collection.includes(item);
    };

    internal.firstElement = function(collection) {
        return collection[0];
    };

    internal.restElements = function(collection) {
        if (!Array.isArray(collection)) {
            collection = Array.from(collection);
        }
        return collection.slice(1);
    };

    internal.allPass = function(collection, predicate) {
        if (!Array.isArray(collection)) {
            collection = Array.from(collection);
        }
        return collection.every(predicate);
    };

    internal.bindFunction = function(func, context) {
        return func.bind(context);
    };

    internal.objectFromEntries = function(entries) {
        const obj = {};
        internal.traverse(entries, ([key, value]) => {
            obj[key] = value;
        });
        return obj;
    };

    internal.filterCollection = function(collection, predicate) {
        if (!Array.isArray(collection)) {
            collection = Array.from(collection);
        }
        return collection.filter(predicate);
    };

    internal.getKeys = function(obj) {
        return Object.keys(obj);
    };

    internal.isFunction = function(val) {
        return typeof val === 'function';
    };

    internal.isObject = function(val) {
        return val !== null && typeof val === 'object';
    };

    internal.getOwnPropertyNames = function(obj) {
        return Object.getOwnPropertyNames(obj);
    };

    internal.getPrototype = function(obj) {
        return Object.getPrototypeOf(obj);
    };

    return internal;
})();

const _TYPE_METADATA_ = Symbol('typeMetadata');

const _coreSystem_ = (function() {
    const system = {};
    let typeCounter = 3;

    const createObjectWithProto = function(proto) {
        function TransientObject() {}
        TransientObject.prototype = proto;
        if (Object.create) {
            return Object.create(proto);
        }
        return new TransientObject();
    };
    system.__privateObjectCreator = createObjectWithProto;

    function FoundationObject() {}
    FoundationObject[_TYPE_METADATA_] = {
        methodResolutionOrder: [FoundationObject],
        prototypeMembers: {
            _typeConstructor_: function() {}
        },
        typeIdentifier: 1,
        parentTypes: [],
        typeIndex: {
            "1": FoundationObject
        }
    };
    _util.augment(FoundationObject.prototype, {
        _typeConstructor_: FoundationObject[_TYPE_METADATA_].prototypeMembers._typeConstructor_
    });

    system.FoundationObject = FoundationObject;

    const detectSuperCall = /_base_\b/.test(function() {
        _base_();
    }) ? /\b_base_\b/ : /.*/;

    const computeLinearization = function(typesToMerge) {
        const resolutionOrder = [];
        let currentLists = _util.transformArray(typesToMerge, _util.copyObject);
        while (true) {
            let foundNext = false;
            for (let i = 0; i < currentLists.length; i++) {
                if (currentLists[i].length === 0) {
                    continue;
                }
                const candidateType = _util.firstElement(currentLists[i]);
                const isCandidateInTail = _util.allPass(currentLists, (lst) => {
                    return _util.isContained(_util.restElements(lst), candidateType);
                });

                if (!isCandidateInTail) {
                    foundNext = true;
                    resolutionOrder.push(candidateType);
                    currentLists = _util.transformArray(currentLists, (lst) => {
                        if (_util.firstElement(lst) === candidateType) {
                            return _util.restElements(lst);
                        } else {
                            return lst;
                        }
                    });
                    break;
                }
            }
            if (foundNext) {
                continue;
            }
            if (_util.allPass(currentLists, (lst) => lst.length === 0)) {
                return resolutionOrder;
            }
            throw new system.GenericError("Inconsistent type resolution order detected.");
        }
    };

    const incorporateType = function(plainConstructor) {
        if (plainConstructor[_TYPE_METADATA_]) {
            return;
        }

        let extractedProps = {};
        if (Object.getOwnPropertyNames) {
            (function gatherProps(proto) {
                if (!proto || proto === Object.prototype) return;
                _util.traverse(_util.getOwnPropertyNames(proto), (key) => {
                    if (key !== 'constructor' && key !== '__proto__') {
                        extractedProps[key] = proto[key];
                    }
                });
                gatherProps(_util.getPrototype(proto));
            })(plainConstructor.prototype);
        } else {
            for (const key in plainConstructor.prototype) {
                if (Object.prototype.hasOwnProperty.call(plainConstructor.prototype, key) && key !== 'constructor' && key !== '__proto__') {
                    extractedProps[key] = plainConstructor.prototype[key];
                }
            }
        }


        const newId = typeCounter++;
        _util.augment(plainConstructor, {
            [_TYPE_METADATA_]: {
                methodResolutionOrder: [plainConstructor, system.FoundationObject],
                prototypeMembers: _util.augment(_util.copyObject(extractedProps), {
                    _typeConstructor_: function() {
                        this._base_.apply(this, arguments);
                        const tempBase = this._base_;
                        this._base_ = null;
                        try {
                            plainConstructor.apply(this, arguments);
                        } finally {
                            this._base_ = tempBase;
                        }
                    }
                }),
                typeIdentifier: newId,
                parentTypes: [system.FoundationObject],
                typeIndex: {
                    "1": system.FoundationObject
                },
                isConverted: true
            }
        });
        plainConstructor[_TYPE_METADATA_].typeIndex[newId] = plainConstructor;
    };

    system.formulateType = function() {
        const args = _util.toArray(arguments);
        args.reverse();

        let typeMembers = args[0];
        let typeParents = args.length >= 2 ? args[1] : [];

        if (!_util.isContained(typeParents.constructor, Array)) {
            typeParents = [typeParents];
        }

        _util.traverse(typeParents, incorporateType);

        if (typeParents.length === 0) {
            typeParents = [system.FoundationObject];
        }

        let typeConstructorFn = typeMembers.constructor !== Object ? typeMembers.constructor : undefined;
        typeMembers = _util.copyObject(typeMembers);
        delete typeMembers.constructor;

        if (!typeConstructorFn && typeMembers.init) {
            typeConstructorFn = typeMembers.init;
            delete typeMembers.init;
        }

        if (typeConstructorFn) {
            typeMembers._typeConstructor_ = typeConstructorFn;
        }

        const newTypeConstructor = function InstanceType() {
            this._base_ = null;
            this[_TYPE_METADATA_].prototypeMembers._typeConstructor_.apply(this, arguments);
        };
        newTypeConstructor[_TYPE_METADATA_] = {
            prototypeMembers: typeMembers
        };

        let parentMROs = _util.extractValues(typeParents, _TYPE_METADATA_);
        parentMROs = _util.extractValues(parentMROs, 'methodResolutionOrder');
        const mro = [newTypeConstructor].concat(computeLinearization(parentMROs.concat([typeParents])));

        let currentPrototype = Object.prototype;
        _util.traverse(_util.copyObject(mro).reverse(), (type) => {
            const nextProto = createObjectWithProto(currentPrototype);
            const typeSpecificMembers = type[_TYPE_METADATA_].prototypeMembers;
            _util.augment(nextProto, typeSpecificMembers);

            _util.traverse(_util.getKeys(nextProto), (key) => {
                const member = nextProto[key];
                if (!_util.isFunction(member) || !detectSuperCall.test(member) || member[_TYPE_METADATA_] ||
                    (key !== "_typeConstructor_" && type[_TYPE_METADATA_].isConverted)) {
                    return;
                }

                nextProto[key] = (function(methodName, methodFn, superProto) {
                    return function() {
                        const tempBase = this._base_;
                        this._base_ = superProto[methodName];
                        try {
                            return methodFn.apply(this, arguments);
                        } finally {
                            this._base_ = tempBase;
                        }
                    };
                })(key, member, currentPrototype);
            });
            nextProto.constructor = type;
            currentPrototype = nextProto;
        });

        const newId = typeCounter++;
        _util.augment(newTypeConstructor, {
            [_TYPE_METADATA_]: {
                methodResolutionOrder: mro,
                parentTypes: typeParents,
                prototypeMembers: typeMembers,
                typeIdentifier: newId,
                typeIndex: {}
            }
        });
        newTypeConstructor.prototype = currentPrototype;

        _util.traverse(newTypeConstructor[_TYPE_METADATA_].methodResolutionOrder, (t) => {
            newTypeConstructor[_TYPE_METADATA_].typeIndex[t[_TYPE_METADATA_].typeIdentifier] = t;
        });

        if (newTypeConstructor.prototype.typeInitializer) {
            newTypeConstructor[_TYPE_METADATA_].classInitializer = newTypeConstructor.prototype.typeInitializer;
            delete newTypeConstructor.prototype.typeInitializer;
        }

        _util.traverse(_util.copyObject(newTypeConstructor[_TYPE_METADATA_].methodResolutionOrder).reverse(), (t) => {
            if (t[_TYPE_METADATA_].classInitializer) {
                const modifiedPrototype = t[_TYPE_METADATA_].classInitializer(newTypeConstructor.prototype);
                if (modifiedPrototype !== undefined) {
                    newTypeConstructor.prototype = modifiedPrototype;
                }
            }
        });

        return newTypeConstructor;
    };

    system.verifyMembership = function(subject, classification) {
        if (_util.isObject(subject) && subject.constructor && subject.constructor[_TYPE_METADATA_] &&
            _util.isFunction(classification) && classification[_TYPE_METADATA_] &&
            typeof classification[_TYPE_METADATA_].typeIdentifier === "number") {
            return subject.constructor[_TYPE_METADATA_].typeIndex[classification[_TYPE_METADATA_].typeIdentifier] !== undefined;
        }
        if (typeof classification === "string") {
            return typeof subject === classification;
        }
        return subject instanceof classification;
    };

    system.retrieveAncestor = function(currentType, instance, memberName) {
        let positionInMRO;
        const instanceMRO = instance.constructor[_TYPE_METADATA_].methodResolutionOrder;
        for (let i = 0; i < instanceMRO.length; i++) {
            if (instanceMRO[i] === currentType) {
                positionInMRO = i;
                break;
            }
        }
        if (positionInMRO === undefined) {
            throw new system.GenericError("Type not found in instance's method resolution order.");
        }

        let protoWalker = instance.constructor.prototype;
        for (let k = 0; k <= positionInMRO; k++) {
            protoWalker = _util.getPrototype(protoWalker);
        }
        const targetPrototype = protoWalker;

        let memberValue;
        if (memberName !== "constructor" && memberName !== "init") {
            memberValue = targetPrototype[memberName];
        } else {
            memberValue = targetPrototype._typeConstructor_;
        }

        if (_util.isFunction(memberValue)) {
            return _util.bindFunction(memberValue, instance);
        } else {
            return memberValue;
        }
    };

    system.GenericError = system.formulateType({
        typeName: "System.GenericError",
        defaultText: "",
        constructor: function(text) {
            this.text = text || this.defaultText;
        },
        typeInitializer: function(proto) {
            const prototypeChain = [];
            (function collectPrototypes(p) {
                if (!p) return;
                prototypeChain.push(p);
                collectPrototypes(_util.getPrototype(p));
            })(proto);

            let currentProtoInstance = new Error();
            _util.traverse(_util.copyObject(prototypeChain).reverse(), (p) => {
                const tempProto = createObjectWithProto(currentProtoInstance);
                _util.traverse(_util.getKeys(p), (key) => {
                    if (key !== "__proto__") {
                        tempProto[key] = p[key];
                    }
                });
                currentProtoInstance = tempProto;
            });
            return currentProtoInstance;
        }
    });

    system.ValueIssue = system.formulateType([system.GenericError], {
        typeName: "System.ValueIssue"
    });

    return system;
})();

(function(scope) {
    const system = _coreSystem_;

    if (typeof exports !== "undefined" && typeof module !== "undefined" && module.exports) {
        module.exports = system;
    } else if (typeof define === "function" && define.amd) {
        define([], function() {
            return system;
        });
    } else {
        scope.typeSystem = system;
    }
})(typeof window !== "undefined" ? window : global);