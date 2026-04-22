// This module provides a comprehensive suite of configuration and test data for a code formatter.
moduleExports.verificationSet = {
    // Default configuration parameters for the beautifier
    presetConfigs: [
        { label: "tabWidth",          setting: 4 }, // Number of spaces for indentation
        { label: "tabChar",           setting: ' ' }, // Character used for indentation
        { label: "keepLineBreaks",    setting: true }, // Preserve existing newline characters
        { label: "jsLintCompliant",   setting: false }, // Adhere to JSLint style guidelines
        { label: "retainArrayIndents", setting: false }, // Keep original array indentation
        { label: "bracketPlacement",  setting: 'collapse' }, // Style for brace placement
        { label: "additionalBreaks",  setting: ['html', 'head', '/html'] } // Elements that should have extra line breaks
    ],
    // Collections of test scenarios, grouped by feature
    categoryCollections: [{
        label: "TerminateWithNewline", // Group name for newline ending tests
        details: "", // No specific description for this group
        scenarioMatrix: [
            {
                configParams: [
                    { label: "appendNewline", setting: true }
                ],
                endOfFileMarker: '\\n' // Expected EOF marker when newline is appended
            },
            {
                configParams: [
                    { label: "appendNewline", setting: false }
                ],
                endOfFileMarker: '' // Expected EOF marker when no newline is appended
            }
        ],
        // Individual test cases for this category
        testCases: [
            { isFragment: true, sourceCode: '',         expectedOutput: '{{endOfFileMarker}}' },
            { isFragment: true, sourceCode: '<div></div>', expectedOutput: '<div></div>{{endOfFileMarker}}' },
            // The following test case was commented out in the original source, so it remains commented.
            // { isFragment: true, sourceCode: '   \n\n<div></div>\n\n\n\n', expectedOutput: '   <div></div>{{endOfFileMarker}}' },
            { isFragment: true, sourceCode: '\n',       expectedOutput: '{{endOfFileMarker}}' }
        ]
    }, {
        label: "CustomLineBreaksEmpty", // Test for empty custom extra liners
        details: "",
        scenarioMatrix: [
            {
                configParams: [
                    { label: "additionalBreaks", setting: [] } // Empty array for extra liners
                ]
            }
        ],
        testCases: [
            {
                isFragment: true,
                sourceCode: '<html><head><meta></head><body><div><p>x</p></div></body></html>',
                expectedOutput: '<html>\n<head>\n    <meta>\n</head>\n<body>\n    <div>\n        <p>x</p>\n    </div>\n</body>\n</html>'
            }
        ]
    }, {
        label: "CustomLineBreaksDefault", // Test for default (null) custom extra liners
        details: "",
        scenarioMatrix: [
            {
                configParams: [
                    { label: "additionalBreaks", setting: null } // Null for default extra liners
                ]
            }
        ],
        testCases: [
            {
                isFragment: true,
                sourceCode: '<html><head></head><body></body></html>',
                expectedOutput: '<html>\n\n<head></head>\n\n<body></body>\n\n</html>'
            }
        ]
    }, {
        label: "CustomLineBreaksPString", // Test for 'p' tag as string in custom extra liners
        details: "",
        scenarioMatrix: [
            {
                configParams: [
                    { label: "additionalBreaks", setting: 'p,/p' } // String format for extra liners
                ]
            }
        ],
        testCases: [
            {
                isFragment: true,
                sourceCode: '<html><head><meta></head><body><div><p>x</p></div></body></html>',
                expectedOutput: '<html>\n<head>\n    <meta>\n</head>\n<body>\n    <div>\n\n        <p>x\n\n        </p>\n    </div>\n</body>\n</html>'
            }
        ]
    }, {
        label: "CustomLineBreaksPArray", // Test for 'p' tag as array in custom extra liners
        details: "",
        scenarioMatrix: [
            {
                configParams: [
                    { label: "additionalBreaks", setting: ['p', '/p'] } // Array format for extra liners
                ]
            }
        ],
        testCases: [
            {
                isFragment: true,
                sourceCode: '<html><head><meta></head><body><div><p>x</p></div></body></html>',
                expectedOutput: '<html>\n<head>\n    <meta>\n</head>\n<body>\n    <div>\n\n        <p>x\n\n        </p>\n    </div>\n</body>\n</html>'
            }
        ]
    }, {
        label: "AttributeWrapping", // Tests related to wrapping HTML attributes
        details: "Determines how attributes within HTML tags are wrapped",
        scenarioMatrix: [
          {
              configParams: [
                  { label: "attributeWrappingMethod", setting: 'force' }
              ],
              endOfFileMarker: '\\n',
              attributeIndentString: '    ',
              overEightyChars: '\\n'
          }, {
              configParams: [
                  { label: "attributeWrappingMethod", setting: 'force' },
                  { label: "wrapLineLimit", setting: 80 }
              ],
              endOfFileMarker: '\\n',
              attributeIndentString: '    ',
              overEightyChars: '\\n'
          }, {
              configParams: [
                  { label: "attributeWrappingMethod", setting: 'force' },
                  { label: "attributeWrapIndentWidth", setting: 8 }
              ],
              endOfFileMarker: '\\n',
              attributeIndentString: '        ',
              overEightyChars: '\\n'
          }, {
              configParams: [
                  { label: "attributeWrappingMethod", setting: 'auto' },
                  { label: "wrapLineLimit", setting: 80 }
              ],
              endOfFileMarker: ' ',
              attributeIndentString: '',
              overEightyChars: '\\n'
          }, {
              configParams: [
                  { label: "attributeWrappingMethod", setting: 'auto' },
                  { label: "wrapLineLimit", setting: 0 }
              ],
              endOfFileMarker: ' ',
              attributeIndentString: '',
              overEightyChars: ' '
          }
        ],
        testCases: [
            {
                isFragment: true,
                sourceCode: '<div attr0 attr1="123" data-attr2="hello    t here">This is some text</div>',
                expectedOutput: '<div attr0{{endOfFileMarker}}{{attributeIndentString}}attr1="123"{{endOfFileMarker}}{{attributeIndentString}}data-attr2="hello    t here">This is some text</div>'
            },
            {
                isFragment: true,
                sourceCode: '<div lookatthissuperduperlongattributenamewhoahcrazy0="true" attr0 attr1="123" data-attr2="hello    t here" heymanimreallylongtoowhocomesupwiththesenames="false">This is some text</div>',
                expectedOutput: '<div lookatthissuperduperlongattributenamewhoahcrazy0="true"{{endOfFileMarker}}{{attributeIndentString}}attr0{{endOfFileMarker}}{{attributeIndentString}}attr1="123"{{endOfFileMarker}}{{attributeIndentString}}data-attr2="hello    t here"{{overEightyChars}}{{attributeIndentString}}heymanimreallylongtoowhocomesupwiththesenames="false">This is some text</div>'
            },
            {
                isFragment: true,
                sourceCode: '<img attr0 attr1="123" data-attr2="hello    t here"/>',
                expectedOutput: '<img attr0{{endOfFileMarker}}{{attributeIndentString}}attr1="123"{{endOfFileMarker}}{{attributeIndentString}}data-attr2="hello    t here" />'
            }
        ]
    }, {
        label: "HandlebarsFormattingDisabled", // Group for testing Handlebars without indentation
        details: "Verify handlebar behavior when indentation is turned off",
        templatePlaceholder: "^^^ $$$",
        configParams: [
            { label: "formatHandlebars", setting: false }
        ],
        testCases: [
            { isFragment: true,
                sourceText:
                '{{#if 0}}\n' +
                '    <div>\n' +
                '    </div>\n' +
                '{{/if}}',
                expectedOutput:
                '{{#if 0}}\n' +
                '<div>\n' +
                '</div>\n' +
                '{{/if}}' },
            { isFragment: true,
                sourceText:
                '<div>\n' +
                '{{#each item}}\n' +
                '    {{label}}\n' +
                '{{/each}}\n' +
                '</div>',
                expectedOutput:
                '<div>\n' +
                '    {{#each item}} {{label}} {{/each}}\n' +
                '</div>'}
        ]
    }, {
        label: "HandlebarsFormattingEnabled", // Group for testing Handlebars with indentation
        details: "Validate proper formatting of Handlebars expressions",
        templatePlaceholder: "^^^ $$$",
        scenarioMatrix: [
            {
                configParams: [
                    { label: "formatHandlebars", setting: true }
                ],
                contentBlock: '{{field}}'
            }, {
                configParams: [
                    { label: "formatHandlebars", setting: true }
                ],
                contentBlock: '{{! comment}}'
            }, {
                configParams: [
                    { label: "formatHandlebars", setting: true }
                ],
                contentBlock: '{pre{{field1}} {{field2}} {{field3}}post'
            }
            , {
                configParams: [
                    { label: "formatHandlebars", setting: true }
                ],
                contentBlock: '{{! \\n mult-line\\ncomment  \\n     with spacing\\n}}'
            }
        ],
        testCases: [
            { isFragment: true, expectedSame: '{{#if 0}}{{/if}}' },
            { isFragment: true, expectedSame: '{{#if 0}}^^^contentBlock$$${{/if}}' },
            { isFragment: true, expectedSame: '{{#if 0}}\n{{/if}}' },
            { isFragment: true,
                sourceText: '{{#if     words}}{{/if}}',
                expectedOutput: '{{#if words}}{{/if}}' },
            { isFragment: true,
                sourceText: '{{#if     words}}^^^contentBlock$$${{/if}}',
                expectedOutput: '{{#if words}}^^^contentBlock$$${{/if}}' },
            { isFragment: true,
                sourceText: '{{#if     words}}^^^contentBlock$$${{/if}}',
                expectedOutput: '{{#if words}}^^^contentBlock$$${{/if}}' },
            { isFragment: true,
                expectedSame:
                '{{#if 1}}\n' +
                '    <div>\n' +
                '    </div>\n' +
                '{{/if}}' },
            { isFragment: true,
                sourceText:
                '{{#if 1}}\n' +
                '<div>\n' +
                '</div>\n' +
                '{{/if}}',
                expectedOutput:
                '{{#if 1}}\n' +
                '    <div>\n' +
                '    </div>\n' +
                '{{/if}}' },
            { isFragment: true,
                expectedSame:
                '<div>\n' +
                '    {{#if 1}}\n' +
                '    {{/if}}\n' +
                '</div>' },
            { isFragment: true,
                sourceText:
                '<div>\n' +
                '{{#if 1}}\n' +
                '{{/if}}\n' +
                '</div>',
                expectedOutput:
                '<div>\n' +
                '    {{#if 1}}\n' +
                '    {{/if}}\n' +
                '</div>' },
            { isFragment: true,
                sourceText:
                '{{#if}}\n' +
                '{{#each}}\n' +
                '{{#if}}\n' +
                '^^^contentBlock$$$\n' +
                '{{/if}}\n' +
                '{{#if}}\n' +
                '^^^contentBlock$$$\n' +
                '{{/if}}\n' +
                '{{/each}}\n' +
                '{{/if}}',
                expectedOutput:
                '{{#if}}\n' +
                '    {{#each}}\n' +
                '        {{#if}}\n' +
                '            ^^^contentBlock$$$\n' +
                '        {{/if}}\n' +
                '        {{#if}}\n' +
                '            ^^^contentBlock$$$\n' +
                '        {{/if}}\n' +
                '    {{/each}}\n' +
                '{{/if}}' },
            { isFragment: true, expectedSame: '{{#if 1}}\n' +
                '    <div>\n' +
                '    </div>\n' +
                '{{/if}}' },

            // Test {{else}} aligned with {{#if}} and {{/if}}
            { isFragment: true,
                sourceText:
                '{{#if 1}}\n' +
                '    ^^^contentBlock$$$\n' +
                '    {{else}}\n' +
                '    ^^^contentBlock$$$\n' +
                '{{/if}}',
                expectedOutput:
                '{{#if 1}}\n' +
                '    ^^^contentBlock$$$\n' +
                '{{else}}\n' +
                '    ^^^contentBlock$$$\n' +
                '{{/if}}' },
            { isFragment: true,
                sourceText:
                '{{#if 1}}\n' +
                '    {{else}}\n' +
                '    {{/if}}',
                expectedOutput:
                '{{#if 1}}\n' +
                '{{else}}\n' +
                '{{/if}}' },
            { isFragment: true,
                sourceText:
                '{{#if item}}\n' +
                '{{#if anotherItem}}\n' +
                '    ^^^contentBlock$$$\n' +
                '    {{else}}\n' +
                '^^^contentBlock$$$\n' +
                '    {{/if}}\n' +
                '       {{else}}\n'+
                '^^^contentBlock$$$\n' +
                '{{/if}}',
                expectedOutput:
                '{{#if item}}\n' +
                '    {{#if anotherItem}}\n' +
                '        ^^^contentBlock$$$\n' +
                '    {{else}}\n' +
                '        ^^^contentBlock$$$\n' +
                '    {{/if}}\n' +
                '{{else}}\n'+
                '    ^^^contentBlock$$$\n' +
                '{{/if}}' },
                // Test {{}} inside of <> tags, which should be separated by spaces
                // for readability, unless they are inside a string.
            { isFragment: true,
                sourceText: '<div{{someStyle}}></div>',
                expectedOutput: '<div {{someStyle}}></div>' },
            { isFragment: true,
                sourceText: '<div{{#if testCondition}}class="foo"{{/if}}>^^^contentBlock$$$</div>',
                expectedOutput: '<div {{#if testCondition}} class="foo" {{/if}}>^^^contentBlock$$$</div>' },
            { isFragment: true,
                sourceText: '<div{{#if item}}{{someStyle}}class="{{cssClass}}"{{else}}class="{{cssClassAlt}}"{{/if}}>^^^contentBlock$$$</div>',
                expectedOutput: '<div {{#if item}} {{someStyle}} class="{{cssClass}}" {{else}} class="{{cssClassAlt}}" {{/if}}>^^^contentBlock$$$</div>' },
            { isFragment: true,
                sourceText: '<span{{#if testCondition}}class="foo"{{/if}}>^^^contentBlock$$$</span>',
                expectedOutput: '<span {{#if testCondition}} class="foo" {{/if}}>^^^contentBlock$$$</span>' },
            { isFragment: true,
                expectedSame: '<div unformatted="{{#if}}^^^contentBlock$$${{/if}}">^^^contentBlock$$$</div>' },
            { isFragment: true,
                expectedSame: '<div unformatted="{{#if  }}    ^^^contentBlock$$${{/if}}">^^^contentBlock$$$</div>' },

            // Quotes found inside of Handlebars expressions inside of quoted
            // strings themselves should not be considered string delimiters.
            { isFragment: true,
                expectedSame: '<div class="{{#if itemIs \'value\'}}^^^contentBlock$$${{/if}}"></div>' },
            { isFragment: true,
                expectedSame: '<div class="{{#if itemIs \\\'value\\\'}}^^^contentBlock$$${{/if}}"></div>' },
            { isFragment: true,
                expectedSame: '<div class=\'{{#if itemIs "value"}}^^^contentBlock$$${{/if}}\'></div>' },
            { isFragment: true,
                expectedSame: '<div class=\'{{#if itemIs \\\'value\\\'}}^^^contentBlock$$${{/if}}\'></div>' }
        ]
    }, {
        label: "UnformattedTagHandling", // Test cases for tags that should not be formatted internally
        details: "Behavior concerning tags marked as unformatted",
        configParams: [], // No specific options for this group
        testCases: [
            { isFragment: true, sourceCode: '<ol>\n    <li>b<pre>c</pre></li>\n</ol>' },
            { isFragment: true, sourceCode: '<ol>\n    <li>b<code>c</code></li>\n</ol>' }
        ]
    }, {
        label: "NewVerificationSuite" // A placeholder for a new set of tests
    }]
};