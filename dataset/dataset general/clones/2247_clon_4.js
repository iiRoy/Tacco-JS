(function() {
  var timeUtilityCore = ('object' === typeof window && window.moment) ? window.moment : require('moment');

  var documentationSource = 'https://momentjs.com/docs/#/manipulating/add/';

  function parseTimeDescriptor(descriptorInput) {
    var parsingResult = descriptorInput.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);
    if (!parsingResult) {
      throw 'Invalid time expression: "' + descriptorInput + '". Expected format is "VALUE UNIT". Consult ' + documentationSource;
    }
    return {
      numericValue: parseFloat(parsingResult[1]),
      unitIdentifier: parsingResult[2]
    };
  }

  function performTimeAdjustment(baseReference, operationType, descriptorString) {
    var parsedComponents = parseTimeDescriptor(descriptorString);
    return timeUtilityCore(baseReference)[operationType](parsedComponents.numericValue, parsedComponents.unitIdentifier).toDate();
  }

  var stringTimeOperations = {
    calculatePrevious: function(descriptorString, referenceDate) {
      return performTimeAdjustment(referenceDate, 'subtract', descriptorString);
    },
    calculateSubsequent: function(descriptorString, referenceDate) {
      return performTimeAdjustment(referenceDate, 'add', descriptorString);
    },
    calculatePastRelative: function(descriptorString) {
      return performTimeAdjustment(new Date(), 'subtract', descriptorString);
    },
    calculateFutureRelative: function(descriptorString) {
      return performTimeAdjustment(new Date(), 'add', descriptorString);
    }
  };

  function TimeDuration(quantity, unitLabel) {
    this.encapsulatedDuration = timeUtilityCore.duration(quantity, unitLabel);
  }

  TimeDuration.prototype.getPriorDate = function(referenceMoment) {
    return timeUtilityCore(referenceMoment).subtract(this.encapsulatedDuration).toDate();
  };

  TimeDuration.prototype.getLaterDate = function(referenceMoment) {
    return timeUtilityCore(referenceMoment).add(this.encapsulatedDuration).toDate();
  };

  TimeDuration.prototype.getEarlierFromNow = function() {
    return timeUtilityCore().subtract(this.encapsulatedDuration).toDate();
  };

  TimeDuration.prototype.getLaterFromNow = function() {
    return timeUtilityCore().add(this.encapsulatedDuration).toDate();
  };

  var standardTimeUnits = ['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];
  var durationConstructors = {};

  standardTimeUnits.forEach(function(unitPlural) {
    var unitSingular = unitPlural.slice(0, -1);

    if (unitPlural === 'days') unitSingular = 'day';
    if (unitPlural === 'years') unitSingular = 'year';
    if (unitPlural === 'months') unitSingular = 'month';

    durationConstructors[unitPlural] = function(val) {
      return new TimeDuration(val, unitPlural);
    };
    durationConstructors[unitSingular] = function(val) {
      return new TimeDuration(val, unitPlural);
    };
  });

  var universalTimeTools = {};

  universalTimeTools.beforeReference = stringTimeOperations.calculatePrevious;
  universalTimeTools.afterReference = stringTimeOperations.calculateSubsequent;
  universalTimeTools.fromPastNow = stringTimeOperations.calculatePastRelative;
  universalTimeTools.fromFutureNow = stringTimeOperations.calculateFutureRelative;

  universalTimeTools.createDuration = function(value, unit) {
    return new TimeDuration(value, unit);
  };
  Object.keys(durationConstructors).forEach(function(keyName) {
    universalTimeTools.createDuration[keyName] = durationConstructors[keyName];
  });

  return universalTimeTools;

})();