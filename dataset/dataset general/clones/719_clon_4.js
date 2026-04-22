(function () {
  var globalScope = this;

  var TemporalKit;
  if (typeof exports !== 'undefined') {
    TemporalKit = exports;
  } else {
    TemporalKit = globalScope.TemporalKit = {};
  }

  TemporalKit.CHRONO_VERSION = '2.0.0';

  var dataFetcher = function (settings) {
    if (!settings) throw new Error('Parameters required for data fetching.');
    if (!settings.sourceUrl) throw new Error('Source URL must be specified.');

    if (TemporalKit.ZoneData && typeof TemporalKit.ZoneData.customFetcher === 'function') {
      return TemporalKit.ZoneData.customFetcher(settings);
    }

    if (globalScope.fetch) {
      if (!settings.async) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', settings.sourceUrl, false);
        xhr.send(null);
        if (xhr.status === 200) {
          return xhr.responseText;
        } else {
          throw new Error('Error retrieving "' + settings.sourceUrl + '" zone data: ' + xhr.statusText);
        }
      } else {
        return globalScope.fetch(settings.sourceUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error('Error retrieving "' + settings.sourceUrl + '" zone data: ' + response.statusText);
            }
            return response.text();
          })
          .then(data => {
            if (typeof settings.onCompletion === 'function') {
              settings.onCompletion(data);
            }
            return data;
          })
          .catch(error => {
            if (typeof settings.onError === 'function') {
              settings.onError(error);
            }
            throw error;
          });
      }
    } else {
      throw new Error('No compatible data fetching mechanism found. Please provide TemporalKit.ZoneData.customFetcher.');
    }
  };

  var WeekdayNames = TemporalKit.WeekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var CalendarMonths = TemporalKit.CalendarMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var formatNumeric = function (value, desiredLength) {
    if (typeof value !== "number") { throw new Error("Input must be a number: " + value); }
    var text = value.toString();
    while (text.length < desiredLength) {
      text = '0' + text;
    }
    return text;
  };

  TemporalKit.ZoneData = new (function () {
    var self = this;
    self.zoneStore = {};
    self.rulesStore = {};
    self.loadedFiles = {};
    self.dataBasePath = '';

    var monthIndexMap = {};
    var dayIndexMap = {};
    var geographicalAreas = {
      'EST': 'northamerica', 'MST': 'northamerica', 'HST': 'northamerica', 'EST5EDT': 'northamerica', 'CST6CDT': 'northamerica', 'MST7MDT': 'northamerica', 'PST8PDT': 'northamerica', 'America': 'northamerica', 'Pacific': 'australasia', 'Atlantic': 'europe', 'Africa': 'africa', 'Indian': 'africa', 'Antarctica': 'antarctica', 'Asia': 'asia', 'Australia': 'australasia', 'Europe': 'europe', 'WET': 'europe', 'CET': 'europe', 'MET': 'europe', 'EET': 'europe'
    };
    var areaExceptions = {
      'Etc/GMT': 'etcetera', 'Etc/UTC': 'etcetera', 'Pacific/Honolulu': 'northamerica', 'Atlantic/Bermuda': 'northamerica', 'Atlantic/Cape_Verde': 'africa', 'Atlantic/St_Helena': 'africa', 'Indian/Kerguelen': 'antarctica', 'Indian/Chagos': 'asia', 'Indian/Maldives': 'asia', 'Indian/Christmas': 'australasia', 'Indian/Cocos': 'australasia', 'America/Danmarkshavn': 'europe', 'America/Scoresbysund': 'europe', 'America/Godthab': 'europe', 'America/Thule': 'europe', 'Asia/Yekaterinburg': 'europe', 'Asia/Omsk': 'europe', 'Asia/Novosibirsk': 'europe', 'Asia/Krasnoyarsk': 'europe', 'Asia/Irkutsk': 'europe', 'Asia/Yakutsk': 'europe', 'Asia/Vladivostok': 'europe', 'Asia/Sakhalin': 'europe', 'Asia/Magadan': 'europe', 'Asia/Kamchatka': 'europe', 'Asia/Anadyr': 'europe', 'Africa/Ceuta': 'europe', 'America/Argentina/Buenos_Aires': 'southamerica', 'America/Argentina/Cordoba': 'southamerica', 'America/Argentina/Tucuman': 'southamerica', 'America/Argentina/La_Rioja': 'southamerica', 'America/Argentina/San_Juan': 'southamerica', 'America/Argentina/Jujuy': 'southamerica', 'America/Argentina/Catamarca': 'southamerica', 'America/Argentina/Mendoza': 'southamerica', 'America/Argentina/Rio_Gallegos': 'southamerica', 'America/Argentina/Ushuaia': 'southamerica', 'America/Aruba': 'southamerica', 'America/La_Paz': 'southamerica', 'America/Noronha': 'southamerica', 'America/Belem': 'southamerica', 'America/Fortaleza': 'southamerica', 'America/Recife': 'southamerica', 'America/Araguaina': 'southamerica', 'America/Maceio': 'southamerica', 'America/Bahia': 'southamerica', 'America/Sao_Paulo': 'southamerica', 'America/Campo_Grande': 'southamerica', 'America/Cuiaba': 'southamerica', 'America/Porto_Velho': 'southamerica', 'America/Boa_Vista': 'southamerica', 'America/Manaus': 'southamerica', 'America/Eirunepe': 'southamerica', 'America/Rio_Branco': 'southamerica', 'America/Santiago': 'southamerica', 'Pacific/Easter': 'southamerica', 'America/Bogota': 'southamerica', 'America/Curacao': 'southamerica', 'America/Guayaquil': 'southamerica', 'Pacific/Galapagos': 'southamerica', 'Atlantic/Stanley': 'southamerica', 'America/Cayenne': 'southamerica', 'America/Guyana': 'southamerica', 'America/Asuncion': 'southamerica', 'America/Lima': 'southamerica', 'Atlantic/South_Georgia': 'southamerica', 'America/Paramaribo': 'southamerica', 'America/Port_of_Spain': 'southamerica', 'America/Montevideo': 'southamerica', 'America/Caracas': 'southamerica'
    };

    for (var i = 0; i < CalendarMonths.length; i++) {
      monthIndexMap[CalendarMonths[i].substring(0, 3).toLowerCase()] = i;
    }
    for (i = 0; i < WeekdayNames.length; i++) {
      dayIndexMap[WeekdayNames[i].substring(0, 3).toLowerCase()] = i;
    }

    function missingZoneError(zoneId) { throw new Error('Timezone "' + zoneId + '" is not recognized or loaded in the registry.'); }

    self.acquireZoneFile = function (filename, options) {
      var source = self.dataBasePath + '/' + filename;
      return !options || !options.async
        ? self.processZones(dataFetcher({ sourceUrl: source, async: false }))
        : dataFetcher({
          async: true,
          sourceUrl: source,
          onCompletion: function (content) {
            if (self.processZones(content) && typeof options.onSuccess === 'function') {
              options.onSuccess();
            }
            return true;
          },
          onError: function () {
            throw new Error('Failed to retrieve "' + source + '" zone data files');
          }
        });
    };

    function parseTimeComponent(timeStr) {
      var regex = /(\d+)(?::0*(\d*))?(?::0*(\d*))?([wsugz])?$/;
      var matches = timeStr.match(regex);
      matches[1] = parseInt(matches[1], 10);
      matches[2] = matches[2] ? parseInt(matches[2], 10) : 0;
      matches[3] = matches[3] ? parseInt(matches[3], 10) : 0;
      return matches;
    }

    function findRelevantZoneRule(absoluteTime, zoneKey) {
      var currentKey = zoneKey;
      var ruleList = self.zoneStore[currentKey];

      while (typeof ruleList === "string") {
        currentKey = ruleList;
        ruleList = self.zoneStore[currentKey];
      }
      if (!ruleList) {
        if (!self.loadedFiles.backward) {
          self.acquireZoneFile('backward');
          return findRelevantZoneRule(absoluteTime, zoneKey);
        }
        missingZoneError(currentKey);
      }

      var chosenRule = null;
      for (var j = 0; j < ruleList.length; j++) {
        var rule = ruleList[j];
        if (!rule[3]) {
          chosenRule = rule;
          break;
        }
        var untilYear = parseInt(rule[3], 10);
        var untilMonth = 11;
        var untilDay = 31;

        if (rule[4]) {
          untilMonth = monthIndexMap[rule[4].substring(0, 3).toLowerCase()];
          untilDay = parseInt(rule[5], 10);
        }
        var untilTimeComponents = parseTimeComponent(rule[6] ? rule[6] : '23:59:59');
        var untilUtcMs = Date.UTC(untilYear, untilMonth, untilDay, untilTimeComponents[1], untilTimeComponents[2], untilTimeComponents[3]);

        if (absoluteTime.getTime() < untilUtcMs) {
          chosenRule = rule;
          break;
        }
      }
      if (!chosenRule) {
        throw new Error('No matching zone rule found for "' + zoneKey + '" on ' + absoluteTime);
      }
      return chosenRule;
    }

    function extractBaseOffset(rule) {
      var timeParts = parseTimeComponent(rule[0]);
      var sign = rule[0].indexOf('-') === 0 ? -1 : 1;
      var totalSeconds = (timeParts[1] * 60 * 60) + (timeParts[2] * 60) + timeParts[3];
      return -sign * totalSeconds / 60;
    }

    self.parseRuleOffset = function (offsetStr) {
      var parts = parseTimeComponent(offsetStr);
      var sign = offsetStr.indexOf('-') === 0 ? -1 : 1;
      return sign * ((parts[1] * 60) + parts[2]);
    };

    self.formatAbbreviation = function (formatStr, offsetStr) {
      return formatStr.replace(/%s/g, offsetStr);
    };

    self.processZones = function (zoneContent) {
      if (!zoneContent) return false;
      var lines = zoneContent.split('\n');
      for (var j = 0; j < lines.length; j++) {
        var line = lines[j];
        if (line.indexOf('#') === 0 || line.trim() === '') {
          continue;
        }
        var parts = line.split(/\s+/);
        var type = parts.shift();
        if (type === 'Zone') {
          var zoneName = parts.shift();
          self.zoneStore[zoneName] = self.zoneStore[zoneName] || [];
          self.zoneStore[zoneName].push(parts);
        } else if (type === 'Link') {
          var target = parts.shift();
          var alias = parts.shift();
          self.zoneStore[alias] = target;
        } else if (type === 'Rule') {
          var ruleSetName = parts.shift();
          self.rulesStore = self.rulesStore || {};
          self.rulesStore[ruleSetName] = self.rulesStore[ruleSetName] || [];
          self.rulesStore[ruleSetName].push(parts);
        }
      }
      return true;
    };

    self.getComputedZoneDetails = function (utcMoment, zoneKey) {
      if (zoneKey === 'Etc/UTC' || zoneKey === 'Etc/GMT') {
        return { offsetMinutes: 0, abbreviation: 'UTC' };
      }

      var baseZoneRule = findRelevantZoneRule(utcMoment, zoneKey);
      var standardOffsetMinutes = extractBaseOffset(baseZoneRule);
      var currentOffsetMinutes = standardOffsetMinutes;
      var currentAbbreviation = baseZoneRule[2];

      if (baseZoneRule[1] !== '-') {
        var rulesKey = baseZoneRule[1];
        var ruleSet = self.rulesStore[rulesKey];
        if (!ruleSet) {
          throw new Error('Missing rule set for key: ' + rulesKey + ' for zone ' + zoneKey);
        }

        var ruleApplicationHelper = function (checkUtcDate, ruleset, currentStandardOffsetMinutes) {
          var ruleYear = checkUtcDate.getUTCFullYear();
          var ruleMonth = checkUtcDate.getUTCMonth();
          var ruleDay = checkUtcDate.getUTCDate();

          var applicableRule = null;
          for (var rIdx = 0; rIdx < ruleset.length; rIdx++) {
            var rule = ruleset[rIdx];
            var ruleFromYear = rule[0] === 'min' ? -Infinity : parseInt(rule[0], 10);
            var ruleToYear = rule[1] === 'max' ? Infinity : parseInt(rule[1], 10);

            if (ruleYear >= ruleFromYear && ruleYear <= ruleToYear) {
              var transitionMonth = monthIndexMap[rule[3].substring(0, 3).toLowerCase()];
              var daySpec = rule[4];
              var transitionDay;

              if (daySpec.indexOf('last') === 0) {
                var dw = dayIndexMap[daySpec.substring(4, 7).toLowerCase()];
                var tempD = new Date(Date.UTC(ruleYear, transitionMonth + 1, 0));
                while (tempD.getUTCDay() !== dw) {
                  tempD.setUTCDate(tempD.getUTCDate() - 1);
                }
                transitionDay = tempD.getUTCDate();
              } else if (daySpec.indexOf('>=') === 0) {
                var parts = daySpec.split('>=');
                var startDay = parseInt(parts[parts.length - 1], 10);
                var tempD = new Date(Date.UTC(ruleYear, transitionMonth, startDay));
                if (parts.length > 1) {
                  var dw = dayIndexMap[parts[0].substring(2, 5).toLowerCase()];
                  while (tempD.getUTCDay() !== dw) {
                    tempD.setUTCDate(tempD.getUTCDate() + 1);
                  }
                }
                transitionDay = tempD.getUTCDate();
              } else {
                if (isNaN(parseInt(daySpec, 10))) {
                  var dw = dayIndexMap[daySpec.substring(0, 3).toLowerCase()];
                  var tempD = new Date(Date.UTC(ruleYear, transitionMonth, 1));
                  while (tempD.getUTCDay() !== dw) {
                    tempD.setUTCDate(tempD.getUTCDate() + 1);
                  }
                  transitionDay = tempD.getUTCDate();
                } else {
                  transitionDay = parseInt(daySpec, 10);
                }
              }

              var transitionTimeParts = parseTimeComponent(rule[5]);
              var transitionHour = transitionTimeParts[1];
              var transitionMinute = transitionTimeParts[2];
              var transitionSecond = transitionTimeParts[3];
              var transitionType = transitionTimeParts[4];

              var effectiveOffsetBeforeTransition = 0;
              if (rIdx > 0) {
                var previousMomentDetails = self.getComputedZoneDetails(new Date(checkUtcDate.getTime() - 1), zoneKey);
                effectiveOffsetBeforeTransition = previousMomentDetails.offsetMinutes;
              } else {
                effectiveOffsetBeforeTransition = currentStandardOffsetMinutes;
              }

              var transitionUtcMs;
              switch (transitionType) {
                case 's':
                  transitionUtcMs = Date.UTC(ruleYear, transitionMonth, transitionDay, transitionHour, transitionMinute, transitionSecond) + (currentStandardOffsetMinutes * 60 * 1000);
                  break;
                case 'w':
                  transitionUtcMs = Date.UTC(ruleYear, transitionMonth, transitionDay, transitionHour, transitionMinute, transitionSecond) + (effectiveOffsetBeforeTransition * 60 * 1000);
                  break;
                case 'u':
                case 'g':
                case 'z':
                  transitionUtcMs = Date.UTC(ruleYear, transitionMonth, transitionDay, transitionHour, transitionMinute, transitionSecond);
                  break;
                default:
                  transitionUtcMs = Date.UTC(ruleYear, transitionMonth, transitionDay, transitionHour, transitionMinute, transitionSecond) + (currentStandardOffsetMinutes * 60 * 1000);
                  break;
              }

              if (checkUtcDate.getTime() < transitionUtcMs) {
                if (rIdx === 0) {
                  applicableRule = null;
                } else {
                  applicableRule = ruleset[rIdx - 1];
                }
                break;
              }
              applicableRule = rule;
            }
          }
          return applicableRule;
        };

        var dstRule = ruleApplicationHelper(utcMoment, ruleSet, standardOffsetMinutes);

        if (dstRule) {
          currentOffsetMinutes += self.parseRuleOffset(dstRule[5]);
          currentAbbreviation = self.formatAbbreviation(baseZoneRule[2], dstRule[6]);
        }
      }

      return { offsetMinutes: currentOffsetMinutes, abbreviation: currentAbbreviation };
    };

    self.getSystemLocalOffset = function (nativeDate) {
      return nativeDate.getTimezoneOffset();
    };

  })();

  TemporalKit.ZonedTimestamp = function () {
    var inputArgs = Array.prototype.slice.call(arguments);
    var dateProxyObject = null;
    var assignedZone = null;
    var componentArray = [];

    if (Object.prototype.toString.call(inputArgs[0]) === '[object Array]') {
      inputArgs = inputArgs[0];
    }

    if (typeof inputArgs[inputArgs.length - 1] === 'string' && /^[a-zA-Z]+\//gi.test(inputArgs[inputArgs.length - 1])) {
      assignedZone = inputArgs.pop();
    }

    switch (inputArgs.length) {
      case 0:
        dateProxyObject = new Date();
        break;
      case 1:
        dateProxyObject = new Date(inputArgs[0]);
        break;
      default:
        for (var i = 0; i < 7; i++) {
          componentArray[i] = inputArgs[i] || 0;
        }
        dateProxyObject = new Date(componentArray[0], componentArray[1], componentArray[2], componentArray[3], componentArray[4], componentArray[5], componentArray[6]);
        break;
    }

    this._internalMs = 0;
    this._activeZoneId = assignedZone || null;
    this._cacheDetails = null;

    var isInputUtc = (!componentArray.length && assignedZone);
    this.updateFromNativeDate(dateProxyObject, isInputUtc);
  };

  TemporalKit.ZonedTimestamp.prototype = {
    _getComponentsInActiveZone: function () {
      var details = this.getZoneDetails();
      var localMs = this._internalMs + (details.offsetMinutes * 60 * 1000);
      var nativeLocal = new Date(localMs);
      return {
        year: nativeLocal.getUTCFullYear(),
        month: nativeLocal.getUTCMonth(),
        date: nativeLocal.getUTCDate(),
        day: nativeLocal.getUTCDay(),
        hours: nativeLocal.getUTCHours(),
        minutes: nativeLocal.getUTCMinutes(),
        seconds: nativeLocal.getUTCSeconds(),
        milliseconds: nativeLocal.getUTCMilliseconds()
      };
    },

    _getUtcNativeProxy: function () {
      var components = this._getComponentsInActiveZone();
      var utcEquivalentMs = Date.UTC(
        components.year, components.month, components.date,
        components.hours, components.minutes, components.seconds, components.milliseconds
      );
      var details = this.getZoneDetails();
      return new Date(utcEquivalentMs + (details.offsetMinutes * 60 * 1000));
    },

    updateFromNativeDate: function (nativeDateObj, treatAsUtc) {
      if (treatAsUtc) {
        this._internalMs = nativeDateObj.getTime();
      } else {
        this._internalMs = nativeDateObj.getTime();
      }
      this._cacheDetails = null;
    },

    getZoneDetails: function () {
      if (this._cacheDetails) return this._cacheDetails;

      if (this._activeZoneId) {
        var utcDateForLookup = new Date(this._internalMs);
        this._cacheDetails = TemporalKit.ZoneData.getComputedZoneDetails(utcDateForLookup, this._activeZoneId);
      } else {
        var nativeLocal = new Date(this._internalMs);
        this._cacheDetails = {
          offsetMinutes: TemporalKit.ZoneData.getSystemLocalOffset(nativeLocal),
          abbreviation: null
        };
      }
      return this._cacheDetails;
    },

    getDateValue: function () { return this._getComponentsInActiveZone().date; },
    getWeekday: function () { return this._getComponentsInActiveZone().day; },
    getEntireYear: function () { return this._getComponentsInActiveZone().year; },
    getCalendarMonth: function () { return this._getComponentsInActiveZone().month; },
    getYearTwoDigit: function () { return this._getComponentsInActiveZone().year; },
    getHourOfDay: function () { return this._getComponentsInActiveZone().hours; },
    getMillisecondValue: function () { return this._getComponentsInActiveZone().milliseconds; },
    getMinuteValue: function () { return this._getComponentsInActiveZone().minutes; },
    getSecondValue: function () { return this._getComponentsInActiveZone().seconds; },

    getAbsoluteTime: function () {
      return this._getUtcNativeProxy().getTime();
    },

    getZoneId: function () { return this._activeZoneId; },
    getZoneOffset: function () { return this.getZoneDetails().offsetMinutes; },
    getZoneAbbreviation: function () { return this.getZoneDetails().abbreviation; },

    getUtcDateValue: function () { return new Date(this._internalMs).getUTCDate(); },
    getUtcWeekday: function () { return new Date(this._internalMs).getUTCDay(); },
    getUtcEntireYear: function () { return new Date(this._internalMs).getUTCFullYear(); },
    getUtcHourOfDay: function () { return new Date(this._internalMs).getUTCHours(); },
    getUtcMillisecondValue: function () { return new Date(this._internalMs).getUTCMilliseconds(); },
    getUtcMinuteValue: function () { return new Date(this._internalMs).getUTCMinutes(); },
    getUtcCalendarMonth: function () { return new Date(this._internalMs).getUTCMonth(); },
    getUtcSecondValue: function () { return new Date(this._internalMs).getUTCSeconds(); },

    _modifyComponent: function (componentName, newValue, useUtc) {
      if (isNaN(newValue)) { throw new Error('Value must be a number.'); }

      var nativeProxy;
      if (useUtc) {
        nativeProxy = new Date(this._internalMs);
      } else {
        nativeProxy = new Date(this._internalMs + (this.getZoneDetails().offsetMinutes * 60 * 1000));
      }

      var setterMethod = 'set' + (useUtc ? 'UTC' : '') +
                         (componentName === 'year' ? 'FullYear' : componentName.charAt(0).toUpperCase() + componentName.slice(1));
      nativeProxy[setterMethod](newValue);

      if (useUtc) {
        this._internalMs = nativeProxy.getTime();
      } else {
        var newLocalMs = nativeProxy.getTime();
        this._internalMs = newLocalMs - (this.getZoneDetails().offsetMinutes * 60 * 1000);
      }
      this._cacheDetails = null;
    },

    setDayOfMonth: function (val) { this._modifyComponent('date', val, false); },
    setFullYearValue: function (val) { this._modifyComponent('year', val, false); },
    setMonthOfYear: function (val) { this._modifyComponent('month', val, false); },
    setYearShort: function (val) { this._modifyComponent('year', val, false); },
    setHourValue: function (val) { this._modifyComponent('hours', val, false); },
    setMillisecondValue: function (val) { this._modifyComponent('milliseconds', val, false); },
    setMinuteValue: function (val) { this._modifyComponent('minutes', val, false); },
    setSecondValue: function (val) { this._modifyComponent('seconds', val, false); },

    setAbsoluteTime: function (val) {
      if (isNaN(val)) { throw new Error('Value must be a number.'); }
      this._internalMs = val - (this.getZoneDetails().offsetMinutes * 60 * 1000);
      this._cacheDetails = null;
    },

    setUtcDayOfMonth: function (val) { this._modifyComponent('date', val, true); },
    setUtcFullYearValue: function (val) { this._modifyComponent('year', val, true); },
    setUtcHourValue: function (val) { this._modifyComponent('hours', val, true); },
    setUtcMillisecondValue: function (val) { this._modifyComponent('milliseconds', val, true); },
    setUtcMinuteValue: function (val) { this._modifyComponent('minutes', val, true); },
    setUtcMonthOfYear: function (val) { this._modifyComponent('month', val, true); },
    setUtcSecondValue: function (val) { this._modifyComponent('seconds', val, true); },

    toUniversalTime: function () { return this.formatTimestamp('EEE, dd MMM yyyy HH:mm:ss Z', 'Etc/GMT'); },
    toLocaleString: function () { return new Date(this._internalMs).toLocaleString(); },
    toLocaleDateString: function () { return new Date(this._internalMs).toLocaleDateString(); },
    toLocaleTimeString: function () { return new Date(this._internalMs).toLocaleTimeString(); },
    toSourceCode: function () { return new Date(this._internalMs).toSource(); },
    toIsoFormat: function () { return this.formatTimestamp('yyyy-MM-ddTHH:mm:ss.SSS', 'Etc/UTC') + 'Z'; },
    toJsonFormat: function () { return this.toIsoFormat(); },

    formatTimestamp: function (pattern, targetZone) {
      if (!pattern) return this.formatTimestamp('yyyy-MM-dd HH:mm:ss');

      var resultString = pattern;
      var effectiveMoment = this;

      if (targetZone) {
        effectiveMoment = this.createCopy();
        effectiveMoment.setZone(targetZone);
      }

      var currentComponents = effectiveMoment._getComponentsInActiveZone();
      var zoneInfo = effectiveMoment.getZoneDetails();
      var hours24 = currentComponents.hours;

      return resultString
        .replace(/a+/g, function () { return 'k'; })
        .replace(/y+/g, function (token) { return formatNumeric(currentComponents.year, token.length); })
        .replace(/d+/g, function (token) { return formatNumeric(currentComponents.date, token.length); })
        .replace(/m+/g, function (token) { return formatNumeric(currentComponents.minutes, token.length); })
        .replace(/s+/g, function (token) { return formatNumeric(currentComponents.seconds, token.length); })
        .replace(/S+/g, function (token) { return formatNumeric(currentComponents.milliseconds, token.length); })
        .replace(/M+/g, function (token) {
          var monthVal = currentComponents.month;
          var len = token.length;
          if (len > 3) {
            return CalendarMonths[monthVal];
          } else if (len > 2) {
            return CalendarMonths[monthVal].substring(0, len);
          }
          return formatNumeric(monthVal + 1, len);
        })
        .replace(/k+/g, function () {
          if (hours24 >= 12) {
            if (hours24 > 12) {
              hours24 -= 12;
            }
            return 'PM';
          }
          return 'AM';
        })
        .replace(/H+/g, function (token) { return formatNumeric(hours24, token.length); })
        .replace(/E+/g, function (token) { return WeekdayNames[currentComponents.day].substring(0, token.length); })
        .replace(/Z+/gi, function () { return zoneInfo.abbreviation; });
    },

    toUtcFormat: function () { return this.toUniversalTime(); },
    getValue: function () { return this.getAbsoluteTime(); },

    createCopy: function () {
      var copy = new TemporalKit.ZonedTimestamp();
      copy._internalMs = this._internalMs;
      copy._activeZoneId = this._activeZoneId;
      copy._cacheDetails = this._cacheDetails;
      return copy;
    },

    setZone: function (newZoneId) {
      var oldZoneDetails = this.getZoneDetails();
      var oldOffsetMinutes = oldZoneDetails.offsetMinutes;

      this._activeZoneId = newZoneId;
      this._cacheDetails = null;

      var newZoneDetails = this.getZoneDetails();
      var newOffsetMinutes = newZoneDetails.offsetMinutes;

      this._internalMs = this._internalMs + ((oldOffsetMinutes - newOffsetMinutes) * 60 * 1000);
    },

    clearZone: function () {
      this._activeZoneId = null;
      this._cacheDetails = null;
    },

    computeJulianDay: function (y, m, d) {
      var adjustedMonth = m + 1;
      var adjustedYear = y;
      if (adjustedMonth > 12) {
        adjustedYear += Math.floor(adjustedMonth / 12);
        adjustedMonth = adjustedMonth % 12;
      }
      if (adjustedMonth <= 2) {
        adjustedYear -= 1;
        adjustedMonth += 12;
      }
      var A = Math.floor(adjustedYear / 100);
      var B = 2 - A + Math.floor(A / 4);
      var julianDate = Math.floor(365.25 * (adjustedYear + 4716)) + Math.floor(30.6001 * (adjustedMonth + 1)) + d + B - 1524;
      return julianDate;
    },

    getSystemLocalOffset: function () {
      return TemporalKit.ZoneData.getSystemLocalOffset(new Date(this._internalMs));
    }
  };
})();