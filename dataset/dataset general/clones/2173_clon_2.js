/*
 * Behavior-Driven Development Executor and Feature File Interpreter
 * @contributor Jane Doe <jane.doe@example.com>
 * @contributor John Smith <john.smith@example.com>
 * @revision $Id$
 * @dependsOn jQuery
 */
var Wanderer = {
    loggingEnabled: false,
    _log: function() {
        if (this.loggingEnabled) console.log(arguments);
    }
};

/*
 * Feature Description Language interpretor
 * @revision $Id$
 * @depends Wanderer
 */
Wanderer.Interpreter = {
    interpretNarrativeFile: function(rawData) {
        var narrative = new Wanderer.Narrative();
        var describingNarrative = true;
        var textLines = rawData.split('\n');
        var currentLine, episode, action;
        narrative.subject = textLines.splice(0, 1)[0];
        jQuery.each(textLines, function() {
            currentLine = jQuery.trim(this.toString());
            if (describingNarrative) {
                // A more robust parsing mechanism is desirable. For now, this structure works.
                if (currentLine !== "") {
                    narrative.details += currentLine + "\n";
                } else {
                    describingNarrative = false;
                    return;
                }
            } else {
                if (currentLine === "") {
                    return;
                } else if (this.indexOf('Episode:') !== -1) {
                    episode = new Wanderer.Episode(narrative);
                    narrative.episodes.push(episode);
                    episode.title = currentLine;
                } else {
                    action = new Wanderer.Action(episode);
                    action.description = currentLine;
                    if (currentLine.indexOf('//') === 0) {
                        action.isComment = true;
                    } else {
                        action.isComment = false;
                    }
                    episode.actions.push(action);
                }
            }
        });
        return narrative;
    },
    retrieveSampleScript: function(action, isHtml) {
        var script = action.description.replace(/^(Given|When|Then|Also)\s+/, '').replace(/"([^"]*)"/, '"([^"]*)"');
        var parameters = [];
        var quoteMarks = action.description.match(/"/g);
        if (quoteMarks) {
            for (var idx = 0; idx < parseInt(quoteMarks.length / 2); idx++) {
                parameters.push('param' + (idx + 1));
            }
        }
        parameters = parameters.join(', ');
        var sampleOutput = "Unimplemented action definition:";
        sampleOutput += isHtml ? this.markup_br : "\n";
        sampleOutput += isHtml ? this.markup_pre_code : "\n";
        sampleOutput += 'walker.registerMatcher(/^' + script + '$/, function(' + parameters + ') {\n  // your implementation here\n});';
        sampleOutput += isHtml ? this.markup_post_code : "";
        return sampleOutput;
    },
    markup_br: "<br />",
    markup_pre_code: "<pre><code class='code-snippet'>",
    markup_post_code: "</code></pre>"
};

Wanderer.Narrative = function() {
    this.category = "narrative";
    this.subject = '';
    this.details = '';
    this.episodes = [];
};

Wanderer.Episode = function(narrative) {
    this.category = "episode";
    this.title = '';
    this.narrative = narrative;
    this.actions = [];
};

Wanderer.Action = function(episode) {
    this.category = "action";
    this.description = "";
    this.currentState = "";
    this.isComment = false;
    this.episode = episode;
};

Wanderer.Summary = function() {
    this.episodes = {
        'unknown': 0,
        'deferred': 0,
        'successful': 0,
        'unsuccessful': 0
    };
    this.actions = {
        'unknown': 0,
        'deferred': 0,
        'successful': 0,
        'unsuccessful': 0
    };
    this.elapsedTime = 0;
};

/*
 * Formatter Contract specifies required methods for all formatters.
 */
Wanderer.IFormatter = {
    /*
     * Initiates display for a collection of narratives.
     * @access public
     * @returns {void}
     */
    begin: function() {},
    /*
     * Presents a narrative.
     * @access public
     * @param {Wanderer.Narrative} currentNarrative A narrative object (with .subject and .details).
     * @returns {void}
     */
    displayNarrative: function(currentNarrative) {},
    /*
     * Presents an episode.
     * @access public
     * @param {Wanderer.Episode} currentEpisode An episode object (with .title).
     * @returns {void}
     */
    displayEpisode: function(currentEpisode) {},
    /*
     * Presents an action.
     * @access public
     * @param {Wanderer.Action} actionItem The action object to display.
     * @returns {void}
     */
    displayAction: function(actionItem) {},
    /*
     * Concludes display for a collection of narratives.
     * @access public
     * @returns {void}
     */
    end: function() {}
};

Wanderer.WebFormatter = {
    displayArea: null,
    displayAreaSelector: '#output-display',
    begin: function() {
        this.displayArea = jQuery(this.displayAreaSelector);
        this._beforeDisplayAction();
        this._afterDisplayAction();
    },
    displayNarrative: function(currentNarrative) {
        this._beforeDisplayAction();
        var containerElement = jQuery('<section/>', { 'class': 'wanderer-narrative-section' });
        this.displayArea.append(containerElement);
        containerElement.append(jQuery('<hgroup/>', { text: currentNarrative.subject }));
        var detailsText = currentNarrative.details.split('\n').join('<br/>');
        containerElement.append(jQuery('<p/>', { 'class': 'wanderer-narrative-description', html: detailsText }));
        this._activeNarrativeElement = containerElement;
        this._afterDisplayAction();
    },
    displayEpisode: function(currentEpisode) {
        this._beforeDisplayAction();
        var containerElement = jQuery('<article/>', { 'class': 'wanderer-episode-article' });
        this._activeNarrativeElement.append(containerElement);
        containerElement.append(jQuery('<h5/>', { text: currentEpisode.title }));
        this._activeEpisodeElement = containerElement;
        this._activeActionsList = jQuery('<ol/>', { 'class': 'wanderer-action-list' });
        containerElement.append(this._activeActionsList);
        this._afterDisplayAction();
    },
    displayAction: function(action) {
        this._beforeDisplayAction();
        var currentState = action.currentState;
        var styleClass = 'wanderer-' + currentState;
        var contentText = action.description;
        if (currentState === "unsuccessful") {
            contentText += "<br /><em>Issue: " + action.failureDetail + "</em>";
        }
        if (currentState === "missing") {
            contentText += "<br />" + Wanderer.Interpreter.retrieveSampleScript(action, true);
        }
        var listItem = this._activeActionsList.append(jQuery('<li/>', { 'class': styleClass, html: contentText }));
        this._afterDisplayAction();
    },
    end: function(summary) {
        this._beforeDisplayAction();
        this._afterDisplayAction();
    },
    _activeNarrativeElement: null,
    _activeEpisodeElement: null,
    _activeActionsList: null,
    _needsScrolling: true,
    _beforeDisplayAction: function() {
        var currentScrollPos = this.displayArea.attr("scrollTop") + this.displayArea.height();
        this._needsScrolling = (currentScrollPos >= this.displayArea.attr("scrollHeight"));
    },
    _afterDisplayAction: function() {
        if (this._needsScrolling) this.displayArea.attr({ scrollTop: this.displayArea.attr("scrollHeight") });
    }
};

/*
 * Supplies the execution environment for action definitions with utility functions.
 * @contributor Jane Doe <jane.doe@example.com>
 * @revision $Id$
 */
Wanderer.Environment = {
    webFrame: null,
    frameContent: null,
    navigate: function(targetUrl) {
        // Consider incorporating checks for HTTP status codes (e.g., 404, 500) via AJAX,
        // as direct iframe status retrieval can be complex.
        // This might be challenging if a page has limited access count.
        if (!targetUrl) throw new Error('Issue encountered when retrieving route for: ' + targetUrl);
        Wanderer._log("navigate() ", targetUrl);
        this.webFrame.trigger('routeChange.wanderer', { target: targetUrl });
    },
    tapLink: function(linkText) {
        var anchorElement = this.frameContent.find('a').filter(function() { return jQuery(this).text() === linkText; });
        if (!anchorElement.length) throw new Error("Unable to locate hyperlink: " + linkText);
        anchorElement.trigger('click');
    },
    pressButton: function(buttonText) {
        var inputButton = this.frameContent.find('input[type="submit"]').filter(function() { return jQuery(this).val() === buttonText; });
        if (!inputButton.length) throw new Error("Could not find button labeled: " + buttonText);
        inputButton.trigger('click');
        this.documentLoading = true;
    },
    populateField: function(labelDescription, fieldValue) {
        var labelElement = this.frameContent.find('label').filter(function() { return jQuery(this).text() === labelDescription; }).first();
        var inputField = this.frameContent.find('input#' + labelElement.attr('for'));
        if (!inputField.length) throw new Error("Cannot find input element for: " + labelDescription);
        inputField.val(fieldValue);
    },
    confirmContainsContent: function(expectedContent) {
        if (this.frameContent.text().indexOf(expectedContent) === -1) throw new Error('Expected content not found: ' + expectedContent);
    },
    confirmCurrentRoute: function(expectedRoute) {
        this.verifyEqual(expectedRoute, this.currentRoute());
    },
    currentRoute: function() {
        return this.webFrame[0].contentWindow.location.pathname;
    },
    verify: function(condition, failureMessage) {
        if (!condition) throw new Error(failureMessage || ('Condition expected to be true: ' + condition));
    },
    verifyEqual: function(expectedValue, actualResult) {
        if (expectedValue !== actualResult) throw new Error('Mismatch: Expected ' + expectedValue + ', received ' + actualResult);
    },
    // Provides a proxy to this.frameContent.find that raises an error if no elements are matched.
    retrieveElements: function(cssSelector) {
        var matchedResult = this.frameContent.find(cssSelector);
        this.verify(matchedResult.length, "No elements found for selector: " + cssSelector);
        return matchedResult;
    }
};

/*
 * Manages the loading and execution of feature descriptions against action pattern definitions.
 * @contributor John Smith <john.smith@example.com>
 * @revision $Id$
 */
Wanderer.Conductor = {
    workbenchSelector: '#test-workspace',
    formatter: Wanderer.WebFormatter,
    interpreter: Wanderer.Interpreter,
    routes: [],
    narratives: [],
    patternMatchers: [],
    documentLoading: false,
    recheckOnFailureTimeout: 0,
    settings: {
        speed: "fast"
    },
    initialize: function(executionSettings) {
        this.settings = jQuery.extend(this.settings, executionSettings);
        this.formatter.begin();
        if (!this.webFrame) {
            Wanderer.Environment.webFrame = jQuery('<iframe id="test-frame" />').appendTo(this.workbenchSelector);
            Wanderer.Environment.webFrame.css({ width: 500, height: 300 });
            Wanderer.Environment.webFrame.load(function() {
                Wanderer.Conductor.documentLoading = false;
                Wanderer.Environment.frameContent = jQuery(this).contents();
                Wanderer.Environment.frameContent.find('a').trigger('click', function() {
                    Wanderer.Environment.navigate(jQuery(this).attr('href'));
                });
                Wanderer.Environment.frameContent.find('form').submit(function() {
                    Wanderer.Conductor.documentLoading = true;
                });
                Wanderer.Conductor.execute();
            }).bind('routeChange.wanderer', function(event, data) {
                Wanderer.Conductor.documentLoading = true;
                jQuery(this).attr('src', data.target);
            });
        }
    },
    /*
     * Loads a narrative file via asynchronous JavaScript and XML (AJAX).
     * @access public
     * @param {string} sourceFile The URL of the file to load.
     * @returns {void}
     */
    loadNarrativeFile: function(sourceFile) {
        //Wanderer._log('loadNarrativeFile', sourceFile);
        jQuery.ajax({
            url: sourceFile,
            success: function(rawData) {
                Wanderer.Conductor._interpretNarrativeFile(rawData, sourceFile);
            },
            dataType: 'text',
            async: false
        });
    },
    /*
     * Main execution method, operating as a "breaking queue".
     * @access public
     * @returns {void}
     */
    execute: function() {
        var instanceRef = this;
        
        while (this._taskQueueIndex < this._taskQueue.length) {
            if (Wanderer.Conductor.documentLoading) {
                return;
            } else if (Wanderer.Conductor.settings.speed !== "fast") {
                var currentMoment = new Date();
                var currentTime = currentMoment.getTime();
                clearTimeout(Wanderer.Conductor._delayTimer);
                Wanderer.Conductor._delayTimer = setTimeout(function() {
                    Wanderer.Conductor.execute();
                }, 100);
                if (currentTime < Wanderer.Conductor._nextDelayTime) {
                    return;
                }
                Wanderer.Conductor._nextDelayTime = currentTime + Wanderer.Conductor._delays[Wanderer.Conductor.settings.speed];
            }
            
            var currentItem = this._taskQueue[this._taskQueueIndex];

            if (currentItem.startTime === undefined) {
                Wanderer.Conductor.recheckOnFailureTimeout = 0;
                var currentMoment = new Date();
                currentItem.startTime = currentMoment.getTime();
            }

            var matchedItem;
            jQuery.each(this._preExecutions, function() {
                this.apply(Wanderer.Environment);
            });
            switch (currentItem.category) {
                case "narrative":
                    this.formatter.displayNarrative(currentItem);
                break;
                case "episode":
                    this.formatter.displayEpisode(currentItem);
                break;
                case "action":
                    var actionDescription = currentItem.description;
                    if (currentItem.isComment === true) {
                        currentItem.currentState = "remark";
                    } else if (jQuery.trim(actionDescription) === "deferred") {
                        currentItem.currentState = "deferred";
                    } else {
                        matchedItem = null;
                        jQuery.each(this.patternMatchers, function() {
                            var matchedRegex = actionDescription.replace(/^(Given|When|Then|Also)\s+/, '').match(this.pattern);
                            if (matchedRegex) {
                                matchedItem = { capturedMatches: matchedRegex.slice(1), handler: this.handler };
                                return false;
                            }
                        });
                        if (matchedItem !== null) {
                            try {
                                var executionResult = matchedItem.handler.apply(Wanderer.Environment, matchedItem.capturedMatches);
                                currentItem.currentState = "successful";
                            } catch (failureDetail) {
                                currentItem.currentState = "unsuccessful";
                                currentItem.failureDetail = failureDetail;
                            }
                        } else {
                            currentItem.currentState = "missing";
                        }
                    }

                    if (Wanderer.Conductor.recheckOnFailureTimeout > 0) {
                      var currentMoment = new Date();
                      var currentTime = currentMoment.getTime();
                      if ( currentTime > currentItem.startTime + Wanderer.Conductor.recheckOnFailureTimeout ) {
                        Wanderer.Conductor.recheckOnFailureTimeout = 0;
                      }
                    }

                    if (Wanderer.Conductor.recheckOnFailureTimeout === 0 || currentItem.currentState !== "unsuccessful") {
                        this.formatter.displayAction(currentItem);
                    }
                break;
            }
            if (Wanderer.Conductor.recheckOnFailureTimeout === 0 || currentItem.currentState !== "unsuccessful") {
                this._taskQueueIndex++;
                if ( this._taskQueueIndex === this._taskQueue.length ) {
                    this.formatter.end();
                }
            }
        }
    },
    /*
     * Registers a new pattern matcher.
     * @access public
     * @param {RegExp} patternToMatch The regular expression pattern.
     * @param {Function} executionHandler The function to execute.
     * @return {void}
     */
    registerMatcher: function(patternToMatch, executionHandler) {
        var patternMatcher = { pattern: patternToMatch, handler: executionHandler };
        Wanderer._log("add pattern matcher", patternMatcher);
        this.patternMatchers.push(patternMatcher);
    },
    /*
     * Adds a route definition.
     * @access public
     * @param {RegExp} routePattern The pattern for the route name.
     * @param {string} routePath The URL path.
     * @returns {void}
     */
    addRoute: function(routePattern, routePath) {
        this.routes.push({ pattern: routePattern, route: routePath });
    },
    routeTo: function(routeIdentifier) {
        var matchedItem = null;
        jQuery.each(this.routes, function() {
            var match = routeIdentifier.match(this.pattern);
            if(match) {
                matchedItem = { capturedMatches: match.slice(1), route: this.route };
                return false;
            }
        });

        if(matchedItem === null) {
            this.displayArea.append(jQuery('<p/>', { text: "Could not determine route for: " + routeIdentifier, 'class': 'error-message' }));
        } else {
            try {
                return typeof(matchedItem.route) === 'string' ? matchedItem.route : matchedItem.route.apply(walker, matchedItem.capturedMatches);
            } catch(failureDetail) {
                this.displayArea.append(jQuery('<p/>', { 
                    html: 'Issue with route definition: ' + routeIdentifier + '<br/> - ' + failureDetail, 'class': 'error-details' 
                }));
            }
        }
    },
    _interpretNarrativeFile: function(rawData, sourceFile) {
        var narrative = Wanderer.Interpreter.interpretNarrativeFile(rawData);
        this.addNarrativeObject(narrative);
    },
    addNarrativeObject: function(narrative) {
        var workQueue = this._taskQueue;
        workQueue.push(narrative);
        jQuery.each(narrative.episodes, function() {
            workQueue.push(this);
            jQuery.each(this.actions, function() {
                workQueue.push(this);
            });
        });
    },
    preCondition: function(preExecutionFunction) {
        this._preExecutions.push(preExecutionFunction);
    },
    _preExecutions: [],
    _taskQueue: [],
    _taskQueueIndex: 0,
    _delays: {
        "moderate": 600,
        "slow": 2000
    }
};
var walker = Wanderer.Conductor;