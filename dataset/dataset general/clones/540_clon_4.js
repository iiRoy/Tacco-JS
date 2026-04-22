const _configurationFactory = (keyIdentity, valueContent) => ({
    keyIdentity: keyIdentity,
    valueContent: valueContent
});

const _testCaseFactory = (isFragment, sourcePrimary, resultExpected, sourceSecondary, resultStatic) => {
    const dataUnit = { isFragmentUnit: isFragment };
    if (sourcePrimary !== undefined) dataUnit.primaryInput = sourcePrimary;
    if (resultExpected !== undefined) dataUnit.expectedOutput = resultExpected;
    if (sourceSecondary !== undefined) dataUnit.secondaryInput = sourceSecondary;
    if (resultStatic !== undefined) dataUnit.staticOutput = resultStatic;
    return dataUnit;
};

const _generateDataSet = () => {
    const _rootObject = {};

    _rootObject.initialConfiguration = [
        _configurationFactory("indentationMeasure", "4"),
        _configurationFactory("indentationSymbol", "' '"),
        _configurationFactory("maintainNewlines", "true"),
        _configurationFactory("jslintCompliance", "false"),
        _configurationFactory("preserveArrayIndentation", "false"),
        _configurationFactory("braceFormatting", "'collapse'"),
        _configurationFactory("additionalLineElements", "['html', 'head', '/html']")
    ];

    const _collectionList = [];

    const _createTestSuite = (title, summary, configMatrices, testRecords, formatTemplate, specificSettings) => {
        const suite = {
            suiteTitle: title,
            suiteSummary: summary || ""
        };
        if (configMatrices && configMatrices.length > 0) suite.configMatrices = configMatrices;
        if (testRecords && testRecords.length > 0) suite.testRecords = testRecords;
        if (formatTemplate) suite.templateFormat = formatTemplate;
        if (specificSettings && specificSettings.length > 0) suite.suiteSpecificSettings = specificSettings;
        return suite;
    };

    // Suite 1: Line Endings
    _collectionList.push(_createTestSuite(
        "Line Endings",
        "",
        [
            {
                settingItems: [_configurationFactory("endsWithNewline", "true")],
                lineEndingChar: '\\n'
            }, {
                settingItems: [_configurationFactory("endsWithNewline", "false")],
                lineEndingChar: ''
            }
        ],
        [
            _testCaseFactory(true, '', '{{lineEndingChar}}'),
            _testCaseFactory(true, '<div></div>', '<div></div>{{lineEndingChar}}'),
            _testCaseFactory(true, '\n', '{{lineEndingChar}}')
        ]
    ));

    // Suite 2: Custom Extra Liners (empty)
    _collectionList.push(_createTestSuite(
        "Custom Line Inserts (empty)",
        "",
        [
            {
                settingItems: [_configurationFactory("additionalLineElements", "[]")]
            }
        ],
        [
            _testCaseFactory(true, '<html><head><meta></head><body><div><p>x</p></div></body></html>', '<html>\n<head>\n    <meta>\n</head>\n<body>\n    <div>\n        <p>x</p>\n    </div>\n</body>\n</html>')
        ]
    ));

    // Suite 3: Custom Extra Liners (default)
    _collectionList.push(_createTestSuite(
        "Custom Line Inserts (default)",
        "",
        [
            {
                settingItems: [_configurationFactory("additionalLineElements", "null")]
            }
        ],
        [
            _testCaseFactory(true, '<html><head></head><body></body></html>', '<html>\n\n<head></head>\n\n<body></body>\n\n</html>')
        ]
    ));

    // Suite 4: Custom Extra Liners (p, string)
    _collectionList.push(_createTestSuite(
        "Custom Line Inserts (paragraph, string)",
        "",
        [
            {
                settingItems: [_configurationFactory("additionalLineElements", "'p,/p'")]
            }
        ],
        [
            _testCaseFactory(true, '<html><head><meta></head><body><div><p>x</p></div></body></html>', '<html>\n<head>\n    <meta>\n</head>\n<body>\n    <div>\n\n        <p>x\n\n        </p>\n    </div>\n</body>\n</html>')
        ]
    ));

    // Suite 5: Custom Extra Liners (p)
    _collectionList.push(_createTestSuite(
        "Custom Line Inserts (paragraph)",
        "",
        [
            {
                settingItems: [_configurationFactory("additionalLineElements", "['p', '/p']")]
            }
        ],
        [
            _testCaseFactory(true, '<html><head><meta></head><body><div><p>x</p></div></body></html>', '<html>\n<head>\n    <meta>\n</head>\n<body>\n    <div>\n\n        <p>x\n\n        </p>\n    </div>\n</body>\n</html>')
        ]
    ));

    // Suite 6: Attribute Wrapping
    _collectionList.push(_createTestSuite(
        "Attribute Wrapping",
        "Wraps attributes inside of html tags",
        [
            {
                settingItems: [_configurationFactory("attributeWrapping", "'force'")],
                lineEndingChar: '\\n',
                attributeIndent: '    ',
                overflowWrap: '\\n'
            }, {
                settingItems: [_configurationFactory("attributeWrapping", "'force'"), _configurationFactory("wrapLengthLimit", "80")],
                lineEndingChar: '\\n',
                attributeIndent: '    ',
                overflowWrap: '\\n'
            }, {
                settingItems: [_configurationFactory("attributeWrapping", "'force'"), _configurationFactory("attributeIndentSize", "8")],
                lineEndingChar: '\\n',
                attributeIndent: '        ',
                overflowWrap: '\\n'
            }, {
                settingItems: [_configurationFactory("attributeWrapping", "'auto'"), _configurationFactory("wrapLengthLimit", "80")],
                lineEndingChar: ' ',
                attributeIndent: '',
                overflowWrap: '\\n'
            }, {
                settingItems: [_configurationFactory("attributeWrapping", "'auto'"), _configurationFactory("wrapLengthLimit", "0")],
                lineEndingChar: ' ',
                attributeIndent: '',
                overflowWrap: ' '
            }
        ],
        [
            _testCaseFactory(true, '<div attr0 attr1="123" data-attr2="hello    t here">This is some text</div>', '<div attr0{{lineEndingChar}}{{attributeIndent}}attr1="123"{{lineEndingChar}}{{attributeIndent}}data-attr2="hello    t here">This is some text</div>'),
            _testCaseFactory(true, '<div lookatthissuperduperlongattributenamewhoahcrazy0="true" attr0 attr1="123" data-attr2="hello    t here" heymanimreallylongtoowhocomesupwiththesenames="false">This is some text</div>', '<div lookatthissuperduperlongattributenamewhoahcrazy0="true"{{lineEndingChar}}{{attributeIndent}}attr0{{lineEndingChar}}{{attributeIndent}}attr1="123"{{lineEndingChar}}{{attributeIndent}}data-attr2="hello    t here"{{overflowWrap}}{{attributeIndent}}heymanimreallylongtoowhocomesupwiththesenames="false">This is some text</div>'),
            _testCaseFactory(true, '<img attr0 attr1="123" data-attr2="hello    t here"/>', '<img attr0{{lineEndingChar}}{{attributeIndent}}attr1="123"{{lineEndingChar}}{{attributeIndent}}data-attr2="hello    t here" />')
        ]
    ));

    // Suite 7: Handlebars Indenting Off
    _collectionList.push(_createTestSuite(
        "Handlebars Indentation Off",
        "Test handlebar behavior when indenting is off",
        undefined,
        [
            _testCaseFactory(true, undefined, '{{#if 0}}\n<div>\n</div>\n{{/if}}', '{{#if 0}}\n    <div>\n    </div>\n{{/if}}'),
            _testCaseFactory(true, undefined, '<div>\n    {{#each thing}} {{name}} {{/each}}\n</div>', '<div>\n{{#each thing}}\n    {{name}}\n{{/each}}\n</div>')
        ],
        "^^^ $$$",
        [_configurationFactory("handlebarsIndentation", "false")]
    ));

    // Suite 8: Handlebars Indenting On
    _collectionList.push(_createTestSuite(
        "Handlebars Indentation On",
        "Test handlebar formatting",
        [
            {
                settingItems: [_configurationFactory("handlebarsIndentation", "true")],
                contentValue: '{{field}}'
            }, {
                settingItems: [_configurationFactory("handlebarsIndentation", "true")],
                contentValue: '{{! comment}}'
            }, {
                settingItems: [_configurationFactory("handlebarsIndentation", "true")],
                contentValue: '{pre{{field1}} {{field2}} {{field3}}post'
            }, {
                settingItems: [_configurationFactory("handlebarsIndentation", "true")],
                contentValue: '{{! \\n mult-line\\ncomment  \\n     with spacing\\n}}'
            }
        ],
        [
            _testCaseFactory(true, undefined, undefined, undefined, '{{#if 0}}{{/if}}'),
            _testCaseFactory(true, undefined, undefined, undefined, '{{#if 0}}^^^content$$${{/if}}'),
            _testCaseFactory(true, undefined, undefined, undefined, '{{#if 0}}\n{{/if}}'),
            _testCaseFactory(true, '{{#if     words}}{{/if}}', '{{#if words}}{{/if}}'),
            _testCaseFactory(true, '{{#if     words}}^^^content$$${{/if}}', '{{#if words}}^^^content$$${{/if}}'),
            _testCaseFactory(true, '{{#if     words}}^^^content$$${{/if}}', '{{#if words}}^^^content$$${{/if}}'),
            _testCaseFactory(true, undefined, undefined, undefined, '{{#if 1}}\n    <div>\n    </div>\n{{/if}}'),
            _testCaseFactory(true, '{{#if 1}}\n<div>\n</div>\n{{/if}}', '{{#if 1}}\n    <div>\n    </div>\n{{/if}}'),
            _testCaseFactory(true, undefined, undefined, undefined, '<div>\n    {{#if 1}}\n    {{/if}}\n</div>'),
            _testCaseFactory(true, '<div>\n{{#if 1}}\n{{/if}}\n</div>', '<div>\n    {{#if 1}}\n    {{/if}}\n</div>'),
            _testCaseFactory(true, '{{#if}}\n{{#each}}\n{{#if}}\n^^^content$$$\n{{/if}}\n{{#if}}\n^^^content$$$\n{{/if}}\n{{/each}}\n{{/if}}', '{{#if}}\n    {{#each}}\n        {{#if}}\n            ^^^content$$$\n        {{/if}}\n        {{#if}}\n            ^^^content$$$\n        {{/if}}\n    {{/each}}\n{{/if}}'),
            _testCaseFactory(true, undefined, undefined, undefined, '{{#if 1}}\n    <div>\n    </div>\n{{/if}}'),
            _testCaseFactory(true, '{{#if 1}}\n    ^^^content$$$\n    {{else}}\n    ^^^content$$$\n{{/if}}', '{{#if 1}}\n    ^^^content$$$\n{{else}}\n    ^^^content$$$\n{{/if}}'),
            _testCaseFactory(true, '{{#if 1}}\n    {{else}}\n    {{/if}}', '{{#if 1}}\n{{else}}\n{{/if}}'),
            _testCaseFactory(true, '{{#if thing}}\n{{#if otherthing}}\n    ^^^content$$$\n    {{else}}\n^^^content$$$\n    {{/if}}\n       {{else}}\n^^^content$$$\n{{/if}}', '{{#if thing}}\n    {{#if otherthing}}\n        ^^^content$$$\n    {{else}}\n        ^^^content$$$\n    {{/if}}\n{{else}}\n    ^^^content$$$\n{{/if}}'),
            _testCaseFactory(true, '<div{{somestyle}}></div>', '<div {{somestyle}}></div>'),
            _testCaseFactory(true, '<div{{#if test}}class="foo"{{/if}}>^^^content$$$</div>', '<div {{#if test}} class="foo" {{/if}}>^^^content$$$</div>'),
            _testCaseFactory(true, '<div{{#if thing}}{{somestyle}}class="{{class}}"{{else}}class="{{class2}}"{{/if}}>^^^content$$$</div>', '<div {{#if thing}} {{somestyle}} class="{{class}}" {{else}} class="{{class2}}" {{/if}}>^^^content$$$</div>'),
            _testCaseFactory(true, '<span{{#if condition}}class="foo"{{/if}}>^^^content$$$</span>', '<span {{#if condition}} class="foo" {{/if}}>^^^content$$$</span>'),
            _testCaseFactory(true, undefined, undefined, undefined, '<div unformatted="{{#if}}^^^content$$${{/if}}">^^^content$$$</div>'),
            _testCaseFactory(true, undefined, undefined, undefined, '<div unformatted="{{#if  }}    ^^^content$$${{/if}}">^^^content$$$</div>'),
            _testCaseFactory(true, undefined, undefined, undefined, '<div class="{{#if thingIs "value"}}^^^content$$${{/if}}"></div>'),
            _testCaseFactory(true, undefined, undefined, undefined, '<div class="{{#if thingIs \\"value\\"}}^^^content$$${{/if}}"></div>'),
            _testCaseFactory(true, undefined, undefined, undefined, '<div class=\'{{#if thingIs "value"}}^^^content$$${{/if}}\'></div>'),
            _testCaseFactory(true, undefined, undefined, undefined, '<div class=\'{{#if thingIs \\\'value\\\'}}^^^content$$${{/if}}\'></div>')
        ],
        "^^^ $$$"
    ));

    // Suite 9: Unformatted tags
    _collectionList.push(_createTestSuite(
        "Unprocessed Tags",
        "Unformatted tag behavior",
        undefined,
        [
            _testCaseFactory(true, undefined, undefined, undefined, '<ol>\n    <li>b<pre>c</pre></li>\n</ol>'),
            _testCaseFactory(true, undefined, undefined, undefined, '<ol>\n    <li>b<code>c</code></li>\n</ol>')
        ],
        undefined,
        []
    ));

    // Suite 10: New Test Suite
    _collectionList.push(_createTestSuite(
        "Novel Evaluation Suite",
        "",
        undefined, undefined, undefined, undefined
    ));

    _rootObject.suiteCollection = _collectionList;

    return _rootObject;
};

globalThis.generatedTestScenarioData = _generateDataSet();