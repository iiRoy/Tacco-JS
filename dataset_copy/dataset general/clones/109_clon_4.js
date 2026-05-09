var GlobalDataProcessor = (function () {

    var internalSettings = {
        languageData: {
            dt: {
                pattern: 'dddd, MMMM dd, yyyy h:mm:ss tt',
                monthsFullList: ['January','February','March','April','May','June','July','August','September','October','November','December'],
                monthsShortList: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                daysFullList: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
                daysShortList: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
                timePattern: 'h:mm tt',
                shortDatePattern: 'M/d/yyyy',
                longDatePattern: 'dddd, MMMM dd, yyyy'
            },
            nb: {
                pattern: '#,##0.0#',
                groupDelimiter: ',',
                decimalDelimiter: '.'
            }
        }
    };

    var obtainPaddedString = function (val, minLen) {
        var str = String(val);
        while (str.length < minLen) {
            str = '0' + str;
        }
        return str;
    };
    
    var dateModule = {
        convertStringToDate: function (inputString, inputPattern) {
            var actualPattern = inputPattern || internalSettings.languageData.dt.pattern;
            var currentLocale = internalSettings.languageData.dt;

            var regexParts = [];
            var componentOrder = [];

            var extractPatternParts = function(pattern) {
                var parts = [];
                var inQuote = false;
                var currentPart = '';
                for (var i = 0; i < pattern.length; i++) {
                    var char = pattern[i];
                    if (char === "'") {
                        if (currentPart) {
                            parts.push({type: 'token', value: currentPart});
                            currentPart = '';
                        }
                        inQuote = !inQuote;
                        if (pattern[i+1] === "'") { // Escaped single quote
                            parts.push({type: 'literal', value: "'"});
                            i++;
                        }
                    } else if (inQuote) {
                        currentPart += char;
                    } else {
                        if (currentPart && currentPart[0] !== char) {
                            parts.push({type: 'token', value: currentPart});
                            currentPart = char;
                        } else {
                            currentPart += char;
                        }
                    }
                }
                if (currentPart) {
                    parts.push({type: 'token', value: currentPart});
                }
                return parts;
            };

            var parsedPatternParts = extractPatternParts(actualPattern);

            for (var i = 0; i < parsedPatternParts.length; i++) {
                var part = parsedPatternParts[i];
                if (part.type === 'literal') {
                    regexParts.push(part.value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
                } else {
                    var token = part.value;
                    var regexPart;
                    var componentKey;

                    if (token === 'yyyy') { regexPart = '(\\d{4})'; componentKey = 'year'; }
                    else if (token === 'yy') { regexPart = '(\\d{2})'; componentKey = 'yearShort'; }
                    else if (token === 'y') { regexPart = '(\\d{2,4})'; componentKey = 'yearFlex'; } // Original was 2-4 for parsing
                    else if (token === 'MMMM') { regexPart = '([A-Za-z]+)'; componentKey = 'monthFull'; }
                    else if (token === 'MMM') { regexPart = '([A-Za-z]+)'; componentKey = 'monthShort'; }
                    else if (token === 'MM') { regexPart = '(\\d{2})'; componentKey = 'month'; }
                    else if (token === 'M') { regexPart = '(\\d{1,2})'; componentKey = 'month'; }
                    else if (token === 'dd') { regexPart = '(\\d{2})'; componentKey = 'day'; }
                    else if (token === 'd') { regexPart = '(\\d{1,2})'; componentKey = 'day'; }
                    else if (token === 'EEEE') { regexPart = '([A-Za-z]+)'; componentKey = 'weekdayFull'; }
                    else if (token === 'EEE') { regexPart = '([A-Za-z]+)'; componentKey = 'weekdayShort'; }
                    else if (token === 'HH') { regexPart = '(\\d{2})'; componentKey = 'hour24'; }
                    else if (token === 'H') { regexPart = '(\\d{1,2})'; componentKey = 'hour24'; }
                    else if (token === 'kk') { regexPart = '(\\d{2})'; componentKey = 'hour_1_24'; }
                    else if (token === 'k') { regexPart = '(\\d{1,2})'; componentKey = 'hour_1_24'; }
                    else if (token === 'hh') { regexPart = '(\\d{2})'; componentKey = 'hour_1_12'; }
                    else if (token === 'h') { regexPart = '(\\d{1,2})'; componentKey = 'hour_1_12'; }
                    else if (token === 'KK') { regexPart = '(\\d{2})'; componentKey = 'hour_0_11'; }
                    else if (token === 'K') { regexPart = '(\\d{1,2})'; componentKey = 'hour_0_11'; }
                    else if (token === 'mm') { regexPart = '(\\d{2})'; componentKey = 'minute'; }
                    else if (token === 'm') { regexPart = '(\\d{1,2})'; componentKey = 'minute'; }
                    else if (token === 'ss') { regexPart = '(\\d{2})'; componentKey = 'second'; }
                    else if (token === 's') { regexPart = '(\\d{1,2})'; componentKey = 'second'; }
                    else if (token === 'SSS') { regexPart = '(\\d{3})'; componentKey = 'millisecond'; }
                    else if (token === 'SS') { regexPart = '(\\d{2})'; componentKey = 'millisecondShort'; }
                    else if (token === 'S') { regexPart = '(\\d{1})'; componentKey = 'millisecondShort'; }
                    else if (token === 'a') { regexPart = '(AM|PM)'; componentKey = 'ampm'; }
                    else { regexPart = token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); }
                    
                    regexParts.push(regexPart);
                    if (componentKey) {
                        componentOrder.push(componentKey);
                    }
                }
            }

            var fullRegex = new RegExp('^' + regexParts.join('') + '$', 'i');
            var matchResult = inputString.match(fullRegex);

            if (!matchResult) {
                return new Date(0);
            }

            var parsedComponents = {};
            var currentMatchIndex = 1;

            for (var j = 0; j < componentOrder.length; j++) {
                var key = componentOrder[j];
                var value = matchResult[currentMatchIndex++];
                if (value === undefined) continue;

                if (key.startsWith('year')) {
                     var yrVal = parseInt(value, 10);
                     if (key === 'yearShort' && yrVal < 100) {
                        yrVal += (yrVal > 70 ? 1900 : 2000);
                     }
                     parsedComponents.year = yrVal;
                } else if (key.startsWith('month')) {
                    if (key === 'monthFull') {
                        var monthIdx = currentLocale.monthsFullList.findIndex(m => m.toLowerCase() === value.toLowerCase());
                        if (monthIdx === -1) return new Date(0);
                        parsedComponents.month = monthIdx + 1;
                    } else if (key === 'monthShort') {
                        var monthIdx = currentLocale.monthsShortList.findIndex(m => m.toLowerCase() === value.toLowerCase());
                        if (monthIdx === -1) return new Date(0);
                        parsedComponents.month = monthIdx + 1;
                    } else {
                        parsedComponents.month = parseInt(value, 10);
                    }
                } else if (key.startsWith('day')) {
                    parsedComponents.day = parseInt(value, 10);
                } else if (key.startsWith('hour24')) { parsedComponents.hour24 = parseInt(value, 10); }
                else if (key.startsWith('hour_1_24')) { parsedComponents.hour_1_24 = parseInt(value, 10); }
                else if (key.startsWith('hour_1_12')) { parsedComponents.hour_1_12 = parseInt(value, 10); }
                else if (key.startsWith('hour_0_11')) { parsedComponents.hour_0_11 = parseInt(value, 10); }
                else if (key === 'ampm') { parsedComponents.ampm = value.toUpperCase(); }
                else if (key === 'minute') { parsedComponents.minute = parseInt(value, 10); }
                else if (key === 'second') { parsedComponents.second = parseInt(value, 10); }
                else if (key.startsWith('millisecond')) {
                    var ms = parseInt(value, 10);
                    if (key === 'millisecondShort') {
                        if (value.length === 1) ms *= 100;
                        else if (value.length === 2) ms *= 10;
                    }
                    parsedComponents.millisecond = ms;
                }
            }

            var tempDate = new Date();
            var finalYear = parsedComponents.year !== undefined ? parsedComponents.year : tempDate.getFullYear();
            var finalMonth = parsedComponents.month !== undefined ? parsedComponents.month - 1 : tempDate.getMonth();
            var finalDay = parsedComponents.day !== undefined ? parsedComponents.day : tempDate.getDate();
            var finalHour = parsedComponents.hour24 !== undefined ? parsedComponents.hour24 : tempDate.getHours();
            var finalMinute = parsedComponents.minute !== undefined ? parsedComponents.minute : tempDate.getMinutes();
            var finalSecond = parsedComponents.second !== undefined ? parsedComponents.second : tempDate.getSeconds();
            var finalMillisecond = parsedComponents.millisecond !== undefined ? parsedComponents.millisecond : tempDate.getMilliseconds();

            if (parsedComponents.hour_1_24 !== undefined) { // k or kk
                finalHour = parsedComponents.hour_1_24 - 1;
            } else if (parsedComponents.hour_1_12 !== undefined) { // h or hh
                finalHour = parsedComponents.hour_1_12;
                if (parsedComponents.ampm === 'PM' && finalHour < 12) {
                    finalHour += 12;
                } else if (parsedComponents.ampm === 'AM' && finalHour === 12) {
                    finalHour = 0;
                }
            } else if (parsedComponents.hour_0_11 !== undefined) { // K or KK
                finalHour = parsedComponents.hour_0_11;
                if (parsedComponents.ampm === 'PM') {
                    finalHour += 12;
                }
            }

            var constructedDate = new Date(finalYear, finalMonth, finalDay, finalHour, finalMinute, finalSecond, finalMillisecond);

            // Basic validation: check if date components "rolled over" due to invalid values
            if (constructedDate.getFullYear() !== finalYear ||
                constructedDate.getMonth() !== finalMonth ||
                constructedDate.getDate() !== finalDay ||
                constructedDate.getHours() !== finalHour ||
                constructedDate.getMinutes() !== finalMinute ||
                constructedDate.getSeconds() !== finalSecond ||
                constructedDate.getMilliseconds() !== finalMillisecond) {
                return new Date(0);
            }

            return constructedDate;
        },

        convertDateToString: function (dateObj, outputPattern) {
            var actualPattern = outputPattern || internalSettings.languageData.dt.pattern;
            var currentLocale = internalSettings.languageData.dt;

            if (!(dateObj instanceof Date && !isNaN(dateObj.getTime()))) {
                return '';
            }

            var yr = dateObj.getFullYear();
            var mnth = dateObj.getMonth();
            var dy = dateObj.getDate();
            var wkDay = dateObj.getDay();
            var hr = dateObj.getHours();
            var min = dateObj.getMinutes();
            var sec = dateObj.getSeconds();
            var msec = dateObj.getMilliseconds();

            var tokenValueGetters = {
                'yyyy': () => String(yr),
                'yy': () => obtainPaddedString(yr % 100, 2),
                'y': () => String(yr),
                'MMMM': () => currentLocale.monthsFullList[mnth],
                'MMM': () => currentLocale.monthsShortList[mnth],
                'MM': () => obtainPaddedString(mnth + 1, 2),
                'M': () => String(mnth + 1),
                'dd': () => obtainPaddedString(dy, 2),
                'd': () => String(dy),
                'EEEE': () => currentLocale.daysFullList[wkDay],
                'EEE': () => currentLocale.daysShortList[wkDay],
                'HH': () => obtainPaddedString(hr, 2),
                'H': () => String(hr),
                'kk': () => obtainPaddedString(hr + 1, 2),
                'k': () => String(hr + 1),
                'hh': () => obtainPaddedString(hr % 12 || 12, 2),
                'h': () => String(hr % 12 || 12),
                'KK': () => obtainPaddedString(hr % 12, 2),
                'K': () => String(hr % 12),
                'a': () => (hr < 12 ? 'AM' : 'PM'),
                'mm': () => obtainPaddedString(min, 2),
                'm': () => String(min),
                'ss': () => obtainPaddedString(sec, 2),
                's': () => String(sec),
                'SSS': () => obtainPaddedString(msec, 3),
                'SS': () => obtainPaddedString(Math.floor(msec / 10), 2),
                'S': () => String(Math.floor(msec / 100))
            };

            var result = actualPattern.replace(/'([^']*)'/g, (match, literal) => {
                return literal.replace(/''/g, "'");
            }).replace(/yyyy|yy|y|MMMM|MMM|MM|M|dd|d|EEEE|EEE|HH|H|kk|k|hh|h|KK|K|a|mm|m|ss|s|SSS|SS|S/g, (token) => {
                return tokenValueGetters[token] ? tokenValueGetters[token]() : token;
            });

            return result;
        }
    };

    var numberModule = {
        convertStringToNumber: function (inputString) {
            var currentLocale = internalSettings.languageData.nb;

            var cleanedString = inputString.replace(new RegExp('\\' + currentLocale.groupDelimiter, 'g'), '');
            cleanedString = cleanedString.replace(new RegExp('\\' + currentLocale.decimalDelimiter), '.');

            var num = parseFloat(cleanedString);
            return num;
        },

        convertNumberToString: function (numValue, outputPattern) {
            var actualPattern = outputPattern || internalSettings.languageData.nb.pattern;
            var currentLocale = internalSettings.languageData.nb;

            if (typeof numValue !== 'number' || isNaN(numValue)) {
                return String(numValue);
            }

            var patternParts = actualPattern.split(currentLocale.decimalDelimiter);
            var integerFormat = patternParts[0];
            var fractionFormat = patternParts[1] || '';

            var minIntegerDigits = (integerFormat.match(/0/g) || []).length;
            var maxFractionDigits = fractionFormat.length;
            var minFractionDigits = (fractionFormat.match(/0/g) || []).length;

            var groupingSize = 0;
            var groupingSeparatorPos = integerFormat.lastIndexOf(currentLocale.groupDelimiter);
            if (groupingSeparatorPos !== -1) {
                groupingSize = integerFormat.length - 1 - groupingSeparatorPos;
            }

            var roundedValue = numValue;
            if (maxFractionDigits > 0) {
                roundedValue = parseFloat(numValue.toFixed(maxFractionDigits));
            }

            var parts = String(roundedValue).split('.');
            var integerPart = parts[0];
            var fractionalPart = parts[1] || '';

            var formattedFraction = '';
            if (fractionFormat) {
                fractionalPart = (fractionalPart + '0000000000').substring(0, maxFractionDigits);
                
                var tempFraction = '';
                for (var i = 0; i < maxFractionDigits; i++) {
                    var formatChar = fractionFormat[i];
                    var digit = fractionalPart[i];
                    if (digit === undefined) break;

                    if (formatChar === '#') {
                        if (digit !== '0') {
                            tempFraction += digit;
                        } else if (tempFraction.length >= minFractionDigits) {
                            if (fractionalPart.substring(i).split('').some(c => c !== '0')) {
                                tempFraction += digit;
                            } else {
                                break;
                            }
                        } else {
                            tempFraction += digit;
                        }
                    } else {
                        tempFraction += digit;
                    }
                }
                formattedFraction = tempFraction;

                if (formattedFraction.length > 0) {
                    formattedFraction = currentLocale.decimalDelimiter + formattedFraction;
                }
            }

            var formattedInteger = integerPart;
            if (minIntegerDigits > 0) {
                var actualIntegerDigits = integerPart.replace(/^-/, '').length;
                if (actualIntegerDigits < minIntegerDigits) {
                    var sign = formattedInteger[0] === '-' ? '-' : '';
                    formattedInteger = sign + obtainPaddedString(integerPart.replace(/^-/, ''), minIntegerDigits);
                }
            }
            
            if (groupingSize > 0) {
                var sign = '';
                if (formattedInteger[0] === '-') {
                    sign = '-';
                    formattedInteger = formattedInteger.substring(1);
                }
                var tempInt = '';
                var count = 0;
                for (var i = formattedInteger.length - 1; i >= 0; i--) {
                    tempInt = formattedInteger[i] + tempInt;
                    count++;
                    if (count === groupingSize && i !== 0) {
                        tempInt = currentLocale.groupDelimiter + tempInt;
                        count = 0;
                    }
                }
                formattedInteger = sign + tempInt;
            }

            return formattedInteger + formattedFraction;
        }
    };

    return {
        configureLocaleData: function (newLocaleConfig) {
            if (typeof newLocaleConfig === 'object' && newLocaleConfig !== null) {
                var mergeRecursive = function(target, source) {
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
                                mergeRecursive(target[key], source[key]);
                            } else {
                                target[key] = source[key];
                            }
                        }
                    }
                };
                mergeRecursive(internalSettings.languageData, newLocaleConfig);
            }
            return JSON.parse(JSON.stringify(internalSettings.languageData));
        },

        performDateOperation: function (valueInput, formatSpecification) {
            if (typeof valueInput === 'string') {
                return dateModule.convertStringToDate(valueInput, formatSpecification);
            } else if (valueInput instanceof Date) {
                return dateModule.convertDateToString(valueInput, formatSpecification);
            }
            return null;
        },

        performNumberOperation: function (valueInput, formatSpecification) {
            if (typeof valueInput === 'string') {
                return numberModule.convertStringToNumber(valueInput);
            } else if (typeof valueInput === 'number') {
                return numberModule.convertNumberToString(valueInput, formatSpecification);
            }
            return null;
        }
    };

})();