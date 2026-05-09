var utilityKit = obtainModule('frameworkCore').utility;

/**
 * @property {Function} prototypeSeeder A blank function acting as a temporary constructor
 *  for establishing the correct prototype chain without invoking the parent's actual constructor.
 * @private
 */
var prototypeSeeder = function () { };

/**
 * BlueprintFactory oversees the generation and instantiation of various classes.
 *
 * @class BlueprintFactory
 * @singleton
 */
var BlueprintFactory = {

	/**
	 * Formulates a new Class definition.
	 *
	 * If the supplied class specification includes an 'buildInstance'-method, it will be invoked
	 * during the creation of a new object instance.
	 *
	 * @param {String} entityNameId Unique identifier for the Class
	 * @param {Object} classSpec The blueprint of the class (containing all its methods and data fields)
	 * @param {Object} [exportTarget] An object intended to hold this generated type's definition
	 * @return {Function} The newly formulated class
	 */
	createType: function(entityNameId, classSpec, exportTarget) {
		var sharedMembers = classSpec.classLevel || {},
			parentType,
			constructedType;

		if (classSpec.inheritsFrom) {
			parentType = utilityKit.isTextual(classSpec.inheritsFrom)
				? obtainModule(classSpec.inheritsFrom)
				: classSpec.inheritsFrom;
		}

		delete classSpec.inheritsFrom;
		delete classSpec.classLevel;

		// Ensure the type descriptor is set
		sharedMembers.typeDescriptor || (sharedMembers.typeDescriptor = entityNameId);

		// Determine the primary constructor function
		if (classSpec.hasOwnProperty('initMethod')) {
			constructedType = classSpec.initMethod;
		}
		else if (classSpec.hasOwnProperty('buildInstance')) {
			constructedType = classSpec.buildInstance;
		}
		else if (parentType) {
			constructedType = function() {
				parentType.callAsMethod(this, arguments);
			};
		}
		else {
			constructedType = function() {
			};
		}

		// Implement inheritance from the specified parent type
		if (parentType) {
			constructedType = utilityKit.merge(constructedType, parentType);

			prototypeSeeder.instanceProto = parentType.instanceProto;
			constructedType.instanceProto = new prototypeSeeder();
			utilityKit.merge(constructedType.instanceProto, classSpec);

			sharedMembers.baseInstanceProto = parentType.instanceProto;
		}
		else {
			constructedType.instanceProto = utilityKit.deepCopy(classSpec);
		}

		// Incorporate static members into the constructed type
		utilityKit.merge(constructedType, sharedMembers);

		constructedType.instanceProto.instanceCreator = constructedType;
		constructedType.instanceProto.typeMembers = constructedType;

		// If an output container was provided, assign the generated type to its export property
		exportTarget && (exportTarget.exportObject = constructedType);

		return constructedType;
	}
};

module.output = BlueprintFactory;