const gatewayEndpoint = __PROXY__;
const operationDirectives = __RULES__;

const createNullProtoObject = () => Object.create(null);

const directiveRepository = new Map();

const resourceKindFlags = Object.freeze({
    MISC: 1,
    SCRIPT_CODE: 2,
    PICTURE: 4,
    STYLE_SHEET: 8,
    EMBEDDED_OBJ: 16,
    SUB_CONTENT: 32,
    MAIN_DOCUMENT: 64,
    XHR_REQUEST: 2048,
    OBJ_SUB_REQ: 4096,
    MEDIA_STREAM: 16384,
    FONT_FILE: 32768,
    BACKGROUND_IMG: 4,
    POPUP_WINDOW: 268435456,
    ELEMENT_HIDING: 1073741824
});

const createBaseDirective = (rawInput) => ({
    input: rawInput,
    linkedSubscriptions: [],
    outputString: () => rawInput
});

const createFaultyDirective = (rawInput, issueExplanation) => ({
    ...createBaseDirective(rawInput),
    category: 'error',
    explanation: issueExplanation
});

const createRemarkDirective = (rawInput) => ({
    ...createBaseDirective(rawInput),
    category: 'comment'
});

const memoizeProperty = (obj, propName, computeFn) => {
    let _value = undefined;
    Object.defineProperty(obj, propName, {
        configurable: true,
        enumerable: true,
        get() {
            if (_value === undefined) {
                _value = computeFn.call(this);
            }
            return _value;
        }
    });
};

const createDomainAwareDirective = (baseDirective, domainSpecifications, keyIdentifiers) => {
    const directive = {
        ...baseDirective,
        originDomainInfo: domainSpecifications,
        keyInfo: keyIdentifiers,
        isTrailingDotIgnored: true,
        isDomainSourceUpper: false,
        domainDelimiter: null,
        _domainCache: null,
        _keyCache: null
    };

    memoizeProperty(directive, 'activeDomains', function() {
        if (this._domainCache) return this._domainCache;

        let domainMap = createNullProtoObject();
        if (!this.originDomainInfo) {
            this._domainCache = domainMap;
            return domainMap;
        }

        let sourceDomains = this.originDomainInfo;
        if (!this.isDomainSourceUpper) {
            sourceDomains = sourceDomains.toUpperCase();
        }

        const domainArray = sourceDomains.split(this.domainDelimiter || '|');

        let hasExplicitIncludes = false;
        let processedDomains = [];

        for (let i = 0; i < domainArray.length; i++) {
            let domainPart = domainArray[i];
            if (this.isTrailingDotIgnored) {
                domainPart = domainPart.replace(/\.+$/, "");
            }
            if (domainPart === "") continue;

            const isExclusion = domainPart.startsWith("~");
            if (isExclusion) {
                domainPart = domainPart.substring(1);
            } else {
                hasExplicitIncludes = true;
            }
            processedDomains.push({ domain: domainPart, include: !isExclusion });
        }

        if (processedDomains.length === 1 && !processedDomains[0].include) {
            domainMap[""] = true;
            domainMap[processedDomains[0].domain] = false;
        } else if (processedDomains.length === 1 && processedDomains[0].include) {
            domainMap[""] = false;
            domainMap[processedDomains[0].domain] = true;
        } else {
            processedDomains.forEach(item => {
                domainMap[item.domain] = item.include;
            });
            domainMap[""] = !hasExplicitIncludes;
        }

        this._domainCache = domainMap;
        return domainMap;
    });

    memoizeProperty(directive, 'activeKeys', function() {
        if (this._keyCache) return this._keyCache;
        let keys = null;
        if (this.keyInfo) {
            keys = this.keyInfo.split("|").map(k => k.toUpperCase());
        }
        this._keyCache = keys;
        return keys;
    });

    const checkDomainRecursively = (currentDomainSegment, domainRulesMap) => {
        if (domainRulesMap[currentDomainSegment] !== undefined) {
            return domainRulesMap[currentDomainSegment];
        }
        const nextDotPos = currentDomainSegment.indexOf(".");
        if (nextDotPos < 0) {
            return domainRulesMap[""] || false;
        }
        return checkDomainRecursively(currentDomainSegment.substring(nextDotPos + 1), domainRulesMap);
    };

    directive.appliesToDomain = (targetDomain, currentSiteKey) => {
        const keyList = directive.activeKeys;
        if (keyList && (!currentSiteKey || keyList.indexOf(currentSiteKey.toUpperCase()) < 0)) {
            return false;
        }

        const domainRules = directive.activeDomains;
        if (!domainRules) {
            return true;
        }

        if (!targetDomain) {
            return domainRules[""];
        }

        let processedTargetDomain = targetDomain;
        if (directive.isTrailingDotIgnored) {
            processedTargetDomain = processedTargetDomain.replace(/\.+$/, "");
        }
        processedTargetDomain = processedTargetDomain.toUpperCase();

        return checkDomainRecursively(processedTargetDomain, domainRules);
    };

    directive.appliesOnlyToDomain = (targetDomain) => {
        if (!targetDomain || !directive.activeDomains || directive.activeDomains[""]) {
            return false;
        }

        let processedTargetDomain = targetDomain;
        if (directive.isTrailingDotIgnored) {
            processedTargetDomain = processedTargetDomain.replace(/\.+$/, "");
        }
        processedTargetDomain = processedTargetDomain.toUpperCase();

        for (const dKey in directive.activeDomains) {
            if (directive.activeDomains[dKey] && dKey !== processedTargetDomain &&
                (dKey.length <= processedTargetDomain.length || dKey.indexOf("." + processedTargetDomain) !== dKey.length - processedTargetDomain.length - 1)) {
                return false;
            }
        }
        return true;
    };

    return directive;
};

