const globalSettingsMirror = {
    variables: {
        indentation: '\t',
    },
    html: {
        element_types: {
            empty: {
                'area': true, 'base': true, 'br': true, 'col': true, 'embed': true, 'hr': true,
                'img': true, 'input': true, 'keygen': true, 'link': true, 'meta': true,
                'param': true, 'source': true, 'track': true, 'wbr': true
            },
            inline_level: {
                'a': true, 'abbr': true, 'acronym': true, 'b': true, 'bdo': true, 'big': true,
                'br': true, 'button': true, 'cite': true, 'code': true, 'dfn': true, 'em': true,
                'i': true, 'img': true, 'input': true, 'kbd': 'true', 'label': true, 'map': true,
                'object': true, 'q': true, 'samp': true, 'script': true, 'select': true, 'small': true,
                'span': true, 'strong': true, 'sub': true, 'sup': true, 'textarea': true, 'tt': true,
                'var': true
            },
            block_level: {
                'address': true, 'article': true, 'aside': true, 'blockquote': true, 'body': true,
                'canvas': true, 'dd': true, 'div': true, 'dl': true, 'dt': true, 'fieldset': true,
                'figcaption': true, 'figure': true, 'footer': true, 'form': true, 'h1': true,
                'h2': true, 'h3': true, 'h4': true, 'h5': true, 'h6': true, 'head': true, 'header': true,
                'hgroup': true, 'hr': true, 'html': true, 'li': true, 'main': true, 'nav': true,
                'noscript': true, 'ol': true, 'p': true, 'pre': true, 'section': true, 'tfoot': true,
                'ul': true, 'video': true
            }
        }
    },
};

const abbreviationRepository = {
    html: {
        'div': { type: 'syntactic-tag', value: { name: 'div', is_empty: false } },
        'p': { type: 'syntactic-tag', value: { name: 'p', is_empty: false } },
        'img': { type: 'syntactic-tag', value: { name: 'img', is_empty: true } },
        'br': { type: 'syntactic-tag', value: { name: 'br', is_empty: true } },
        'a': { type: 'syntactic-tag', value: { name: 'a', is_empty: false, attributes: [{ name: 'href', value: '' }] } },
    }
};

const snippetRepository = {
    html: {}
};

