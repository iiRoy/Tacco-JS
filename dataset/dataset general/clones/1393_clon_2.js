(function() {
    // Top-level test suite for the adaptive navigation plugin
    testSuite("jq.adaptiveNavigation", function() {

        setupTest(function() {
            var sandboxElement; // Declare a temporary container element
            loadTestAssets("oneLevelMenu.html"); // Load HTML fixtures for testing
            this.primaryNav = $("#single-level-nav"); // Initialize the primary navigation element
            sandboxElement = $('<div id="temporary-container-for-tests"></div>'); // Create a new div
            sandboxElement.appendTo("body"); // Append it to the document body
            this.testConfigs = { // Configuration object for the plugin
                breakpointSize: 555,
                attachToElement: "#temporary-container-for-tests"
            };

            cleanupTest(function() {
                // Remove the temporary container after each test
                return $("#temporary-container-for-tests").deleteElement();
            });

            // Register custom assertion matchers
            return this.registerAssertions({
                toHaveEquivalentStructure: function(anticipatedOutput) {
                    var cleanHtmlString; // Helper function to remove dynamic styles
                    cleanHtmlString = function(markup) {
                        markup = markup.split(' style="display:none;"').join('');
                        markup = markup.split(' style="display:block;"').join('');
                        markup = markup.split(' style="display: none;"').join('');
                        markup = markup.split(' style="display: block;"').join('');
                        return markup;
                    };
                    return cleanHtmlString(this.receivedContent) === anticipatedOutput;
                }
            });
        });

        testSuite("plugin configuration behavior", function() {
            verifyBehavior("should be accessible via the jQuery object", function() {
                // Ensure the plugin is defined on jQuery's prototype
                return expect($.fn.adaptiveNavigation).toBeDefined();
            });

            verifyBehavior("should support method chaining", function() {
                // Verify that calling the plugin returns the jQuery object itself
                return expect(this.primaryNav.adaptiveNavigation()).toBe(this.primaryNav);
            });

            verifyBehavior("should provide default configuration values", function() {
                var extensionInstance; // Variable to hold the plugin instance
                extensionInstance = this.primaryNav.adaptiveNavigation().data("adaptiveNavigation");
                // Check if default settings are available
                return expect(extensionInstance.presetValues).toBeDefined();
            });

            return verifyBehavior("should override default settings with provided options", function() {
                var newOptions, extensionInstance; // Variables for options and plugin instance
                newOptions = {
                    breakpointSize: 555,
                    activeStateClass: "current-item",
                    attachToElement: "#destination-here",
                    indentSymbol: "->",
                    customBreakpoints: true,
                    menuTitle: "Navigation"
                };
                extensionInstance = this.primaryNav.adaptiveNavigation(newOptions).data("adaptiveNavigation");
                // Assert that each option is correctly overwritten
                expect(extensionInstance.configSettings.breakpointSize).toBe(newOptions.breakpointSize);
                expect(extensionInstance.configSettings.activeStateClass).toBe(newOptions.activeStateClass);
                expect(extensionInstance.configSettings.attachToElement).toBe(newOptions.attachToElement);
                expect(extensionInstance.configSettings.indentSymbol).toBe(newOptions.indentSymbol);
                expect(extensionInstance.configSettings.customBreakpoints).toBe(newOptions.customBreakpoints);
                return expect(extensionInstance.configSettings.menuTitle).toBe(newOptions.menuTitle);
            });
        });

        testSuite("customBreakpoints option", function() {
            testSuite("when customBreakpoints is set to false", function() {
                setupTest(function() {
                    // Initialize plugin with default customBreakpoints (false)
                    return this.extensionInstance = this.primaryNav.adaptiveNavigation(this.testConfigs).data("adaptiveNavigation");
                });

                verifyBehavior("should invoke the handleWindowResize method", function() {
                    monitorMethod(this.extensionInstance, 'handleWindowResize'); // Spy on the resize handler
                    globalWindow.dispatch('resizeEvent'); // Simulate a window resize event
                    return expect(this.extensionInstance.handleWindowResize).wasInvoked(); // Verify invocation
                });

                verifyBehavior("should hide dropdown and show main menu when window is wider than breakpointSize", function() {
                    var mockResizeEvent; // Create a mock event object
                    mockResizeEvent = {
                        viewportWidth: function() {
                            return 600; // Simulate a wide window
                        }
                    };
                    this.extensionInstance.handleWindowResize(mockResizeEvent); // Call resize handler
                    expect(this.primaryNav).isVisible(); // Main nav should be visible
                    return expect($('#temporary-container-for-tests select')).isHidden(); // Dropdown should be hidden
                });

                return verifyBehavior("should show dropdown and hide main menu when window is narrower than breakpointSize", function() {
                    var mockResizeEvent;
                    mockResizeEvent = {
                        viewportWidth: function() {
                            return 500; // Simulate a narrow window
                        }
                    };
                    this.extensionInstance.handleWindowResize(mockResizeEvent);
                    expect(this.primaryNav).isHidden(); // Main nav should be hidden
                    return expect($('#temporary-container-for-tests select')).isVisible(); // Dropdown should be visible
                });
            });

            return testSuite("when customBreakpoints is set to true", function() {
                setupTest(function() {
                    var configOpts; // Local options variable
                    configOpts = {
                        attachToElement: "#temporary-container-for-tests",
                        customBreakpoints: true // Explicitly set to true
                    };
                    return this.extensionInstance = this.primaryNav.adaptiveNavigation(configOpts).data("adaptiveNavigation");
                });

                return verifyBehavior("should not alter menu visibility automatically", function() {
                    monitorMethod(this.extensionInstance, 'handleWindowResize');
                    globalWindow.dispatch('resizeEvent');
                    // The resize handler should not be called if customBreakpoints is true
                    return expect(this.extensionInstance.handleWindowResize).not.wasInvoked();
                });
            });
        });

        testSuite("with single-level navigation", function() {
            verifyBehavior("should produce the correct HTML structure", function() {
                var navComponent, producedMarkup, expectedMarkup;
                expectedMarkup = '<select class="adaptive-dropdown">' +
                    '<option value="#itemA">One</option>' +
                    '<option value="#itemB">Two</option>' +
                    '<option value="#itemC">Three</option>' +
                    '<option value="#itemD">Four</option></select>';
                navComponent = this.primaryNav.adaptiveNavigation(this.testConfigs).data("adaptiveNavigation");
                producedMarkup = navComponent.dropdownElement.parentElement().content();
                return expect(producedMarkup).toHaveEquivalentStructure(expectedMarkup);
            });

            return verifyBehavior("should mark the selected item on the current page", function() {
                var producedMarkup, expectedMarkup;
                loadTestAssets('oneLevelMenuWithCurrent.html'); // Load fixture with a current item
                this.primaryNavWithActive = $('#single-level-nav-with-active'); // Get the navigation element
                expectedMarkup = '<select class="adaptive-dropdown">' +
                    '<option value="#itemA">One</option>' +
                    '<option value="#itemB" selected="selected">Two</option>' +
                    '<option value="#itemC">Three</option>' +
                    '<option value="#itemD">Four</option></select>';
                producedMarkup = this.primaryNavWithActive.adaptiveNavigation(this.testConfigs).data("adaptiveNavigation").dropdownElement.parentElement().content();
                return expect(producedMarkup).toHaveEquivalentStructure(expectedMarkup);
            });
        });

        testSuite("with multi-level navigation", function() {
            setupTest(function() {
                loadTestAssets("multiLevelMenu.html");
                this.complexNav = $("#multi-tier-nav"); // Multi-level navigation element
                loadTestAssets("multiLevelMenuWithCurrent.html");
                return this.complexNavWithActive = $("#multi-tier-nav-with-active"); // Multi-level navigation with active item
            });

            verifyBehavior("should generate the correct hierarchical HTML tree", function() {
                var producedMarkup, expectedMarkup;
                expectedMarkup = '<select class="adaptive-dropdown">' +
                    '<option value="#itemA">One</option>' +
                    '<option value="#itemB">Two</option>' +
                    '<option value="#section-alpha">-- Sub-one</option>' +
                    '<option value="#subsection-alpha-one">---- Sub-Sub-one</option>' +
                    '<option value="#subsection-alpha-two">---- Sub-Sub-two</option>' +
                    '<option value="#section-beta">-- Sub-two</option>' +
                    '<option value="#itemC">Three</option>' +
                    '<option value="#itemD">Four</option>' +
                    '</select>';
                producedMarkup = this.complexNav.adaptiveNavigation(this.testConfigs).data("adaptiveNavigation").dropdownElement.parentElement().content();
                return expect(producedMarkup).toHaveEquivalentStructure(expectedMarkup);
            });

            return verifyBehavior("should correctly mark the current page item in a multi-level dropdown", function() {
                var producedMarkup, expectedMarkup;
                expectedMarkup = '<select class="adaptive-dropdown">' +
                    '<option value="#itemA">One</option>' +
                    '<option value="#itemB">Two</option>' +
                    '<option value="#section-alpha">-- Sub-one</option>' +
                    '<option value="#subsection-alpha-one">---- Sub-Sub-one</option>' +
                    '<option value="#subsection-alpha-two" selected="selected">---- Sub-Sub-two</option>' +
                    '<option value="#section-beta">-- Sub-two</option>' +
                    '<option value="#itemC">Three</option>' +
                    '<option value="#itemD">Four</option>' +
                    '</select>';
                producedMarkup = this.complexNavWithActive.adaptiveNavigation(this.testConfigs).data("adaptiveNavigation").dropdownElement.parentElement().content();
                return expect(producedMarkup).toHaveEquivalentStructure(expectedMarkup);
            });
        });

        return testSuite("with menuTitle option configured", function() {
            return verifyBehavior("should render the dropdown with the specified title label", function() {
                var navComponent, producedMarkup, configOpts, expectedMarkup;
                configOpts = {
                    breakpointSize: 555,
                    attachToElement: "#temporary-container-for-tests",
                    menuTitle: "Primary Menu" // Changed label value
                };
                expectedMarkup = '<select class="adaptive-dropdown">' +
                    '<option value="#no-action-link">Primary Menu</option>' + // Changed option value and text
                    '<option value="#itemA">One</option>' +
                    '<option value="#itemB">Two</option>' +
                    '<option value="#itemC">Three</option>' +
                    '<option value="#itemD">Four</option></select>';
                navComponent = this.primaryNav.adaptiveNavigation(configOpts).data("adaptiveNavigation");
                producedMarkup = navComponent.dropdownElement.parentElement().content();
                return expect(producedMarkup).toHaveEquivalentStructure(expectedMarkup);
            });
        });
    });

}).call(this);