(function (moduleContext) {

    const allRegisteredTests = [];

    const testAssertionMethods = {
        same: function (expected, actual, message = '') {
            if (expected !== actual) {
                if (Array.isArray(expected) && Array.isArray(actual)) {
                    if (expected.length !== actual.length) {
                        throw new Error(`Assertion Failed: ${message} Expected array length ${expected.length}, got ${actual.length}.`);
                    }
                    for (let i = 0; i < expected.length; i++) {
                        if (expected[i] !== actual[i]) {
                            throw new Error(`Assertion Failed: ${message} Arrays differ at index ${i}. Expected: ${expected}, Actual: ${actual}`);
                        }
                    }
                    return;
                }
                throw new Error(`Assertion Failed: ${message} Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
            }
        },
        different: function (val1, val2, message = '') {
            if (val1 === val2) {
                if (Array.isArray(val1) && Array.isArray(val2)) {
                     if (val1.length === val2.length) {
                        let allSame = true;
                        for (let i = 0; i < val1.length; i++) {
                            if (val1[i] !== val2[i]) {
                                allSame = false;
                                break;
                            }
                        }
                        if (allSame) {
                             throw new Error(`Assertion Failed: ${message} Both arrays are identical: ${JSON.stringify(val1)}`);
                        }
                     }
                } else {
                    throw new Error(`Assertion Failed: ${message} Both values are identical: ${JSON.stringify(val1)}`);
                }
            }
        }
    };

    moduleContext.verify = testAssertionMethods;

    moduleContext.registerTestGroup = function (groupDescription, testProcedures) {
        allRegisteredTests.push({ description: groupDescription, procedures: testProcedures });
    };

    moduleContext.runAllPresentTests = function () {
        let totalTests = 0;
        let failedTests = 0;

        allRegisteredTests.forEach(group => {
            for (const procedureName in group.procedures) {
                if (typeof group.procedures[procedureName] === 'function') {
                    totalTests++;
                    try {
                        group.procedures[procedureName]();
                    } catch (error) {
                        failedTests++;
                    }
                }
            }
        });
    };

    function LayoutBlock() {}

    LayoutBlock.prototype.renderHtml = function () {
        return '<div class="yui3-g ">\n<div class="yui3-u ">\n</div>\n</div>\n';
    };

    moduleContext.LayoutBlock = LayoutBlock;

    function DisplayElement(config = {}) {
        this.internalData = {
            styleClass: config.styleClass || '',
            contentItems: []
        };
        if (config.contentItems) {
            this.updateProperty('contentItems', config.contentItems);
        }
    }

    DisplayElement.prototype.fetchProperty = function (key) {
        return this.internalData[key];
    };

    DisplayElement.prototype.updateProperty = function (key, value) {
        switch (key) {
            case 'contentItems':
                if (!Array.isArray(value)) {
                    this.internalData.contentItems = [];
                    break;
                }
                this.internalData.contentItems = value.filter(item =>
                    typeof item === 'string' || item instanceof moduleContext.LayoutBlock
                );
                break;
            case 'styleClass':
                this.internalData.styleClass = String(value);
                break;
            default:
                this.internalData[key] = value;
        }
    };

    DisplayElement.prototype.renderHtml = function () {
        const classes = `yui3-u ${this.internalData.styleClass}`.trim();
        const innerContent = this.internalData.contentItems
            .map(item => {
                if (typeof item === 'string') {
                    return item;
                } else if (item instanceof moduleContext.LayoutBlock) {
                    return item.renderHtml();
                }
                return '';
            })
            .join('\n');

        return `<div class="${classes}">\n${innerContent}\n</div>\n`;
    };

    moduleContext.DisplayElement = DisplayElement;

    moduleContext.registerTestGroup('Reviewing Rendered HTML Output', {

        'No assigned styleClass yields an empty yui3-u div': function () {
            const componentInstance = new moduleContext.DisplayElement();
            const expectedMarkup = '<div class="yui3-u ">\n</div>\n';
            moduleContext.verify.same(expectedMarkup, componentInstance.renderHtml());
        },

        'A defined styleClass should append to yui3-u': function () {
            const componentInstance = new moduleContext.DisplayElement({ styleClass: 'left' });
            const expectedMarkup = '<div class="yui3-u left">\n</div>\n';
            moduleContext.verify.same(expectedMarkup, componentInstance.renderHtml());
        },

        'Textual content should be directly embedded inside the component': function () {
            const componentInstance = new moduleContext.DisplayElement();
            const expectedMarkup = '<div class="yui3-u ">\nHELLOSKI\n</div>\n';
            componentInstance.updateProperty('contentItems', ['HELLOSKI']);
            moduleContext.verify.same(expectedMarkup, componentInstance.renderHtml());
        },

        'Grid elements should be nestable inside a display component': function () {
            const componentInstance = new moduleContext.DisplayElement();
            const expectedMarkup = '<div class="yui3-u ">\n'
                                 + '<div class="yui3-g ">\n<div class="yui3-u ">\n</div>\n</div>\n'
                                 + '</div>\n';
            componentInstance.updateProperty('contentItems', [new moduleContext.LayoutBlock()]);
            moduleContext.verify.same(expectedMarkup, componentInstance.renderHtml());
        },

        'Combined grid and text content should appear sequentially': function () {
            const componentInstance = new moduleContext.DisplayElement();
            const expectedMarkup = '<div class="yui3-u ">\n'
                                 + '<div class="yui3-g ">\n<div class="yui3-u ">\n</div>\n</div>\n'
                                 + 'HELLOSKI\n'
                                 + '<div class="yui3-g ">\n<div class="yui3-u ">\n</div>\n</div>\n'
                                 + '</div>\n';

            componentInstance.updateProperty('contentItems', [new moduleContext.LayoutBlock(), 'HELLOSKI', new moduleContext.LayoutBlock()]);
            moduleContext.verify.same(expectedMarkup, componentInstance.renderHtml());
        }
    });

    moduleContext.registerTestGroup('Verifying Content Assignment for DisplayElement', {

        'Content property should not accept non-array values': function () {
            const componentInstance = new moduleContext.DisplayElement({ contentItems: 'foo' });
            moduleContext.verify.different('foo', componentInstance.fetchProperty('contentItems'));
            moduleContext.verify.same([], componentInstance.fetchProperty('contentItems'));
        },

        'Content property should store an array of strings and LayoutBlock objects': function () {
            const componentInstance = new moduleContext.DisplayElement();
            const testItemArray = ['a', new moduleContext.LayoutBlock(), 'c'];
            componentInstance.updateProperty('contentItems', testItemArray);
            moduleContext.verify.same(testItemArray, componentInstance.fetchProperty('contentItems'));
        },

        'Content array should exclude invalid objects': function () {
            const componentInstance = new moduleContext.DisplayElement();
            const mixedItemArray = ['a', new Date(), 'c'];
            componentInstance.updateProperty('contentItems', mixedItemArray);
            moduleContext.verify.different('foo', componentInstance.fetchProperty('contentItems'));
            moduleContext.verify.same(['a', 'c'], componentInstance.fetchProperty('contentItems'));
        }
    });

    moduleContext.runAllPresentTests();

})({});