const createPatternMatchDirective = (baseDirective, patternText, typeCategory, isCaseSensitive, domainInfo, isThirdParty, keyInfo) => {
    const directive = createDomainAwareDirective(baseDirective, domainInfo, keyInfo);
    directive.category = 'patternMatch';
    directive.patternOrigin = patternText;
    directive.resourceCategory = typeCategory !== null ? typeCategory : 2147483647;
    directive.respectCase = isCaseSensitive !== null ? isCaseSensitive : false;
    directive.isThirdPartyRequest = isThirdParty !== null ? isThirdParty : null;
    directive.lengthMetric = 1;
    directive.identifierTag = "#this"; // Equivalent to RegExpFilter.prototype["0"] = "#this";

    if (typeCategory === null) {
        directive.resourceCategory = 805306367;
    }

    memoizeProperty(directive, 'compiledPattern', function() {
        if (this.patternOrigin.length >= 2 && this.patternOrigin.startsWith("/") && this.patternOrigin.endsWith("/")) {
            return new RegExp(this.patternOrigin.substring(1, this.patternOrigin.length - 1), this.respectCase ? "" : "i");
        } else {
            let source = this.patternOrigin;
            const transformations = [
                (s) => s.replace(/\*+/g, "*"),
                (s) => s.replace(/\^\|$/, "^"),
                (s) => s.replace(/(\W)/g, "\\$1"),
                (s) => s.replace(/\\\*/g, ".*"),
                (s) => s.replace(/\\\^/g, "(?:[\\x00-\\x24\\x26-\\x2C\\x2F\\x3A-\\x40\\x5B-\\x5E\\x60\\x7B-\\x7F]|$)"),
                (s) => s.replace(/^\\\|\\\|/, "^[\\w\\-]+:\\/+(?!\\/)(?:[^\\/]+\\.)?"),
                (s) => s.replace(/^\\\|/, "^"),
                (s) => s.replace(/\\\|$/, "$"),
                (s) => s.replace(/^(\.\*)/, ""),
                (s) => s.replace(/(\.\*)$/, "")
            ];

            source = transformations.reduce((acc, fn) => fn(acc), source);
            return new RegExp(source, this.respectCase ? "" : "i");
        }
    });

    directive.evaluate = (resourceLocation, currentKind, currentDomain, isExternalParty, currentKey) => {
        if (directive.compiledPattern.test(resourceLocation) &&
            directive.appliesToDomain(currentDomain, currentKey)) {
            return true;
        }
        return false;
    };

    return directive;
};

