// This module provides comprehensive data sets for testing the functionality
// of a code beautification or formatting utility.
// It covers various configuration options and their expected output for different
// HTML/Handlebars code snippets.

// Define constants for boolean values to ensure consistency and potential type conversion.
const BOOL_TRUE = true;
const BOOL_FALSE = false;

// Main export object containing all test configuration data.
module.exports.beautifierConfigData = {
    // Standard default settings for the formatter.
    standardFormatterSettings: [
        { settingKey: "indentation_size_value", settingVal: 4 }, // Renamed, changed string "4" to number 4
        { settingKey: "indentation_character", settingVal: " " }, // Renamed, changed "' '" to " "
        { settingKey: "maintain_newlines", settingVal: BOOL_TRUE }, // Renamed, changed "true" to BOOL_TRUE
        { settingKey: "jslint_compliance", settingVal: BOOL_FALSE }, // Renamed, changed "false" to BOOL_FALSE
        { settingKey: "keep_array_indentation", settingVal: BOOL_FALSE }, // Renamed property
        { settingKey: "brace_placement_style", settingVal: "collapse" }, // Renamed, changed "'collapse'" to "collapse"
        // List of tags that should always have extra newlines around them.
        { settingKey: "additional_line_tags", settingVal: ['html', 'head', '/html'] } // Renamed, changed string array to actual array
    ],

    // Collections of test scenarios. Each scenario group bundles related tests.
    scenarioCollections: [{
        scenarioName: "Trailing Newline Behavior",
        // The original description was empty, so it's removed for brevity.
        variantConfigs: [
            {
                variantOptions: [
                    { optionKey: "append_newline_at_end", optionValue: BOOL_TRUE } // Renamed, changed "true" to BOOL_TRUE
                ],
                endOfFileMarker: '\n' // Renamed eof, changed '\\n' to '\n'
            }, {
                variantOptions: [
                    { optionKey: "append_newline_at_end", optionValue: BOOL_FALSE } // Renamed, changed "false" to BOOL_FALSE
                ],
                endOfFileMarker: ''
            }
        ],
        verificationSteps: [
            { isFragment: BOOL_TRUE, sourceInput: '', expectedOutput: '###EOF###' }, // Renamed, changed {{eof}} to ###EOF###
            { isFragment: BOOL_TRUE, sourceInput: '<div></div>', expectedOutput: '<div></div>###EOF###' },
            // Original commented-out test removed: { fragment: true, input: '   \n\n<div></div>\n\n\n\n', output: '   <div></div>{{eof}}' },
            // Adding a slightly different simple test case.
            { isFragment: BOOL_TRUE, sourceInput: '  \n', expectedOutput: '###EOF###' },
            { isFragment: BOOL_TRUE, sourceInput: '\n', expectedOutput: '###EOF###' }
        ],
    }, {
        scenarioName: "Custom Extra Liners (empty set)",
        // description: "", // Removed empty description
        variantConfigs: [
            {
                variantOptions: [
                    { optionKey: "additional_line_tags", optionValue: [] } // Changed "[]" to actual empty array
                ]
            }
        ],
        verificationSteps: [
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<html><head><meta></head><body><div><p>x</p></div></body></html>',
                expectedOutput: '<html>\n<head>\n    <meta>\n</head>\n<body>\n    <div>\n        <p>x</p>\n    </div>\n</body>\n</html>'
            }
        ],
    }, {
        scenarioName: "Custom Extra Liners (default configuration)",
        scenarioDetails: "Tests behavior when extra_liners is explicitly set to null, reverting to default.", // Added a description
        variantConfigs: [
            {
                variantOptions: [
                    { optionKey: "additional_line_tags", optionValue: null } // Changed "null" to actual null
                ]
            }
        ],
        verificationSteps: [
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<html><head></head><body></body></html>',
                expectedOutput: '<html>\n\n<head></head>\n\n<body></body>\n\n</html>'
            }
        ],
    }, {
        scenarioName: "Custom Extra Liners (paragraph, string input)",
        // description: "", // Removed empty description
        variantConfigs: [
            {
                variantOptions: [
                    { optionKey: "additional_line_tags", optionValue: "p,/p" } // Kept as string for variety
                ]
            }
        ],
        verificationSteps: [
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<html><head><meta></head><body><div><p>x</p></div></body></html>',
                expectedOutput: '<html>\n<head>\n    <meta>\n</head>\n<body>\n    <div>\n\n        <p>x\n\n        </p>\n    </div>\n</body>\n</html>'
            }
        ],
    }, {
        scenarioName: "Custom Extra Liners (paragraph, array input)",
        // description: "", // Removed empty description
        variantConfigs: [
            {
                variantOptions: [
                    { optionKey: "additional_line_tags", optionValue: ['p', '/p'] } // Changed to actual array
                ]
            }
        ],
        verificationSteps: [
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<html><head><meta></head><body><div><p>x</p></div></body></html>',
                expectedOutput: '<html>\n<head>\n    <meta>\n</head>\n<body>\n    <div>\n\n        <p>x\n\n        </p>\n    </div>\n</body>\n</html>'
            }
        ],
    }, {
        scenarioName: "Attribute Wrapping Behavior",
        scenarioDetails: "Validates how HTML tag attributes are wrapped based on length and settings.", // Renamed description
        variantConfigs: (() => { // Using an IIFE to introduce local helper variables for option keys
            const wrapAttrKey = "attribute_wrapping_mode"; // Helper variable for option name
            const wrapLenKey = "line_length_for_wrapping"; // Helper variable for option name
            const indentAttrSizeKey = "attribute_indent_level"; // Helper variable for option name

            return [
                {
                    variantOptions: [
                        { optionKey: wrapAttrKey, optionValue: "force" } // Renamed, changed "'force'" to "force"
                    ],
                    endOfFileMarker: '\n', // Renamed, changed '\\n' to '\n'
                    attributeIndent: '    ', // Renamed indent_attr
                    overlongLineBreak: '\n' // Renamed over80
                }, {
                    variantOptions: [
                        { optionKey: wrapAttrKey, optionValue: "force" },
                        { optionKey: wrapLenKey, optionValue: 80 } // Changed "80" to number 80
                    ],
                    endOfFileMarker: '\n',
                    attributeIndent: '    ',
                    overlongLineBreak: '\n'
                }, {
                    variantOptions: [
                        { optionKey: wrapAttrKey, optionValue: "force" },
                        { optionKey: indentAttrSizeKey, optionValue: 8 }, // Changed "8" to number 8
                    ],
                    endOfFileMarker: '\n',
                    attributeIndent: '        ',
                    overlongLineBreak: '\n'
                }, {
                    variantOptions: [
                        { optionKey: wrapAttrKey, optionValue: "auto" },
                        { optionKey: wrapLenKey, optionValue: 80 }
                    ],
                    endOfFileMarker: ' ',
                    attributeIndent: '',
                    overlongLineBreak: '\n'
                }, {
                    variantOptions: [
                        { optionKey: wrapAttrKey, optionValue: "auto" },
                        { optionKey: wrapLenKey, optionValue: 0 }
                    ],
                    endOfFileMarker: ' ',
                    attributeIndent: '',
                    overlongLineBreak: ' '
                }
            ];
        })(),
        verificationSteps: [
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<div attr0 attr1="123" data-attr2="hello    t here">This is some text</div>',
                expectedOutput: '<div attr0###EOF######ATTR_INDENT###attr1="123"###EOF######ATTR_INDENT###data-attr2="hello    t here">This is some text</div>' // Renamed placeholders
            },
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<div lookatthissuperduperlongattributenamewhoahcrazy0="true" attr0 attr1="123" data-attr2="hello    t here" heymanimreallylongtoowhocomesupwiththesenames="false">This is some text</div>',
                expectedOutput: '<div lookatthissuperduperlongattributenamewhoahcrazy0="true"###EOF######ATTR_INDENT###attr0###EOF######ATTR_INDENT###attr1="123"###EOF######ATTR_INDENT###data-attr2="hello    t here"###OVER80######ATTR_INDENT###heymanimreallylongtoowhocomesupwiththesenames="false">This is some text</div>' // Renamed placeholders
            },
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<img attr0 attr1="123" data-attr2="hello    t here"/>',
                expectedOutput: '<img attr0###EOF######ATTR_INDENT###attr1="123"###EOF######ATTR_INDENT###data-attr2="hello    t here" />' // Renamed placeholders
            }
        ]
    }, {
        scenarioName: "Handlebars Indentation Disabled",
        scenarioDetails: "Examines Handlebars formatting when indentation is explicitly turned off.", // Renamed description
        patternString: "PRE_TEMPLATE_CONTENT_POST", // Renamed template
        // Moved options directly into group, removed matrix for simplicity.
        variantOptions: [
            { optionKey: "indent_handlebars_blocks", optionValue: BOOL_FALSE } // Renamed option key
        ],
        verificationSteps: [
            {
                isFragment: BOOL_TRUE,
                rawInput: // Renamed input_
                '{{#if 0}}\n' +
                '    <div>\n' +
                '    </div>\n' +
                '{{/if}}',
                expectedOutput:
                '{{#if 0}}\n' +
                '<div>\n' +
                '</div>\n' +
                '{{/if}}'
            },
            {
                isFragment: BOOL_TRUE,
                rawInput:
                '<div>\n' +
                '{{#each thing}}\n' +
                '    {{name}}\n' +
                '{{/each}}\n' +
                '</div>',
                expectedOutput:
                '<div>\n' +
                '    {{#each thing}} {{name}} {{/each}}\n' +
                '</div>'
            },
            // Adding a new test case for a different Handlebars block.
            {
                isFragment: BOOL_TRUE,
                rawInput: '{{#unless condition}}<span></span>{{/unless}}',
                expectedOutput: '{{#unless condition}}<span></span>{{/unless}}'
            }
        ]
    }, {
        scenarioName: "Handlebars Indentation Enabled",
        scenarioDetails: "Tests various Handlebars block and expression formatting when indentation is active.", // Renamed description
        patternString: "PRE_CONTENT___POST_CONTENT", // Renamed template
        variantConfigs: (() => { // Using IIFE for local variable to reuse common option
            const indentHbsOption = { optionKey: "indent_handlebars_blocks", optionValue: BOOL_TRUE }; // Helper object for common option

            return [
                { variantOptions: [indentHbsOption], contentPlaceholder: '{{field}}' }, // Renamed content
                { variantOptions: [indentHbsOption], contentPlaceholder: '{{! comment}}' },
                { variantOptions: [indentHbsOption], contentPlaceholder: '{pre{{field1}} {{field2}} {{field3}}post' },
                { variantOptions: [indentHbsOption], contentPlaceholder: '{{! \n mult-line\ncomment  \n     with spacing\n}}' }
            ];
        })(),
        verificationSteps: [
            // Changed 'unchanged' to explicit input/output for clarity, or removed some.
            { isFragment: BOOL_TRUE, sourceInput: '{{#if 0}}{{/if}}', expectedOutput: '{{#if 0}}{{/if}}' },
            { isFragment: BOOL_TRUE, sourceInput: '{{#if 0}}PRE_CONTENT___POST_CONTENT{{/if}}', expectedOutput: '{{#if 0}}PRE_CONTENT___POST_CONTENT{{/if}}' },
            { isFragment: BOOL_TRUE, sourceInput: '{{#if 0}}\n{{/if}}', expectedOutput: '{{#if 0}}\n{{/if}}' },
            {
                isFragment: BOOL_TRUE,
                rawInput: '{{#if     words}}{{/if}}',
                expectedOutput: '{{#if words}}{{/if}}'
            },
            {
                isFragment: BOOL_TRUE,
                rawInput: '{{#if     words}}PRE_CONTENT___POST_CONTENT{{/if}}',
                expectedOutput: '{{#if words}}PRE_CONTENT___POST_CONTENT{{/if}}'
            },
            // Removed redundant test case which was identical to the one above.
            {
                isFragment: BOOL_TRUE,
                sourceInput: // Original 'unchanged' test converted to explicit input/output
                '{{#if 1}}\n' +
                '    <div>\n' +
                '    </div>\n' +
                '{{/if}}',
                expectedOutput:
                '{{#if 1}}\n' +
                '    <div>\n' +
                '    </div>\n' +
                '{{/if}}'
            },
            {
                isFragment: BOOL_TRUE,
                rawInput:
                '{{#if 1}}\n' +
                '<div>\n' +
                '</div>\n' +
                '{{/if}}',
                expectedOutput:
                '{{#if 1}}\n' +
                '    <div>\n' +
                '    </div>\n' +
                '{{/if}}'
            },
            {
                isFragment: BOOL_TRUE,
                sourceInput: // Original 'unchanged' test converted to explicit input/output
                '<div>\n' +
                '    {{#if 1}}\n' +
                '    {{/if}}\n' +
                '</div>',
                expectedOutput:
                '<div>\n' +
                '    {{#if 1}}\n' +
                '    {{/if}}\n' +
                '</div>'
            },
            {
                isFragment: BOOL_TRUE,
                rawInput:
                '<div>\n' +
                '{{#if 1}}\n' +
                '{{/if}}\n' +
                '</div>',
                expectedOutput:
                '<div>\n' +
                '    {{#if 1}}\n' +
                '    {{/if}}\n' +
                '</div>'
            },
            {
                isFragment: BOOL_TRUE,
                rawInput:
                '{{#if}}\n' +
                '{{#each}}\n' +
                '{{#if}}\n' +
                'PRE_CONTENT___POST_CONTENT\n' +
                '{{/if}}\n' +
                '{{#if}}\n' +
                'PRE_CONTENT___POST_CONTENT\n' +
                '{{/if}}\n' +
                '{{/each}}\n' +
                '{{/if}}',
                expectedOutput:
                '{{#if}}\n' +
                '    {{#each}}\n' +
                '        {{#if}}\n' +
                '            PRE_CONTENT___POST_CONTENT\n' +
                '        {{/if}}\n' +
                '        {{#if}}\n' +
                '            PRE_CONTENT___POST_CONTENT\n' +
                '        {{/if}}\n' +
                '    {{/each}}\n' +
                '{{/if}}'
            },
            // Removed redundant 'unchanged' test.

            // Test {{else}} aligned with {{#if}} and {{/if}}
            {
                isFragment: BOOL_TRUE,
                rawInput:
                '{{#if 1}}\n' +
                '    PRE_CONTENT___POST_CONTENT\n' +
                '    {{else}}\n' +
                '    PRE_CONTENT___POST_CONTENT\n' +
                '{{/if}}',
                expectedOutput:
                '{{#if 1}}\n' +
                '    PRE_CONTENT___POST_CONTENT\n' +
                '{{else}}\n' +
                '    PRE_CONTENT___POST_CONTENT\n' +
                '{{/if}}'
            },
            {
                isFragment: BOOL_TRUE,
                rawInput:
                '{{#if 1}}\n' +
                '    {{else}}\n' +
                '    {{/if}}',
                expectedOutput:
                '{{#if 1}}\n' +
                '{{else}}\n' +
                '{{/if}}'
            },
            {
                isFragment: BOOL_TRUE,
                rawInput:
                '{{#if thing}}\n' +
                '{{#if otherthing}}\n' +
                '    PRE_CONTENT___POST_CONTENT\n' +
                '    {{else}}\n' +
                'PRE_CONTENT___POST_CONTENT\n' +
                '    {{/if}}\n' +
                '       {{else}}\n'+
                'PRE_CONTENT___POST_CONTENT\n' +
                '{{/if}}',
                expectedOutput:
                '{{#if thing}}\n' +
                '    {{#if otherthing}}\n' +
                '        PRE_CONTENT___POST_CONTENT\n' +
                '    {{else}}\n' +
                '        PRE_CONTENT___POST_CONTENT\n' +
                '    {{/if}}\n' +
                '{{else}}\n'+
                '    PRE_CONTENT___POST_CONTENT\n' +
                '{{/if}}'
            },
            // Test {{}} inside of <> tags, which should be separated by spaces
            // for readability, unless they are inside a string.
            {
                isFragment: BOOL_TRUE,
                rawInput: '<div{{somestyle}}></div>',
                expectedOutput: '<div {{somestyle}}></div>'
            },
            {
                isFragment: BOOL_TRUE,
                rawInput: '<div{{#if test}}class="foo"{{/if}}>PRE_CONTENT___POST_CONTENT</div>',
                expectedOutput: '<div {{#if test}} class="foo" {{/if}}>PRE_CONTENT___POST_CONTENT</div>'
            },
            {
                isFragment: BOOL_TRUE,
                rawInput: '<div{{#if thing}}{{somestyle}}class="{{class}}"{{else}}class="{{class2}}"{{/if}}>PRE_CONTENT___POST_CONTENT</div>',
                expectedOutput: '<div {{#if thing}} {{somestyle}} class="{{class}}" {{else}} class="{{class2}}" {{/if}}>PRE_CONTENT___POST_CONTENT</div>'
            },
            {
                isFragment: BOOL_TRUE,
                rawInput: '<span{{#if condition}}class="foo"{{/if}}>PRE_CONTENT___POST_CONTENT</span>',
                expectedOutput: '<span {{#if condition}} class="foo" {{/if}}>PRE_CONTENT___POST_CONTENT</span>'
            },
            // Converted 'unchanged' to explicit input/output where input == output.
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<div unformatted="{{#if}}PRE_CONTENT___POST_CONTENT{{/if}}">PRE_CONTENT___POST_CONTENT</div>',
                expectedOutput: '<div unformatted="{{#if}}PRE_CONTENT___POST_CONTENT{{/if}}">PRE_CONTENT___POST_CONTENT</div>'
            },
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<div unformatted="{{#if  }}    PRE_CONTENT___POST_CONTENT{{/if}}">PRE_CONTENT___POST_CONTENT</div>',
                expectedOutput: '<div unformatted="{{#if  }}    PRE_CONTENT___POST_CONTENT{{/if}}">PRE_CONTENT___POST_CONTENT</div>'
            },

            // Quotes found inside of Handlebars expressions inside of quoted
            // strings themselves should not be considered string delimiters.
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<div class="{{#if thingIs "value"}}PRE_CONTENT___POST_CONTENT{{/if}}"></div>',
                expectedOutput: '<div class="{{#if thingIs "value"}}PRE_CONTENT___POST_CONTENT{{/if}}"></div>'
            },
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<div class="{{#if thingIs \'value\'}}PRE_CONTENT___POST_CONTENT{{/if}}"></div>',
                expectedOutput: '<div class="{{#if thingIs \'value\'}}PRE_CONTENT___POST_CONTENT{{/if}}"></div>'
            },
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<div class=\'{{#if thingIs "value"}}PRE_CONTENT___POST_CONTENT{{/if}}\'></div>',
                expectedOutput: '<div class=\'{{#if thingIs "value"}}PRE_CONTENT___POST_CONTENT{{/if}}\'></div>'
            },
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<div class=\'{{#if thingIs \\\'value\\\'}}PRE_CONTENT___POST_CONTENT{{/if}}\'></div>',
                expectedOutput: '<div class=\'{{#if thingIs \\\'value\\\'}}PRE_CONTENT___POST_CONTENT{{/if}}\'></div>'
            }
        ],
    }, {
        scenarioName: "Unformatted Tags",
        scenarioDetails: "Behavior of tags that should not be formatted internally (e.g., <pre>, <code>).", // Renamed description
        variantOptions: [], // Renamed options
        verificationSteps: [
            { isFragment: BOOL_TRUE, sourceInput: '<ol>\n    <li>b<pre>c</pre></li>\n</ol>', expectedOutput: '<ol>\n    <li>b<pre>c</pre></li>\n</ol>' }, // Changed to explicit input/output
            { isFragment: BOOL_TRUE, sourceInput: '<ol>\n    <li>b<code>c</code></li>\n</ol>', expectedOutput: '<ol>\n    <li>b<code>c</code></li>\n</ol>' }, // Changed to explicit input/output
            // Adding a new test for a different unformatted tag
            { isFragment: BOOL_TRUE, sourceInput: '<span><textarea>  some\n  text  </textarea></span>', expectedOutput: '<span><textarea>  some\n  text  </textarea></span>' }
        ]
    }, {
        scenarioName: "Minimal Group Entry", // New group with minimal properties
        // No description, no matrix, no tests for this minimal group.
    }, {
        scenarioName: "Another Scenario",
        scenarioDetails: "A placeholder for future test cases, demonstrating a new feature option.",
        variantConfigs: [
            {
                variantOptions: [
                    { optionKey: "some_new_feature", optionValue: "enabled" }
                ]
            }
        ],
        verificationSteps: [
            {
                isFragment: BOOL_TRUE,
                sourceInput: '<div><!-- a comment --></div>',
                expectedOutput: '<div>\n    <!-- a comment -->\n</div>'
            }
        ]
    }],
};