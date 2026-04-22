(function () {
    var listContainerElement, listItemElements = [], removalProcedure, existingDetectionPanel = document.getElementById('___lib_detector_panel___');

    removalProcedure = function () {
        document.body.removeChild(listContainerElement);
    };

    if (existingDetectionPanel) {
        document.body.removeChild(existingDetectionPanel);
        return;
    }

    /* This function defines a library's characteristics */
    function LibraryDescriptor(versioningPaths, cdnjsIdentifier) {
        if (!(versioningPaths instanceof Array)) {
            versioningPaths = [versioningPaths];
        }
        this.versioningPaths = versioningPaths;
        this.cdnIdentifier = cdnjsIdentifier || ''; /* Default to empty string if not provided */
    }

    /* Iterates through style properties and applies them to the given DOM element */
    function applyVisualStyling(targetElementNode, styleDefinitions) {
        for (var propKey in styleDefinitions) {
            if (typeof targetElementNode.style.setProperty !== 'undefined') {
                targetElementNode.style.setProperty(propKey, styleDefinitions[propKey], null);
            } else {
                targetElementNode.style[propKey] = styleDefinitions[propKey];
            }
        }
    }

    var knownSoftwareLibraries = {
        'Ace': new LibraryDescriptor('ace', 'ace'),
        'ActiveJS': new LibraryDescriptor('ActiveSupport'),
        'AngularJS': new LibraryDescriptor('angular.version.full'),
        'Backbone.js': new LibraryDescriptor('Backbone.VERSION', 'backbone.js'),
        'Backbone localStorage': new LibraryDescriptor('Store', 'backbone-localstorage.js'),
        'Base2': new LibraryDescriptor('base2.version'),
        'Batman.js': new LibraryDescriptor('Batman'),
        'CamanJS': new LibraryDescriptor('Caman.version.release', 'camanjs'),
        'Chainvas': new LibraryDescriptor('Chainvas'),
        'CoffeeScript': new LibraryDescriptor('CoffeeScript', 'coffee-script'),
        'Clientcide Libraries': new LibraryDescriptor('Clientcide.version'),
        'Crafty': new LibraryDescriptor('Crafty.init'),
        'CSS 3 Finalize': new LibraryDescriptor('$.cssFinalize', 'css3finalize'),
        'CSS 3 Pie': new LibraryDescriptor('PIE', 'css3pie'),
        'Cufón': new LibraryDescriptor('Cufon', 'cufon'),
        'D3': new LibraryDescriptor('d3.version', 'd3'),
        'Datejs': new LibraryDescriptor('Date.today', 'datejs'),
        'Davis.js': new LibraryDescriptor('Davis.version', 'davis.js'),
        'DD_belatedPNG': new LibraryDescriptor('DD_belatedPNG', 'dd_belatedpng'),
        'DocumentUp': new LibraryDescriptor('DocumentUp', 'documentup'),
        'DHTMLX': new LibraryDescriptor('dhtmlx'),
        'Dojo': new LibraryDescriptor('dojo.version', 'dojo'),
        'Dojo Mobile': new LibraryDescriptor('dojox.mobile'),
        'Ember': new LibraryDescriptor('Ember.VERSION', 'ember.js'),
        'Enyo': new LibraryDescriptor('enyo'),
        'Ext JS': new LibraryDescriptor(['Ext.version', 'Ext.versions.core.version'], 'ext-core'),
        'fancyBox': new LibraryDescriptor('$.fancybox.version', 'fancybox'),
        'flexie': new LibraryDescriptor('Flexie.version', 'flexie'),
        'Flot': new LibraryDescriptor('$.plot.version', 'flot'),
        'Galleria': new LibraryDescriptor('Galleria.version', 'galleria'),
        'Google Chrome Frame': new LibraryDescriptor('CFInstall', 'chrome-frame'),
        'g.Raphaël': new LibraryDescriptor('Raphael.fn.g', 'graphael'),
        'Glow': new LibraryDescriptor('glow.VERSION'),
        'Handlebars': new LibraryDescriptor('Handlebars.VERSION', 'handlebars.js'),
        'Head JS': new LibraryDescriptor('head.js', 'headjs'),
        'Highcharts JS': new LibraryDescriptor('Highcharts.version', 'highcharts'),
        'History.js': new LibraryDescriptor('History.Adapter', 'History.js'),
        'Hogan.js': new LibraryDescriptor('Hogan'),
        'html5shiv': new LibraryDescriptor('html5', 'html5shiv'),
        'ICanHaz.js': new LibraryDescriptor('ich.VERSION', 'ICanHaz.js'),
        'JS State Machine': new LibraryDescriptor('StateMachine.VERSION', 'javascript-state-machine'),
        'JavaScriptMVC': new LibraryDescriptor('steal.fn'),
        'jQuery': new LibraryDescriptor('jQuery.fn.jquery', 'jquery'),
        'jQuery Mobile': new LibraryDescriptor('jQuery.mobile'),
        'jQuery throttle / debounce': new LibraryDescriptor('jQuery.debounce', 'jquery-throttle-debounce'),
        'jQuery Tools': new LibraryDescriptor('jQuery.tools.version', 'jquery-tools'),
        'jQuery Cycle': new LibraryDescriptor('jQuery.fn.cycle.ver', 'jquery.cycle'),
        'jQuery UI': new LibraryDescriptor('$.ui.version', 'jqueryui'),
        'js-signals': new LibraryDescriptor('signals.VERSION', 'js-signals'),
        'JSXGraph': new LibraryDescriptor('JXG', 'jsxgraph'),
        'Kendo UI': new LibraryDescriptor('kendo'),
        'Knockout': new LibraryDescriptor('ko', 'knockout'),
        'LABjs': new LibraryDescriptor('$LAB', 'labjs'),
        'LESS': new LibraryDescriptor('less', 'less.js'),
        'LightningJS': new LibraryDescriptor('lightningjs'),
        'LungoJS': new LibraryDescriptor('LUNGO.VERSION'),
        'Masonry': new LibraryDescriptor('jQuery.fn.masonry', 'masonry'),
        'Midori': new LibraryDescriptor('midori.domReady'),
        'Modernizr': new LibraryDescriptor('Modernizr._version', 'modernizr'),
        'MochiKit': new LibraryDescriptor('MochiKit.MochiKit.VERSION'),
        'MooTools A.R.T.': new LibraryDescriptor('ART.version'),
        'MooTools Core': new LibraryDescriptor('MooTools.version', 'mootools'),
        'MooTools More': new LibraryDescriptor('MooTools.More.version'),
        'Mustache': new LibraryDescriptor('Mustache.version', 'mustache.js'),
        'Ninja UI': new LibraryDescriptor('jQuery.ninja.version', 'ninjaui'),
        'Noisy': new LibraryDescriptor('jQuery.fn.noisy', 'noisy'),
        'oCanvas': new LibraryDescriptor('oCanvas', 'ocanvas'),
        'o2.js': new LibraryDescriptor('o2.version'),
        'PageDown': new LibraryDescriptor('Markdown', 'pagedown'),
        'Prettify': new LibraryDescriptor('prettyPrint', 'prettify'),
        'Processing.js': new LibraryDescriptor('Processing.version', 'processing.js'),
        'Prototype': new LibraryDescriptor('Prototype.Version', 'prototype'),
        'PubNub': new LibraryDescriptor('PUBNUB', 'pubnub'),
        'Qooxdoo': new LibraryDescriptor('qx.$$libraries.qx.version'),
        'Raphaël': new LibraryDescriptor('Raphael.version', 'raphael'),
        'Rico': new LibraryDescriptor('Rico.Version'),
        'RightJS': new LibraryDescriptor('RightJS.version'),
        'Sammy': new LibraryDescriptor('Sammy.VERSION', 'sammy.js'),
        '$script.js': new LibraryDescriptor('$script', 'script.js'),
        'Script.aculo.us': new LibraryDescriptor('Scriptaculous.Version', 'scriptaculous'),
        'Scripty2': new LibraryDescriptor('S2.Version'),
        'Sencha Touch': new LibraryDescriptor('Ext.util.TapRepeater'),
        'Sizzle': new LibraryDescriptor('Sizzle', 'sizzle'),
        'Snack': new LibraryDescriptor('snack.v'),
        'Socket.io': new LibraryDescriptor('io.version', 'socket.io'),
        'Spine': new LibraryDescriptor('Spine.version', 'spinejs'),
        'SproutCore': new LibraryDescriptor('SC.isReady'),
        'Spry': new LibraryDescriptor('Spry.$'),
        'Sugar': new LibraryDescriptor('Object.SugarMethods'),
        'SWFObject': new LibraryDescriptor('swfobject', 'swfobject'),
        'Terrific': new LibraryDescriptor('Tc'),
        'Tiny Scrollbar': new LibraryDescriptor('jQuery.fn.tinyscrollbar', 'tinyscrollbar'),
        'Twitter Lib': new LibraryDescriptor('twitterlib', 'twitterlib.js'),
        'Underscore.js': new LibraryDescriptor('_.VERSION', 'underscore.js'),
        'Waypoints': new LibraryDescriptor('jQuery.waypoints', 'waypoints'),
        'Wink toolkit': new LibraryDescriptor('wink'),
        'WebFont Loader': new LibraryDescriptor('WebFont', 'webfont'),
        'xui': new LibraryDescriptor('x$', 'xuijs'),
        'yepnope.js': new LibraryDescriptor('yepnope', 'yepnope'),
        'YUI': new LibraryDescriptor(['YAHOO.VERSION', 'YUI.version'], 'yui'),
        'Zepto': new LibraryDescriptor('Zepto', 'zepto'),
        'ZK': new LibraryDescriptor('zk.version')
    };

    var itemDisplayStyles = { /* Styles for individual list items */
        'cursor': 'pointer',
        'text-align': 'left',
        'padding': '12px 16px',
        'margin': '0 0 8px',
        'list-style': 'none',
        'font': 'bold 12px Helvetica, Arial, sans-serif',
        'background': 'rgba(243, 243, 243, 0.9)',
        'color': '#666',
        'border-radius': '4px',
        'border': 'solid 1px rgba(255, 255, 255, 0.9)',
        'text-shadow': '0 1px 0 #fff',
        'box-shadow': '0 0 8px rgba(0, 0, 0, 0.6)',
        'float': 'right',
        'clear': 'both',
        'min-width': '170px'
    };

    var containerDisplayStyles = { /* Styles for the main unordered list container */
        'position': 'fixed',
        'padding': '0',
        'margin': '0',
        'right': '10px',
        'top': '10px',
        'z-index': 16777271
    };

    var linkDisplayStyles = { /* Styles for the hyperlinks within list items */
        'color': '#666',
        'font': 'bold 12px Helvetica, Arial, sans-serif',
        'text-decoration': 'none'
    };

    var rootElementProperties = { /* Configuration properties for the primary container */
        id: 'library_detection_panel',
        onclick: removalProcedure
    };

    listContainerElement = document.createElement('ul');

    for (var attributeName in rootElementProperties) {
        listContainerElement[attributeName] = rootElementProperties[attributeName];
    }

    applyVisualStyling(listContainerElement, containerDisplayStyles);

    document.body.appendChild(listContainerElement);

    var presentLibraryDetails = function (libraryNameString, detectedVersionString) {
        /* Displays information about a detected library */
        var availablePackages = window.globalLibraryPackages,
            tempHolder;

        // Retrieve supplementary data from CDNJS if available
        var cdnDetails = (knownSoftwareLibraries[libraryNameString] && availablePackages[knownSoftwareLibraries[libraryNameString].cdnIdentifier])
            ? availablePackages[knownSoftwareLibraries[libraryNameString].cdnIdentifier] : null;

        var currentStableVersion = (cdnDetails) ? cdnDetails.version : null,
            libraryHomePage = (cdnDetails) ? cdnDetails.homepage : '#',
            libraryDescription = (cdnDetails) ? cdnDetails.description : '';

        if (currentStableVersion !== null) {
            libraryDescription += ' (Latest version: ' + currentStableVersion + ')';
        }

        listItemElements = document.createElement('li');

        var libraryLinkElement = document.createElement('a');
        libraryLinkElement.href = libraryHomePage;
        libraryLinkElement.title = libraryDescription;
        libraryLinkElement.appendChild(document.createTextNode(libraryNameString));
        applyVisualStyling(libraryLinkElement, linkDisplayStyles);

        listItemElements.appendChild(libraryLinkElement);

        if (detectedVersionString && (detectedVersionString !== '%build%')) {
            listItemElements.appendChild(document.createTextNode(' ('));

            if (currentStableVersion !== null) {
                var versionSpanElement = document.createElement('span');
                versionSpanElement.style.color = (currentStableVersion !== detectedVersionString) ? '#f33' : '#090';
                versionSpanElement.appendChild(document.createTextNode(detectedVersionString));
                listItemElements.appendChild(versionSpanElement);
            } else {
                listItemElements.appendChild(document.createTextNode(detectedVersionString));
            }

            listItemElements.appendChild(document.createTextNode(')'));
        }

        applyVisualStyling(listItemElements, itemDisplayStyles);
        listContainerElement.appendChild(listItemElements);
    };

    var scanForKnownLibraries = function () {
        /* Iterates through predefined libraries and checks for their existence in the global scope */
        var detectedCount = 0;

        for (var libKey in knownSoftwareLibraries) {
            if (knownSoftwareLibraries.hasOwnProperty(libKey)) {
                // Iterate through all potential version paths for the current library
                for (var pathIdx = 0; pathIdx < knownSoftwareLibraries[libKey].versioningPaths.length; pathIdx++) {
                    var currentScopeReference = window,
                        versionPathString = knownSoftwareLibraries[libKey].versioningPaths[pathIdx];

                    // Traverse the object path to check for existence
                    for (var segmentIdx = 0, pathSegments = versionPathString.split('.'); segmentIdx < pathSegments.length; segmentIdx++) {
                        currentScopeReference = currentScopeReference && currentScopeReference[pathSegments[segmentIdx]];
                    }
                    if (currentScopeReference) {
                        var foundVersion = false;
                        if (typeof currentScopeReference === 'string' && !currentScopeReference.match(/^<%=/)) {
                            foundVersion = currentScopeReference;
                        } else if (typeof currentScopeReference === 'object' && currentScopeReference.hasOwnProperty('toString')) {
                            foundVersion = currentScopeReference.toString();
                        }
                        if (foundVersion !== false) {
                            foundVersion = foundVersion.replace(/\s*\(.+\)\s*/, ''); /* Remove build numbers like "(12345)" */
                        }

                        presentLibraryDetails(libKey, foundVersion);
                        detectedCount++;
                        break; /* Move to the next library after finding one version path */
                    }
                }
            }
        }

        if (!detectedCount) {
            presentLibraryDetails('No known library detected.');
        }
    };

    if (!window.globalLibraryPackages) {
        /* If package data isn't cached, load it from CDNJS via YQL JSONP */
        window.jsonpResponseHandler = function (jsonPayload) {
            var retrievedPackages = jsonPayload.query.results.json.packages;
            var packageHashmap = {};
            for (var idx = 0; idx < retrievedPackages.length; idx++) {
                if (retrievedPackages[idx]) {
                    packageHashmap[retrievedPackages[idx].name.toLowerCase()] = retrievedPackages[idx];
                }
            }
            window.globalLibraryPackages = packageHashmap;
            scanForKnownLibraries();
        };

        var jsonpScriptElement = document.createElement('script');
        jsonpScriptElement.setAttribute('src', "//query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D'http%3A%2F%2Fwww.cdnjs.com%2Fpackages.min.json'&format=json&callback=jsonpResponseHandler");
        document.getElementsByTagName('head')[0].appendChild(jsonpScriptElement);
    } else {
        scanForKnownLibraries();
    }
})();