(function($) {

    // Custom Test Framework - Auditor
    var Auditor = (function() {
        var testSuites = [];
        var currentAssertions = 0;
        var expectedAssertionsForCurrentCase = 0;
        var testResults = {
            totalSuites: 0,
            totalCases: 0,
            passedCases: 0,
            failedCases: 0,
            totalAssertions: 0,
            failedAssertions: []
        };
        var currentSuiteLabel = '';
        var currentCaseLabel = '';

        function reportFailure(suiteName, caseName, assertionMessage, actual, expected, type) {
            testResults.failedAssertions.push({
                suite: suiteName,
                case: caseName,
                message: assertionMessage,
                actual: actual,
                expected: expected,
                type: type
            });
            console.error(`FAILURE in ${suiteName} - ${caseName}: ${assertionMessage} (Actual: ${JSON.stringify(actual)}, Expected: ${JSON.stringify(expected)})`);
        }

        var publicInterface = {};

        publicInterface.defineSuite = function(suiteLabel, configuration) {
            testSuites.push({
                label: suiteLabel,
                preamble: configuration.preamble || function() {},
                postlude: configuration.postlude || function() {},
                cases: []
            });
            testResults.totalSuites++;
        };

        publicInterface.defineCase = function(caseLabel, testLogic) {
            if (testSuites.length === 0) {
                console.error("No suite defined. Please define a suite before adding test cases.");
                return;
            }
            testSuites[testSuites.length - 1].cases.push({
                label: caseLabel,
                logic: testLogic
            });
            testResults.totalCases++;
        };

        publicInterface.setExpectedAssertions = function(count) {
            expectedAssertionsForCurrentCase = count;
        };

        publicInterface.confirmSame = function(actualValue, expectedValue, message) {
            currentAssertions++;
            testResults.totalAssertions++;
            if (actualValue !== expectedValue) {
                reportFailure(
                    currentSuiteLabel,
                    currentCaseLabel,
                    message,
                    actualValue,
                    expectedValue,
                    "strictEquality"
                );
                return false;
            }
            return true;
        };

        publicInterface.confirmDifferent = function(actualValue, expectedValue, message) {
            currentAssertions++;
            testResults.totalAssertions++;
            if (actualValue === expectedValue) {
                reportFailure(
                    currentSuiteLabel,
                    currentCaseLabel,
                    message,
                    actualValue,
                    `NOT ${JSON.stringify(expectedValue)}`,
                    "strictInequality"
                );
                return false;
            }
            return true;
        };

        publicInterface.checkEquality = function(actualValue, expectedValue, message) {
            currentAssertions++;
            testResults.totalAssertions++;
            if (actualValue != expectedValue) { // Using == for loose equality as in QUnit's equal()
                reportFailure(
                    currentSuiteLabel,
                    currentCaseLabel,
                    message,
                    actualValue,
                    expectedValue,
                    "looseEquality"
                );
                return false;
            }
            return true;
        };

        publicInterface.assertCondition = function(condition, message) {
            currentAssertions++;
            testResults.totalAssertions++;
            if (!condition) {
                reportFailure(
                    currentSuiteLabel,
                    currentCaseLabel,
                    message,
                    condition,
                    true,
                    "truthiness"
                );
                return false;
            }
            return true;
        };

        publicInterface.runAll = function() {
            console.log("Starting Auditor Test Run...");
            testSuites.forEach(function(suite) {
                currentSuiteLabel = suite.label;
                console.log(`\nRunning Suite: ${suite.label}`);

                suite.cases.forEach(function(testCase) {
                    currentCaseLabel = testCase.label;
                    console.log(`  Running Case: ${testCase.label}`);

                    currentAssertions = 0;
                    expectedAssertionsForCurrentCase = 0; // Reset for each case

                    var context = {}; // Context for setup/teardown and test logic
                    var caseFailed = false;

                    try {
                        suite.preamble.call(context);
                        testCase.logic.call(context);

                        // Check if any assertion failed within this specific case
                        caseFailed = testResults.failedAssertions.some(fa => fa.suite === currentSuiteLabel && fa.case === currentCaseLabel);

                        if (expectedAssertionsForCurrentCase > 0 && currentAssertions !== expectedAssertionsForCurrentCase) {
                            reportFailure(
                                currentSuiteLabel,
                                currentCaseLabel,
                                `Expected ${expectedAssertionsForCurrentCase} assertions but found ${currentAssertions}.`,
                                currentAssertions,
                                expectedAssertionsForCurrentCase,
                                "assertionCount"
                            );
                            caseFailed = true;
                        }

                        if (!caseFailed) {
                            testResults.passedCases++;
                        } else {
                            testResults.failedCases++;
                        }
                    } catch (e) {
                        reportFailure(
                            currentSuiteLabel,
                            currentCaseLabel,
                            `Unhandled exception: ${e.message}`,
                            e.stack,
                            "no exception",
                            "exception"
                        );
                        testResults.failedCases++;
                    } finally {
                        suite.postlude.call(context);
                    }
                });
            });

            console.log("\nAuditor Test Run Complete.");
            console.log("--------------------------");
            console.log(`Total Suites: ${testResults.totalSuites}`);
            console.log(`Total Cases: ${testResults.totalCases}`);
            console.log(`Passed Cases: ${testResults.passedCases}`);
            console.log(`Failed Cases: ${testResults.failedCases}`);
            console.log(`Total Assertions: ${testResults.totalAssertions}`);
            if (testResults.failedAssertions.length > 0) {
                console.error("FAILURES DETECTED:");
                testResults.failedAssertions.forEach(function(fail) {
                    console.error(`  [${fail.suite} - ${fail.case}] ${fail.message}`);
                });
            } else {
                console.log("All tests passed!");
            }
        };

        return publicInterface;

    }());

    Auditor.defineSuite('primary_operations', {
        preamble: function() {
            this.currentFixtureElements = $('#qunit-fixture');
            this.initialFixtureContent = $('#qunit-fixture')[0].innerHTML;
            this.pluginInitializationResult = this.currentFixtureElements.scrollNav();
            this.activePluginCount = $('.scroll-nav').length;
            this.pluginDestructionResult = this.currentFixtureElements.scrollNav('destroy');
            this.remainingPluginCount = $('.scroll-nav').length;
            this.finalFixtureContent = $('#qunit-fixture')[0].innerHTML;
        },
        postlude: function() {
            // No additional teardown needed, already destroyed
        }
    });

    Auditor.defineCase('verifies_chainability', function() {
        Auditor.setExpectedAssertions(1);
        Auditor.confirmSame(this.pluginInitializationResult, this.currentFixtureElements, 'output should be chainable');
    });

    Auditor.defineCase('verifies_correct_instance_count', function() {
        Auditor.setExpectedAssertions(1);
        Auditor.confirmSame(this.activePluginCount, 1, 'should activate one instance');
    });

    Auditor.defineCase('verifies_destroy_functionality', function() {
        Auditor.setExpectedAssertions(1);
        Auditor.confirmSame(this.remainingPluginCount, 0, 'should have zero instances after termination');
    });

    Auditor.defineCase('verifies_dom_reset_on_destroy', function() {
        Auditor.setExpectedAssertions(1);
        Auditor.confirmDifferent(this.initialFixtureContent, this.finalFixtureContent, 'element content must revert to original state');
    });

    Auditor.defineSuite('structure_verification', {
        preamble: function() {
            this.currentFixtureElements = $('#qunit-fixture');
            this.processedSections = this.currentFixtureElements.scrollNav().children();
        },
        postlude: function() {
            this.currentFixtureElements.scrollNav('destroy');
        }
    });

    Auditor.defineCase('validates_total_section_count', function() {
        Auditor.setExpectedAssertions(3);
        Auditor.confirmSame(this.processedSections.length, 2, 'should contain two items');
        Auditor.confirmDifferent(this.processedSections.length, 1, 'should not contain one item');
        Auditor.confirmDifferent(this.processedSections.length, 0, 'should not contain zero items');
    });

    Auditor.defineCase('validates_first_section_child_count', function() {
        Auditor.setExpectedAssertions(3);
        Auditor.confirmSame(this.processedSections.eq(0).children().length, 6, 'first item should have six children');
        Auditor.confirmDifferent(this.processedSections.eq(0).children().length, 5, 'first item should not have five children');
        Auditor.confirmDifferent(this.processedSections.eq(0).children().length, 7, 'first item should not have seven children');
    });

    Auditor.defineCase('validates_second_section_child_count', function() {
        Auditor.setExpectedAssertions(3);
        Auditor.confirmSame(this.processedSections.eq(1).children().length, 6, 'second item should have six children');
        Auditor.confirmDifferent(this.processedSections.eq(1).children().length, 5, 'second item should not have five children');
        Auditor.confirmDifferent(this.processedSections.eq(1).children().length, 7, 'second item should not have seven children');
    });

    Auditor.defineCase('validates_first_section_element_type', function() {
        Auditor.setExpectedAssertions(4);
        var itemTag = this.processedSections.eq(0).prop('tagName');
        Auditor.confirmSame(itemTag, 'SECTION', 'should be a SECTION element');
        Auditor.confirmDifferent(itemTag, 'DIV', 'should not be a DIV element');
        Auditor.confirmDifferent(itemTag, 'H2', 'should not be an H2 element');
        Auditor.confirmDifferent(itemTag, 'P', 'should not be a P element');
    });

    Auditor.defineCase('validates_second_section_element_type', function() {
        Auditor.setExpectedAssertions(4);
        var itemTag = this.processedSections.eq(1).prop('tagName');
        Auditor.confirmSame(itemTag, 'SECTION', 'should be a SECTION element');
        Auditor.confirmDifferent(itemTag, 'DIV', 'should not be a DIV element');
        Auditor.confirmDifferent(itemTag, 'H2', 'should not be an H2 element');
        Auditor.confirmDifferent(itemTag, 'P', 'should not be a P element');
    });

    Auditor.defineCase('validates_first_section_identifier', function() {
        Auditor.setExpectedAssertions(4);
        var itemID = this.processedSections.eq(0).attr('id');
        Auditor.confirmSame(itemID, 'scrollNav-1', 'ID should be scrollNav-1');
        Auditor.confirmDifferent(itemID, 'scrollNav-0', 'ID should not be scrollNav-0');
        Auditor.confirmDifferent(itemID, 'scrollNav-2', 'ID should not be scrollNav-2');
        Auditor.confirmDifferent(itemID, 'scrollNav-1-1', 'ID should not be scrollNav-1-1');
    });

    Auditor.defineCase('validates_second_section_identifier', function() {
        Auditor.setExpectedAssertions(4);
        var itemID = this.processedSections.eq(1).attr('id');
        Auditor.confirmSame(itemID, 'scrollNav-2', 'ID should be scrollNav-2');
        Auditor.confirmDifferent(itemID, 'scrollNav-1', 'ID should not be scrollNav-1');
        Auditor.confirmDifferent(itemID, 'scrollNav-3', 'ID should not be scrollNav-3');
        Auditor.confirmDifferent(itemID, 'scrollNav-2-1', 'ID should not be scrollNav-2-1');
    });

    Auditor.defineCase('validates_first_section_category', function() {
        Auditor.setExpectedAssertions(2);
        var itemCategory = this.processedSections.eq(0).attr('class');
        Auditor.confirmSame(itemCategory, 'scroll-nav__section', 'class should be scroll-nav__section');
        Auditor.confirmDifferent(itemCategory, '', 'class should not be empty');
    });

    Auditor.defineSuite('nested_structure_checks', {
        preamble: function() {
            this.currentFixtureElements = $('#qunit-fixture');
            this.pluginInterface = this.currentFixtureElements.scrollNav({
                sections: 'h2',
                subSections: 'h3',
                showHeadline: true
            });
            this.processedSections = this.pluginInterface.children();
        },
        postlude: function() {
            this.currentFixtureElements.scrollNav('destroy');
        }
    });

    Auditor.defineCase('validates_first_section_sub_section_count', function() {
        Auditor.setExpectedAssertions(3);
        var nestedElements = this.processedSections.eq(0).find('.scroll-nav__sub-section');
        Auditor.confirmSame(nestedElements.length, 2, 'should contain two sub-sections');
        Auditor.confirmDifferent(nestedElements.length, 1, 'should not contain one sub-section');
        Auditor.confirmDifferent(nestedElements.length, 0, 'should not contain zero sub-sections');
    });

    Auditor.defineSuite('navigation_component_tests', {
        preamble: function() {
            this.currentFixtureElements = $('#qunit-fixture');
            this.pluginInterface = this.currentFixtureElements.scrollNav();
            this.processedSections = this.pluginInterface.children();
            this.navigationComponent = this.pluginInterface.siblings('nav');
        },
        postlude: function() {
            this.currentFixtureElements.scrollNav('destroy');
        }
    });

    Auditor.defineCase('verifies_navigation_insertion', function() {
        Auditor.setExpectedAssertions(1);
        Auditor.checkEquality(this.navigationComponent.length, true, 'navigation should be present');
    });

    Auditor.defineCase('verifies_navigation_class', function() {
        Auditor.setExpectedAssertions(2);
        var navCategory = this.navigationComponent.attr('class');
        Auditor.confirmSame(navCategory, 'scroll-nav', 'class should be scroll-nav');
        Auditor.confirmDifferent(navCategory, '', 'class should not be empty');
    });

    Auditor.defineCase('verifies_wrapper_class', function() {
        Auditor.setExpectedAssertions(2);
        var wrapperCategory = this.navigationComponent.children('div').attr('class');
        Auditor.confirmSame(wrapperCategory, 'scroll-nav__wrapper', 'class should be scroll-nav__wrapper');
        Auditor.confirmDifferent(wrapperCategory, '', 'class should not be empty');
    });

    Auditor.defineCase('verifies_first_link_text', function() {
        Auditor.setExpectedAssertions(3);
        var headingContent = this.processedSections.eq(0).children().eq(0).text();
        var anchorContent = this.navigationComponent.find('li').eq(0).text();
        Auditor.confirmSame(anchorContent, headingContent, 'link text should match "Test Heading"');
        Auditor.confirmDifferent(anchorContent, 'lame test markup', 'link text should not be "lame test markup"');
        Auditor.confirmDifferent(anchorContent, 'Another Test Heading', 'link text should not be "Another Test Heading"');
    });

    Auditor.defineCase('verifies_second_link_text', function() {
        Auditor.setExpectedAssertions(3);
        var headingContent = this.processedSections.eq(1).children().eq(0).text();
        var anchorContent = this.navigationComponent.find('li').eq(1).text();
        Auditor.confirmSame(anchorContent, headingContent, 'link text should match "Another Test Heading"');
        Auditor.confirmDifferent(anchorContent, 'lame test markup', 'link text should not be "lame test markup"');
        Auditor.confirmDifferent(anchorContent, 'Test Heading', 'link text should not be "Test Heading"');
    });

    Auditor.defineCase('verifies_first_link_target', function() {
        Auditor.setExpectedAssertions(3);
        var itemID = this.processedSections.eq(0).attr('id');
        var anchorTarget = this.navigationComponent.find('li').eq(0).find('a').attr('href');
        Auditor.confirmSame(anchorTarget, '#' + itemID, 'target should be #scrollNav-1');
        Auditor.confirmDifferent(anchorTarget, 'lame test markup', 'target should not be #scrollNav-0');
        Auditor.confirmDifferent(anchorTarget, 'Another Test Heading', 'target should not be #scrollNav-2');
    });

    Auditor.defineCase('verifies_second_link_target', function() {
        Auditor.setExpectedAssertions(3);
        var itemID = this.processedSections.eq(1).attr('id');
        var anchorTarget = this.navigationComponent.find('li').eq(1).find('a').attr('href');
        Auditor.confirmSame(anchorTarget, '#' + itemID, 'target should be #scrollNav-2');
        Auditor.confirmDifferent(anchorTarget, 'lame test markup', 'target should not be #scrollNav-1');
        Auditor.confirmDifferent(anchorTarget, 'Another Test Heading', 'target should not be #scrollNav-3');
    });

    Auditor.defineSuite('custom_option_validation', {
        preamble: function() {
            this.currentFixtureElements = $('#qunit-fixture');
            this.pluginInterface = this.currentFixtureElements.scrollNav({
                className: 'nav-test'
            });
            this.navigationComponent = this.pluginInterface.siblings('nav');
            this.processedSections = this.pluginInterface.children();
        },
        postlude: function() {
            this.currentFixtureElements.scrollNav('destroy');
        }
    });

    Auditor.defineCase('verifies_navigation_custom_class', function() {
        Auditor.setExpectedAssertions(3);
        var navCategory = this.navigationComponent.attr('class');
        Auditor.confirmSame(navCategory, 'nav-test', 'class should be nav-test');
        Auditor.confirmDifferent(navCategory, 'scroll-nav', 'class should not be scroll-nav');
        Auditor.confirmDifferent(navCategory, '', 'class should not be empty');
    });

    Auditor.defineCase('verifies_wrapper_custom_class', function() {
        Auditor.setExpectedAssertions(3);
        var wrapperCategory = this.navigationComponent.children('div').attr('class');
        Auditor.confirmSame(wrapperCategory, 'nav-test__wrapper', 'class should be nav-test__wrapper');
        Auditor.confirmDifferent(wrapperCategory, 'scroll-nav__wrapper', 'class should not be scroll-nav__wrapper');
        Auditor.confirmDifferent(wrapperCategory, '', 'class should not be empty');
    });

    Auditor.defineCase('verifies_first_section_custom_class', function() {
        Auditor.setExpectedAssertions(3);
        var itemCategory = this.processedSections.eq(0).attr('class');
        Auditor.confirmSame(itemCategory, 'nav-test__section', 'class should be nav-test__section');
        Auditor.confirmDifferent(itemCategory, 'scroll-nav__section', 'class should not be scroll-nav__section');
        Auditor.confirmDifferent(itemCategory, '', 'class should not be empty');
    });

    Auditor.defineSuite('event_hook_validation', {
        preamble: function() {
            this.currentFixtureElements = $('#qunit-fixture');
            this.pluginInterface = this.currentFixtureElements.scrollNav({
                onInit: function() {
                    $('body').addClass('init-callback-flag');
                },
                onRender: function() {
                    $('body').addClass('render-callback-flag');
                },
                onDestroy: function() {
                    $('body').removeClass('init-callback-flag render-callback-flag');
                }
            });
            this.bodyHasInitFlag = $('body').hasClass('init-callback-flag');
            this.bodyHasRenderFlag = $('body').hasClass('render-callback-flag');
            this.pluginDestructionResult = this.currentFixtureElements.scrollNav('destroy');
            this.bodyInitFlagAfterDestroy = $('body').hasClass('init-callback-flag');
            this.bodyRenderFlagAfterDestroy = $('body').hasClass('render-callback-flag');
        },
        postlude: function() {
            // Already cleaned up by onDestroy callback
        }
    });

    Auditor.defineCase('verifies_on_initialization_callback', function() {
        Auditor.setExpectedAssertions(1);
        Auditor.confirmSame(true, this.bodyHasInitFlag, 'init-callback-flag class should be present');
    });

    Auditor.defineCase('verifies_on_rendering_callback', function() {
        Auditor.setExpectedAssertions(1);
        Auditor.confirmSame(true, this.bodyHasRenderFlag, 'render-callback-flag class should be present');
    });

    Auditor.defineCase('verifies_on_destruction_callback', function() {
        Auditor.setExpectedAssertions(2);
        Auditor.confirmSame(false, this.bodyInitFlagAfterDestroy, 'init-callback-flag class should be absent');
        Auditor.confirmSame(false, this.bodyRenderFlagAfterDestroy, 'render-callback-flag class should be absent');
    });

    Auditor.runAll();

}(jQuery));