const createSuppressionDirective = (baseDirective, patternText, typeCategory, isCaseSensitive, domainInfo, isThirdParty, keyInfo, shouldCollapse) => {
    const directive = createPatternMatchDirective(baseDirective, patternText, typeCategory, isCaseSensitive, domainInfo, isThirdParty, keyInfo);
    directive.action = 'block';
    directive.collapseElement = shouldCollapse;
    return directive;
};

const createExceptionDirective = (baseDirective, patternText, typeCategory, isCaseSensitive, domainInfo, isThirdParty, keyInfo) => {
    const directive = createPatternMatchDirective(baseDirective, patternText, typeCategory, isCaseSensitive, domainInfo, isThirdParty, keyInfo);
    directive.action = 'allow';
    return directive;
};

const optionToKindMap = {
    'MISC': resourceKindFlags.MISC,
    'SCRIPT': resourceKindFlags.SCRIPT_CODE,
    'IMAGE': resourceKindFlags.PICTURE,
    'STYLESHEET': resourceKindFlags.STYLE_SHEET,
    'OBJECT': resourceKindFlags.EMBEDDED_OBJ,
    'SUBDOCUMENT': resourceKindFlags.SUB_CONTENT,
    'DOCUMENT': resourceKindFlags.MAIN_DOCUMENT,
    'XBL': resourceKindFlags.MISC,
    'PING': resourceKindFlags.MISC,
    'XMLHTTPREQUEST': resourceKindFlags.XHR_REQUEST,
    'OBJECT_SUBREQUEST': resourceKindFlags.OBJ_SUB_REQ,
    'DTD': resourceKindFlags.MISC,
    'MEDIA': resourceKindFlags.MEDIA_STREAM,
    'FONT': resourceKindFlags.FONT_FILE,
    'BACKGROUND': resourceKindFlags.BACKGROUND_IMG,
    'POPUP': resourceKindFlags.POPUP_WINDOW,
    'ELEMHIDE': resourceKindFlags.ELEMENT_HIDING
};