const markupBoundaryPattern = /<\/?[\w:\-]+(?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*\s*(\/?)>$/;

const contentFillerPlaceholder = '{%::syntactic-content::%}';
const standardLineBreak = '\n';

const defaultRenderConfiguration = {
    tagCasing: 'lower',
    attributeCasing: 'lower',
    attributeQuotationStyle: 'double',
    elementNewlineStrategy: 'decide',
    cursorPlacement: true,
    indentElements: true,
    selfClosingTagStyle: 'xhtml'
};

const processedConfigurations = {};

const isPermittedCharacter = (char) => {
    const code = char.charCodeAt(0);
    const specialSymbols = new Set(['#', '.', '>', '+', '*', ':', '$', '-', '_', '!', '@']);
    return (code >= 65 && code <= 90)
        || (code >= 97 && code <= 122)
        || (code >= 48 && code <= 57)
        || specialSymbols.has(char);
};

const retrieveLineSeparator = () => standardLineBreak;

const segmentTextIntoLines = (fullText, omitEmpty) => {
    const normalizedText = fullText.replace(/\r\n|\n\r/g, '\n');
    const lines = normalizedText.split('\n');
    return omitEmpty
        ? lines.filter(line => stripWhitespace(line) !== '')
        : lines;
};

const stripWhitespace = (text) => (text || '').trim();

const establishConfiguration = (options) => {
    return Object.keys(defaultRenderConfiguration).reduce((acc, key) => {
        acc[key] = (key in options) ? options[key] : defaultRenderConfiguration[key];
        return acc;
    }, {});
};

const registerConfiguration = (label, options) => {
    processedConfigurations[label.toLowerCase()] = establishConfiguration(options || {});
};

const mapStringToBooleanObject = (str) => {
    return str.split(',').reduce((acc, item) => {
        acc[item.trim()] = true;
        return acc;
    }, {});
};

const indentStringBlock = (text, indentSpec) => {
    const indentationString = typeof indentSpec === 'number'
        ? globalSettingsMirror.variables.indentation.repeat(indentSpec)
        : indentSpec;

    const lines = segmentTextIntoLines(text);
    return lines.map((line, index) => index === 0 ? line : indentationString + line).join(retrieveLineSeparator());
};

const isSnippetPresent = (alias, kind) => Boolean(snippetRepository[kind] && snippetRepository[kind][alias]);

const endsInMarkupTag = (text) => markupBoundaryPattern.test(text);

const fetchElementCollections = (sourceResource, category) => {
    if (sourceResource && sourceResource.element_types) {
        return sourceResource.element_types[category] || {};
    }
    return {};
};

const substituteVariables = (text, variables = globalSettingsMirror.variables) => {
    return text.replace(/\$\{([\w\-]+)\}/g, (match, varName) => {
        return (varName in variables) ? variables[varName] : match;
    });
};

const resolveElementAbbreviation = (kind, alias) => {
    return abbreviationRepository[kind] && abbreviationRepository[kind][alias];
};

const elementKind = {
    ABBREVIATION: 'syntactic-tag',
    EXPANSION: 'syntactic-expando',
    REFERENCE: 'syntactic-reference'
};

const createElementSpecifier = (nominalName, repetitionCount = 1, elementCategory = 'html') => {
    const lowerName = nominalName.toLowerCase();
    let resolvedAbbr = resolveElementAbbreviation(elementCategory, lowerName);

    if (resolvedAbbr && resolvedAbbr.type === elementKind.REFERENCE) {
        resolvedAbbr = resolveElementAbbreviation(elementCategory, resolvedAbbr.value);
    }

    const elementSpec = {
        elementName: resolvedAbbr ? resolvedAbbr.value.name : nominalName.replace('+', ''),
        occurrenceCount: repetitionCount,
        childElements: [],
        elementAttributes: new Map(),
        _resolvedAbbreviation: resolvedAbbr,
        _resourceContext: globalSettingsMirror[elementCategory],
        _elementContent: '',
        lineRepetitionMode: false,
    };

    if (elementSpec._resolvedAbbreviation && elementSpec._resolvedAbbreviation.value.attributes) {
        elementSpec._resolvedAbbreviation.value.attributes.forEach(attr => {
            assignAttributeToElement(elementSpec, attr.name, attr.value);
        });
    }

    return elementSpec;
};

const addChildToElement = (parent, child) => {
    parent.childElements.push(child);
};

const assignAttributeToElement = (element, key, value) => {
    if (element.elementAttributes.has(key)) {
        if (key === 'class') {
            const existingValue = element.elementAttributes.get(key);
            element.elementAttributes.set(key, (existingValue ? existingValue + ' ' : '') + value);
        } else {
            element.elementAttributes.set(key, value);
        }
    } else {
        element.elementAttributes.set(key, value);
    }
};

const isElementEmpty = (element) => {
    const abbrIsEmpty = element._resolvedAbbreviation && element._resolvedAbbreviation.value.is_empty;
    const fromCollection = element.elementName in fetchElementCollections(element._resourceContext, 'empty');
    return abbrIsEmpty || fromCollection;
};

const isElementInline = (element) => {
    return element.elementName in fetchElementCollections(element._resourceContext, 'inline_level');
};

const isElementBlock = (element) => {
    return element.elementName in fetchElementCollections(element._resourceContext, 'block_level');
};

const elementContentHasTags = (element) => {
    return element._elementContent && markupBoundaryPattern.test(element._elementContent);
};

const elementHasBlockChildren = (element) => {
    if (elementContentHasTags(element) && isElementBlock(element)) {
        return true;
    }
    return element.childElements.some(child => isElementBlock(child));
};

const setElementContent = (element, content) => {
    element._elementContent = content;
};

const getElementContent = (element) => {
    return element._elementContent;
};

const findDeepestTerminalChild = (element) => {
    if (!element.childElements.length) {
        return null;
    }
    let deepest = element;
    while (deepest.childElements.length) {
        deepest = deepest.childElements[deepest.childElements.length - 1];
    }
    return deepest;
};

const renderElementStructure = (currentElement, configIdentifier) => {
    const activeConfig = processedConfigurations[configIdentifier] || processedConfigurations['plain'] || defaultRenderConfiguration;

    const {
        tagCasing,
        attributeCasing,
        attributeQuotationStyle,
        elementNewlineStrategy,
        cursorPlacement,
        indentElements,
        selfClosingTagStyle
    } = activeConfig;

    const attributeQuote = attributeQuotationStyle === 'single' ? "'" : '"';
    const cursorMarker = cursorPlacement ? '|' : '';
    let selfClosingSuffix = '';

    const isCurrentEmpty = isElementEmpty(currentElement) && !currentElement.childElements.length;

    const selfClosingStyleMap = {
        'xhtml': ' /',
        'true': '/',
        'false': ''
    };
    selfClosingSuffix = selfClosingStyleMap[String(selfClosingTagStyle)] || '';

    const shouldAllowNewline = (el) => {
        return elementNewlineStrategy === true || (elementNewlineStrategy === 'decide' && isElementBlock(el));
    };

    const formattedAttributes = Array.from(currentElement.elementAttributes.entries()).reduce((acc, [attrName, attrValue]) => {
        const processedAttrName = attributeCasing === 'upper' ? attrName.toUpperCase() : attrName.toLowerCase();
        return `${acc} ${processedAttrName}=${attributeQuote}${attrValue || cursorMarker}${attributeQuote}`;
    }, '');

    let generatedChildContent = '';
    const deepestChild = findDeepestTerminalChild(currentElement);

    if (!isCurrentEmpty) {
        if (deepestChild && currentElement.lineRepetitionMode) {
            setElementContent(deepestChild, contentFillerPlaceholder);
        }

        generatedChildContent = currentElement.childElements.map((child, index, arr) => {
            let childOutput = renderElementStructure(child, configIdentifier);
            if (index < arr.length - 1 && (shouldAllowNewline(child) || shouldAllowNewline(arr[index + 1]))) {
                childOutput += retrieveLineSeparator();
            }
            return childOutput;
        }).join('');
    }

    let openingTag = '';
    let closingTag = '';
    if (currentElement.elementName) {
        const processedTagName = tagCasing === 'upper' ? currentElement.elementName.toUpperCase() : currentElement.elementName.toLowerCase();
        if (isCurrentEmpty) {
            openingTag = `<${processedTagName}${formattedAttributes}${selfClosingSuffix}>`;
        } else {
            openingTag = `<${processedTagName}${formattedAttributes}>`;
            closingTag = `</${processedTagName}>`;
        }
    }

    if (elementNewlineStrategy !== false) {
        const needsBlockNewline = currentElement.elementName && (elementNewlineStrategy === true || elementHasBlockChildren(currentElement));

        if (needsBlockNewline) {
            if (closingTag) {
                openingTag += retrieveLineSeparator() + globalSettingsMirror.variables.indentation;
                closingTag = retrieveLineSeparator() + closingTag;
            }
        }

        if (currentElement.elementName) {
            if (generatedChildContent) {
                generatedChildContent = indentStringBlock(generatedChildContent, indentElements ? 1 : 0);
            } else if (!isCurrentEmpty) {
                openingTag += cursorMarker;
            }
        }
    }

    const finalRenderedOutputs = [];
    let currentElementContent = getElementContent(currentElement);

    if (currentElement.lineRepetitionMode) {
        const lines = segmentTextIntoLines(stripWhitespace(currentElementContent), true);
        lines.forEach((line, index) => {
            const currentIterationContent = deepestChild ? '' : contentFillerPlaceholder;
            const contentPart = generatedChildContent || currentIterationContent;

            let elementString = openingTag.replace(/\$/g, index + 1) + contentPart + closingTag;
            finalRenderedOutputs.push(elementString.replace(contentFillerPlaceholder, stripWhitespace(line)));
        });
    } else {
        if (currentElementContent) {
            const padAmount = (elementNewlineStrategy === true || (elementContentHasTags(currentElement) && isElementBlock(currentElement))) ? 1 : 0;
            generatedChildContent = indentStringBlock(currentElementContent, padAmount) + generatedChildContent;
        }

        for (let i = 0; i < currentElement.occurrenceCount; i++) {
            finalRenderedOutputs.push(openingTag.replace(/\$/g, i + 1) + generatedChildContent + closingTag);
        }
    }

    const joiningGlue = shouldAllowNewline(currentElement) ? retrieveLineSeparator() : '';
    return finalRenderedOutputs.join(joiningGlue);
};

const createSnippetSpecifier = (nameOfSnippet, timesToRepeat = 1, snippetCategory = 'html') => {
    const resolvedSnippetValue = snippetRepository[snippetCategory] && snippetRepository[snippetCategory][nameOfSnippet];

    return {
        snippetName: nameOfSnippet,
        repeatCount: timesToRepeat,
        nestedElements: [],
        _snippetContent: '',
        lineRepeatFlag: false,
        definedAttributes: new Map([['id', '|'], ['class', '|']]),
        snippetValue: resolvedSnippetValue,
    };
};

const appendNestedElement = (parentSnippet, childElement) => {
    parentSnippet.nestedElements.push(childElement);
};

const assignSnippetAttribute = (snippet, key, val) => {
    snippet.definedAttributes.set(key, val);
};

const isSnippetConsideredBlock = (snippet) => true;

const syntacticSculptor = (() => {
    registerConfiguration('plain', {});

    return {
        isCharacterPermitted: isPermittedCharacter,
        getLineBreak: retrieveLineSeparator,
        splitLines: segmentTextIntoLines,
        trimText: stripWhitespace,
        configureRenderSettings: registerConfiguration,
        indentCodeBlock: indentStringBlock,
        checkSnippetExistence: isSnippetPresent,
        checkEndsWithTag: endsInMarkupTag,
        retrieveElementDefinitions: fetchElementCollections,
        processVariables: substituteVariables,

        createElement: createElementSpecifier,
        addElementChild: addChildToElement,
        assignElementAttribute: assignAttributeToElement,
        isElementSpecEmpty: isElementEmpty,
        isElementSpecInline: isElementInline,
        isElementSpecBlock: isElementBlock,
        elementSpecContentHasTags: elementContentHasTags,
        elementSpecHasBlockChildren: elementHasBlockChildren,
        setElementSpecContent: setElementContent,
        getElementSpecContent: getElementContent,
        findElementSpecDeepestChild: findDeepestTerminalChild,
        renderElement: renderElementStructure,

        createSnippet: createSnippetSpecifier,
        appendSnippetNestedElement: appendNestedElement,
        assignSnippetAttribute: assignSnippetAttribute,
        isSnippetBlock: isSnippetConsideredBlock,

        elementTypes: elementKind,
        contentPlaceholderString: contentFillerPlaceholder,
        lineBreakCharacter: standardLineBreak,
        markupDetectionPattern: markupBoundaryPattern
    };
})();