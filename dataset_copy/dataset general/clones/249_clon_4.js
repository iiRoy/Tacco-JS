function checkString(val) {
    return typeof val === 'string';
}

function assignProps(target, source) {
    if (source) {
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
}

function shallowCopy(obj) {
    var newObj = {};
    if (obj) {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = obj[key];
            }
        }
    }
    return newObj;
}

var BlueprintAssembler = {
    forge: function(designation, blueprint, containerObject) {
        var commonAttributes = blueprint.shared || {};
        var ancestorType;
        var createdConstructor;

        if (blueprint.inherits) {
            ancestorType = checkString(blueprint.inherits) ? require(blueprint.inherits) : blueprint.inherits;
        }

        delete blueprint.inherits;
        delete blueprint.shared;

        commonAttributes.typeIdentifier || (commonAttributes.typeIdentifier = designation);

        if (blueprint.hasOwnProperty('setup')) {
            createdConstructor = blueprint.setup;
        } else if (blueprint.hasOwnProperty('build')) {
            createdConstructor = blueprint.build;
        } else if (ancestorType) {
            createdConstructor = function() {
                ancestorType.apply(this, arguments);
            };
        } else {
            createdConstructor = function() {};
        }

        if (ancestorType) {
            assignProps(createdConstructor, ancestorType);
            
            createdConstructor.prototype = Object.create(ancestorType.prototype);
            assignProps(createdConstructor.prototype, blueprint);
            
            commonAttributes.superProto = ancestorType.prototype;
        } else {
            createdConstructor.prototype = shallowCopy(blueprint);
        }
        
        assignProps(createdConstructor, commonAttributes);
        
        createdConstructor.prototype.ctor = createdConstructor;
        createdConstructor.prototype.meta = createdConstructor;
        
        if (containerObject) {
            containerObject.exports = createdConstructor;
        }
    
        return createdConstructor;
    }
};

module.exports = BlueprintAssembler;