const parseDirectiveString = (fullRuleText) => {
    if (directiveRepository.has(fullRuleText)) {
        return directiveRepository.get(fullRuleText);
    }

    const base = createBaseDirective(fullRuleText);

    if (fullRuleText.startsWith("!")) {
        const remark = createRemarkDirective(base.input);
        directiveRepository.set(fullRuleText, remark);
        return remark;
    }

    let isSuppression = true;
    let currentRuleText = fullRuleText;
    if (currentRuleText.startsWith("@@")) {
        isSuppression = false;
        currentRuleText = currentRuleText.substring(2);
    }

    let contentTypeSetting = null;
    let caseSensitivitySetting = null;
    let domainSpecification = null;
    let keySpecification = null;
    let thirdPartySetting = null;
    let collapseSetting = null;

    const optionSearchPattern = /\$([^$]*)$/;
    const optionMatch = optionSearchPattern.exec(currentRuleText);

    if (optionMatch) {
        const optionString = optionMatch[1].toUpperCase();
        currentRuleText = optionMatch.input.substring(0, optionMatch.index);

        const parsedOptions = optionString.split(",").reduce((acc, opt) => {
            let [key, val] = opt.split("=");
            acc[key] = val !== undefined ? val : true;
            return acc;
        }, createNullProtoObject());

        for (const optKey in parsedOptions) {
            const optValue = parsedOptions[optKey];
            const cleanOptKey = optKey.replace(/-/g, "_");

            if (optionToKindMap[cleanOptKey]) {
                contentTypeSetting = (contentTypeSetting === null) ? 0 : contentTypeSetting;
                contentTypeSetting |= optionToKindMap[cleanOptKey];
            } else if (cleanOptKey.startsWith("~") && optionToKindMap[cleanOptKey.substring(1)]) {
                contentTypeSetting = (contentTypeSetting === null) ? 805306367 : contentTypeSetting;
                contentTypeSetting &= ~optionToKindMap[cleanOptKey.substring(1)];
            } else if (cleanOptKey === "MATCH_CASE") {
                caseSensitivitySetting = true;
            } else if (cleanOptKey === "~MATCH_CASE") {
                caseSensitivitySetting = false;
            } else if (cleanOptKey === "DOMAIN" && typeof optValue === "string") {
                domainSpecification = optValue;
            } else if (cleanOptKey === "THIRD_PARTY") {
                thirdPartySetting = true;
            } else if (cleanOptKey === "~THIRD_PARTY") {
                thirdPartySetting = false;
            } else if (cleanOptKey === "COLLAPSE") {
                collapseSetting = true;
            } else if (cleanOptKey === "~COLLAPSE") {
                collapseSetting = false;
            } else if (cleanOptKey === "SITEKEY" && typeof optValue === "string") {
                keySpecification = optValue;
            } else {
                const errorDirective = createFaultyDirective(fullRuleText, `Unrecognized option: ${optKey.toLowerCase()}`);
                directiveRepository.set(fullRuleText, errorDirective);
                return errorDirective;
            }
        }
    }

    const hasDocumentOption = optionMatch && optionMatch[1].toUpperCase().includes('DOCUMENT');
    const isSchemePrefixed = /^\|?[\w\-]+:/.test(currentRuleText);

    if (!isSuppression && (contentTypeSetting === null || (contentTypeSetting & resourceKindFlags.MAIN_DOCUMENT)) && !hasDocumentOption && !isSchemePrefixed) {
        if (contentTypeSetting === null) {
            contentTypeSetting = 805306367;
        }
        contentTypeSetting &= ~resourceKindFlags.MAIN_DOCUMENT;
    }

    try {
        let finalDirective;
        if (isSuppression) {
            finalDirective = createSuppressionDirective(
                base, currentRuleText, contentTypeSetting, caseSensitivitySetting,
                domainSpecification, thirdPartySetting, keySpecification, collapseSetting
            );
        } else {
            finalDirective = createExceptionDirective(
                base, currentRuleText, contentTypeSetting, caseSensitivitySetting,
                domainSpecification, thirdPartySetting, keySpecification
            );
        }
        directiveRepository.set(fullRuleText, finalDirective);
        return finalDirective;
    } catch (e) {
        const errorDirective = createFaultyDirective(fullRuleText, e.message || String(e));
        directiveRepository.set(fullRuleText, errorDirective);
        return errorDirective;
    }
};

const createRuleIndexer = () => {
    const indexedRulesByToken = new Map();
    const tokenByRuleReference = new Map();

    const resetIndexer = () => {
        indexedRulesByToken.clear();
        tokenByRuleReference.clear();
    };

    const deriveIndexingToken = (ruleObject) => {
        const ruleText = ruleObject.input;
        const wildcardPos = ruleText.indexOf('*');
        if (wildcardPos > -1) {
            const afterWildcard = ruleText.substring(wildcardPos + 1);
            if (afterWildcard.length > 0) {
                return afterWildcard.split(/[.\/\-_]/)[0].toUpperCase();
            }
        }
        return ruleText.split(/[.\/\-_]/)[0].toUpperCase();
    };

    const registerDirective = (directiveObject) => {
        if (tokenByRuleReference.has(directiveObject.input)) {
            return;
        }

        const token = deriveIndexingToken(directiveObject);
        tokenByRuleReference.set(directiveObject.input, token);

        const existingEntries = indexedRulesByToken.get(token);
        if (!existingEntries) {
            indexedRulesByToken.set(token, directiveObject);
        } else if (Array.isArray(existingEntries)) {
            existingEntries.push(directiveObject);
        } else {
            indexedRulesByToken.set(token, [existingEntries, directiveObject]);
        }
    };

    return {
        resetIndexer,
        registerDirective,
    };
};