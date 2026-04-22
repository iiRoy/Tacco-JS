(function(jq) {
    function cleanHtmlForComparison(markupText) {
        let processedMarkup = markupText;
        processedMarkup = processedMarkup.split(' style="display:none;"').join('');
        processedMarkup = processedMarkup.split(' style="display:block;"').join('');
        processedMarkup = processedMarkup.split(' style="display: none;"').join('');
        processedMarkup = processedMarkup.split(' style="display: block;"').join('');
        return processedMarkup;
    }

    QUnit.module("Responsive Navigation Component", function(hooks) {
        let primaryTestElement;
        let auxiliaryContainer;
        let baseComponentOptions;
        let currentTestComponentInstance;

        const testMarkupRepository = {
            "oneLevelMenu.html": '<ul id="primary-menu"><li class="menu-item"><a href="#one">One</a></li><li class="menu-item"><a href="#two">Two</a></li><li class="menu-item"><a href="#three">Three</a></li><li class="menu-item"><a href="#four">Four</a></li></ul>',
            "oneLevelMenuWithCurrent.html": '<ul id="primary-menu-current"><li class="menu-item"><a href="#one">One</a></li><li class="menu-item current-menu-item"><a href="#two">Two</a></li><li class="menu-item"><a href="#three">Three</a></li><li class="menu-item"><a href="#four">Four</a></li></ul>',
            "multiLevelMenu.html": '<ul id="secondary-menu"><li class="menu-item"><a href="#one">One</a></li><li class="menu-item"><a href="#two">Two</a><ul class="sub-menu"><li class="menu-item"><a href="#sub-one">Sub-one</a><ul class="sub-menu"><li class="menu-item"><a href="#sub-sub-one">Sub-Sub-one</a></li><li class="menu-item"><a href="#sub-sub-two">Sub-Sub-two</a></li></ul></li><li class="menu-item"><a href="#sub-two">Sub-two</a></li></ul></li><li class="menu-item"><a href="#three">Three</a></li><li class="menu-item"><a href="#four">Four</a></li></ul>',
            "multiLevelMenuWithCurrent.html": '<ul id="secondary-menu-current"><li class="menu-item"><a href="#one">One</a></li><li class="menu-item"><a href="#two">Two</a><ul class="sub-menu"><li class="menu-item"><a href="#sub-one">Sub-one</a><ul class="sub-menu"><li class="menu-item"><a href="#sub-sub-one">Sub-Sub-one</a></li><li class="menu-item current-menu-item"><a href="#sub-sub-two">Sub-Sub-two</a></li></ul></li><li class="menu-item"><a href="#sub-two">Sub-two</a></li></ul></li><li class="menu-item"><a href="#three">Three</a></li><li class="menu-item"><a href="#four">Four</a></li></ul>'
        };

        function injectTestMarkup(fileName) {
            jq('body').append(testMarkupRepository[fileName]);
        }

        function removeTestMarkup() {
            jq('#primary-menu, #primary-menu-current, #secondary-menu, #secondary-menu-current').remove();
        }

        hooks.beforeEach(function() {
            injectTestMarkup("oneLevelMenu.html");
            primaryTestElement = jq("#primary-menu");
            auxiliaryContainer = jq('<div id="auxiliary-test-area"></div>');
            auxiliaryContainer.appendTo("body");
            baseComponentOptions = {
                switchWidth: 555,
                appendTo: "#auxiliary-test-area"
            };
        });

        hooks.afterEach(function() {
            auxiliaryContainer.remove();
            removeTestMarkup();
            if (currentTestComponentInstance && currentTestComponentInstance.onResize && currentTestComponentInstance.onResize.originalMethod) {
                currentTestComponentInstance.onResize = currentTestComponentInstance.onResize.originalMethod;
            }
            currentTestComponentInstance = null;
        });

        QUnit.module("Component configuration checks", function() {
            QUnit.test("should be accessible via jQuery object", function(assert) {
                assert.ok(jq.fn.responsiveMenu, "Plugin function is defined");
            });

            QUnit.test("should support method chaining", function(assert) {
                const initialElement = primaryTestElement;
                const resultElement = initialElement.responsiveMenu();
                assert.strictEqual(resultElement[0], initialElement[0], "Returns the original jQuery object");
            });

            QUnit.test("should provide default settings", function(assert) {
                const componentInstance = primaryTestElement.responsiveMenu().data("responsiveMenu");
                assert.ok(componentInstance.defaults, "Defaults object is defined on instance");
            });

            QUnit.test("should override default settings with provided options", function(assert) {
                const customSettings = {
                    switchWidth: 600,
                    currentClass: "selected-item",
                    appendTo: "#another-place",
                    visualTab: ">>",
                    manualMediaQueries: true,
                    label: "Select Menu"
                };
                const componentInstance = primaryTestElement.responsiveMenu(customSettings).data("responsiveMenu");
                assert.strictEqual(componentInstance.options.switchWidth, customSettings.switchWidth, "switchWidth is overridden");
                assert.strictEqual(componentInstance.options.currentClass, customSettings.currentClass, "currentClass is overridden");
                assert.strictEqual(componentInstance.options.appendTo, customSettings.appendTo, "appendTo is overridden");
                assert.strictEqual(componentInstance.options.visualTab, customSettings.visualTab, "visualTab is overridden");
                assert.strictEqual(componentInstance.options.manualMediaQueries, customSettings.manualMediaQueries, "manualMediaQueries is overridden");
                assert.strictEqual(componentInstance.options.label, customSettings.label, "label is overridden");
            });
        });

        QUnit.module("Dynamic media query handling", function(moduleHooks) {
            let mediaQueryAutoComponent;
            let mediaQueryManualComponent;

            moduleHooks.beforeEach(function() {
                removeTestMarkup();
                injectTestMarkup("oneLevelMenu.html");
                primaryTestElement = jq("#primary-menu");

                mediaQueryAutoComponent = primaryTestElement.responsiveMenu(baseComponentOptions).data("responsiveMenu");
                currentTestComponentInstance = mediaQueryAutoComponent;

                const manualQuerySettings = {
                    appendTo: "#auxiliary-test-area",
                    manualMediaQueries: true
                };
                mediaQueryManualComponent = primaryTestElement.responsiveMenu(manualQuerySettings).data("responsiveMenu");
            });

            QUnit.module("automatic mode (manualMediaQueries: false)", function() {
                QUnit.test("should invoke onResize method", function(assert) {
                    assert.expect(1);
                    const originalOnResize = mediaQueryAutoComponent.onResize;
                    let resizeInvoked = false;
                    mediaQueryAutoComponent.onResize = function() {
                        resizeInvoked = true;
                        originalOnResize.apply(this, arguments);
                    };
                    mediaQueryAutoComponent.onResize.originalMethod = originalOnResize;

                    jq(window).trigger('resize');
                    assert.ok(resizeInvoked, "onResize was called");
                });

                QUnit.test("should hide original menu and show select menu if width is narrower than switchWidth", function(assert) {
                    const mockEvent = {
                        width: function() {
                            return 500;
                        }
                    };
                    mediaQueryAutoComponent.onResize(mockEvent);
                    assert.ok(primaryTestElement.is(':hidden'), "Original menu is hidden");
                    assert.ok(jq('#auxiliary-test-area select').is(':visible'), "Select menu is visible");
                });

                QUnit.test("should show original menu and hide select menu if width is wider than switchWidth", function(assert) {
                    const mockEvent = {
                        width: function() {
                            return 600;
                        }
                    };
                    mediaQueryAutoComponent.onResize(mockEvent);
                    assert.ok(primaryTestElement.is(':visible'), "Original menu is visible");
                    assert.ok(jq('#auxiliary-test-area select').is(':hidden'), "Select menu is hidden");
                });
            });

            QUnit.module("manual mode (manualMediaQueries: true)", function() {
                QUnit.test("should not alter menu visibility on resize event", function(assert) {
                    assert.expect(1);
                    const originalOnResize = mediaQueryManualComponent.onResize;
                    let resizeInvoked = false;
                    mediaQueryManualComponent.onResize = function() {
                        resizeInvoked = true;
                        originalOnResize.apply(this, arguments);
                    };
                    mediaQueryManualComponent.onResize.originalMethod = originalOnResize;

                    jq(window).trigger('resize');
                    assert.notOk(resizeInvoked, "onResize was not called");
                });
            });
        });

        QUnit.module("Single-level navigation generation", function(moduleHooks) {
            let simpleMenuElement, highlightedMenuElement;

            moduleHooks.beforeEach(function() {
                removeTestMarkup();
                injectTestMarkup('oneLevelMenu.html');
                simpleMenuElement = jq('#primary-menu');
                injectTestMarkup('oneLevelMenuWithCurrent.html');
                highlightedMenuElement = jq('#primary-menu-current');
            });

            QUnit.test("should generate correct HTML structure", function(assert) {
                const expectedMarkup = '<select class="responsive-select-menu">' +
                    '<option value="#one">One</option>' +
                    '<option value="#two">Two</option>' +
                    '<option value="#three">Three</option>' +
                    '<option value="#four">Four</option></select>';
                const instance = simpleMenuElement.responsiveMenu(baseComponentOptions).data("responsiveMenu");
                const generatedMarkup = instance.select.parent().html();
                assert.strictEqual(cleanHtmlForComparison(generatedMarkup), expectedMarkup, "Generated HTML matches expected structure");
            });

            QUnit.test("should mark current page item as selected", function(assert) {
                const expectedMarkup = '<select class="responsive-select-menu">' +
                    '<option value="#one">One</option>' +
                    '<option value="#two" selected="selected">Two</option>' +
                    '<option value="#three">Three</option>' +
                    '<option value="#four">Four</option></select>';
                const instance = highlightedMenuElement.responsiveMenu(baseComponentOptions).data("responsiveMenu");
                const generatedMarkup = instance.select.parent().html();
                assert.strictEqual(cleanHtmlForComparison(generatedMarkup), expectedMarkup, "Current item is selected");
            });
        });

        QUnit.module("Multi-level navigation generation", function(moduleHooks) {
            let complexMenuElement, complexHighlightedMenuElement;

            moduleHooks.beforeEach(function() {
                removeTestMarkup();
                injectTestMarkup("multiLevelMenu.html");
                complexMenuElement = jq("#secondary-menu");
                injectTestMarkup("multiLevelMenuWithCurrent.html");
                complexHighlightedMenuElement = jq("#secondary-menu-current");
            });

            QUnit.test("should generate correct HTML tree", function(assert) {
                const expectedMarkup = '<select class="responsive-select-menu">' +
                    '<option value="#one">One</option>' +
                    '<option value="#two">Two</option>' +
                    '<option value="#sub-one">-- Sub-one</option>' +
                    '<option value="#sub-sub-one">---- Sub-Sub-one</option>' +
                    '<option value="#sub-sub-two">---- Sub-Sub-two</option>' +
                    '<option value="#sub-two">-- Sub-two</option>' +
                    '<option value="#three">Three</option>' +
                    '<option value="#four">Four</option>' +
                    '</select>';
                const instance = complexMenuElement.responsiveMenu(baseComponentOptions).data("responsiveMenu");
                const generatedMarkup = instance.select.parent().html();
                assert.strictEqual(cleanHtmlForComparison(generatedMarkup), expectedMarkup, "Multi-level HTML matches expected structure");
            });

            QUnit.test("should correctly mark current page item in multi-level select menu", function(assert) {
                const expectedMarkup = '<select class="responsive-select-menu">' +
                    '<option value="#one">One</option>' +
                    '<option value="#two">Two</option>' +
                    '<option value="#sub-one">-- Sub-one</option>' +
                    '<option value="#sub-sub-one">---- Sub-Sub-one</option>' +
                    '<option value="#sub-sub-two" selected="selected">---- Sub-Sub-two</option>' +
                    '<option value="#sub-two">-- Sub-two</option>' +
                    '<option value="#three">Three</option>' +
                    '<option value="#four">Four</option>' +
                    '</select>';
                const instance = complexHighlightedMenuElement.responsiveMenu(baseComponentOptions).data("responsiveMenu");
                const generatedMarkup = instance.select.parent().html();
                assert.strictEqual(cleanHtmlForComparison(generatedMarkup), expectedMarkup, "Current item in multi-level menu is selected");
            });
        });

        QUnit.module("Custom label integration", function() {
            QUnit.test("should render select menu with the specified label", function(assert) {
                const customLabelSettings = {
                    switchWidth: 555,
                    appendTo: "#auxiliary-test-area",
                    label: "Navigation"
                };
                const expectedMarkup = '<select class="responsive-select-menu">' +
                    '<option value="#no-redirect">Navigation</option>' +
                    '<option value="#one">One</option>' +
                    '<option value="#two">Two</option>' +
                    '<option value="#three">Three</option>' +
                    '<option value="#four">Four</option></select>';
                const instance = primaryTestElement.responsiveMenu(customLabelSettings).data("responsiveMenu");
                const generatedMarkup = instance.select.parent().html();
                assert.strictEqual(cleanHtmlForComparison(generatedMarkup), expectedMarkup, "Select menu includes custom label");
            });
        });
    });

})(jQuery);