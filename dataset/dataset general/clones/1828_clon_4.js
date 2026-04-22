(function() {
    const DISPLAY_CONTAINER_ID = '_library_monitor_display_area';
    const CDNJS_DATA_CACHE_KEY = '_ld_cdn_packages';
    const JSONP_CALLBACK_NAME = '_ld_pkg_data_handler';

    const CDNJS_YQL_URL = "//query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D'http%3A%2F%2Fwww.cdnjs.com%2Fpackages.min.json'&format=json&callback=" + JSONP_CALLBACK_NAME;

    const elementStyles = {
        container: {
            'position': 'fixed',
            'padding': '0',
            'margin': '0',
            'right': '10px',
            'top': '10px',
            'z-index': '16777271',
            'font-family': 'Helvetica, Arial, sans-serif',
            'display': 'flex',
            'flex-direction': 'column',
            'gap': '8px'
        },
        item: {
            'cursor': 'pointer',
            'text-align': 'left',
            'padding': '12px 16px',
            'background': 'rgba(243, 243, 243, 0.9)',
            'color': '#666',
            'border-radius': '4px',
            'border': 'solid 1px rgba(255, 255, 255, 0.9)',
            'text-shadow': '0 1px 0 #fff',
            'box-shadow': '0 0 8px rgba(0, 0, 0, 0.6)',
            'min-width': '170px'
        },
        link: {
            'color': '#666',
            'font-weight': 'bold',
            'font-size': '12px',
            'text-decoration': 'none'
        },
        versionMatch: {
            'color': '#090'
        },
        versionMismatch: {
            'color': '#f33'
        }
    };

    const libraryCatalog = [
        { id: 'Ace', checkPaths: ['ace'], cdnId: 'ace' },
        { id: 'ActiveJS', checkPaths: ['ActiveSupport'] },
        { id: 'AngularJS', checkPaths: ['angular.version.full'] },
        { id: 'Backbone.js', checkPaths: ['Backbone.VERSION'], cdnId: 'backbone.js' },
        { id: 'Backbone localStorage', checkPaths: ['Store'], cdnId: 'backbone-localstorage.js' },
        { id: 'Base2', checkPaths: ['base2.version'] },
        { id: 'Batman.js', checkPaths: ['Batman'] },
        { id: 'CamanJS', checkPaths: ['Caman.version.release'], cdnId: 'camanjs' },
        { id: 'Chainvas', checkPaths: ['Chainvas'] },
        { id: 'CoffeeScript', checkPaths: ['CoffeeScript'], cdnId: 'coffee-script' },
        { id: 'Clientcide Libraries', checkPaths: ['Clientcide.version'] },
        { id: 'Crafty', checkPaths: ['Crafty.init'] },
        { id: 'CSS 3 Finalize', checkPaths: ['$.cssFinalize'], cdnId: 'css3finalize' },
        { id: 'CSS 3 Pie', checkPaths: ['PIE'], cdnId: 'css3pie' },
        { id: 'Cufón', checkPaths: ['Cufon'], cdnId: 'cufon' },
        { id: 'D3', checkPaths: ['d3.version'], cdnId: 'd3' },
        { id: 'Datejs', checkPaths: ['Date.today'], cdnId: 'datejs' },
        { id: 'Davis.js', checkPaths: ['Davis.version'], cdnId: 'davis.js' },
        { id: 'DD_belatedPNG', checkPaths: ['DD_belatedPNG'], cdnId: 'dd_belatedpng' },
        { id: 'DocumentUp', checkPaths: ['DocumentUp'], cdnId: 'documentup' },
        { id: 'DHTMLX', checkPaths: ['dhtmlx'] },
        { id: 'Dojo', checkPaths: ['dojo.version'], cdnId: 'dojo' },
        { id: 'Dojo Mobile', checkPaths: ['dojox.mobile'] },
        { id: 'Ember', checkPaths: ['Ember.VERSION'], cdnId: 'ember.js' },
        { id: 'Enyo', checkPaths: ['enyo'] },
        { id: 'Ext JS', checkPaths: [['Ext.version','Ext.versions.core.version']], cdnId: 'ext-core' },
        { id: 'fancyBox', checkPaths: ['$.fancybox.version'], cdnId: 'fancybox' },
        { id: 'flexie', checkPaths: ['Flexie.version'], cdnId: 'flexie' },
        { id: 'Flot', checkPaths: ['$.plot.version'], cdnId: 'flot' },
        { id: 'Galleria', checkPaths: ['Galleria.version'], cdnId: 'galleria' },
        { id: 'Google Chrome Frame', checkPaths: ['CFInstall'], cdnId: 'chrome-frame' },
        { id: 'g.Raphaël', checkPaths: ['Raphael.fn.g'], cdnId: 'graphael' },
        { id: 'Glow', checkPaths: ['glow.VERSION'] },
        { id: 'Handlebars', checkPaths: ['Handlebars.VERSION'], cdnId: 'handlebars.js' },
        { id: 'Head JS', checkPaths: ['head.js'], cdnId: 'headjs' },
        { id: 'Highcharts JS', checkPaths: ['Highcharts.version'], cdnId: 'highcharts' },
        { id: 'History.js', checkPaths: ['History.Adapter'], cdnId: 'History.js' },
        { id: 'Hogan.js', checkPaths: ['Hogan'] },
        { id: 'html5shiv', checkPaths: ['html5'], cdnId: 'html5shiv' },
        { id: 'ICanHaz.js', checkPaths: ['ich.VERSION'], cdnId: 'ICanHaz.js' },
        { id: 'JS State Machine', checkPaths: ['StateMachine.VERSION'], cdnId: 'javascript-state-machine' },
        { id: 'JavaScriptMVC', checkPaths: ['steal.fn'] },
        { id: 'jQuery', checkPaths: ['jQuery.fn.jquery'], cdnId: 'jquery' },
        { id: 'jQuery Mobile', checkPaths: ['jQuery.mobile'] },
        { id: 'jQuery throttle / debounce', checkPaths: ['jQuery.debounce'], cdnId: 'jquery-throttle-debounce' },
        { id: 'jQuery Tools', checkPaths: ['jQuery.tools.version'], cdnId: 'jquery-tools' },
        { id: 'jQuery Cycle', checkPaths: ['jQuery.fn.cycle.ver'], cdnId: 'jquery.cycle' },
        { id: 'jQuery UI', checkPaths: ['$.ui.version'], cdnId: 'jqueryui' },
        { id: 'js-signals', checkPaths: ['signals.VERSION'], cdnId: 'js-signals' },
        { id: 'JSXGraph', checkPaths: ['JXG'], cdnId: 'jsxgraph' },
        { id: 'Kendo UI', checkPaths: ['kendo'] },
        { id: 'Knockout', checkPaths: ['ko'], cdnId: 'knockout' },
        { id: 'LABjs', checkPaths: ['$LAB'], cdnId: 'labjs' },
        { id: 'LESS', checkPaths: ['less'], cdnId: 'less.js' },
        { id: 'LightningJS', checkPaths: ['lightningjs'] },
        { id: 'LungoJS', checkPaths: ['LUNGO.VERSION'] },
        { id: 'Masonry', checkPaths: ['jQuery.fn.masonry'], cdnId: 'masonry' },
        { id: 'Midori', checkPaths: ['midori.domReady'] },
        { id: 'Modernizr', checkPaths: ['Modernizr._version'], cdnId: 'modernizr' },
        { id: 'MochiKit', checkPaths: ['MochiKit.MochiKit.VERSION'] },
        { id: 'MooTools A.R.T.', checkPaths: ['ART.version'] },
        { id: 'MooTools Core', checkPaths: ['MooTools.version'], cdnId: 'mootools' },
        { id: 'MooTools More', checkPaths: ['MooTools.More.version'] },
        { id: 'Mustache', checkPaths: ['Mustache.version'], cdnId: 'mustache.js' },
        { id: 'Ninja UI', checkPaths: ['jQuery.ninja.version'], cdnId: 'ninjaui' },
        { id: 'Noisy', checkPaths: ['jQuery.fn.noisy'], cdnId: 'noisy' },
        { id: 'oCanvas', checkPaths: ['oCanvas'], cdnId: 'ocanvas' },
        { id: 'o2.js', checkPaths: ['o2.version'] },
        { id: 'PageDown', checkPaths: ['Markdown'], cdnId: 'pagedown' },
        { id: 'Prettify', checkPaths: ['prettyPrint'], cdnId: 'prettify' },
        { id: 'Processing.js', checkPaths: ['Processing.version'], cdnId: 'processing.js' },
        { id: 'Prototype', checkPaths: ['Prototype.Version'], cdnId: 'prototype' },
        { id: 'PubNub', checkPaths: ['PUBNUB'], cdnId: 'pubnub' },
        { id: 'Qooxdoo', checkPaths: ['qx.$$libraries.qx.version'] },
        { id: 'Raphaël', checkPaths: ['Raphael.version'], cdnId: 'raphael' },
        { id: 'Rico', checkPaths: ['Rico.Version'] },
        { id: 'RightJS', checkPaths: ['RightJS.version'] },
        { id: 'Sammy', checkPaths: ['Sammy.VERSION'], cdnId: 'sammy.js' },
        { id: '$script.js', checkPaths: ['$script'], cdnId: 'script.js' },
        { id: 'Script.aculo.us', checkPaths: ['Scriptaculous.Version'], cdnId: 'scriptaculous' },
        { id: 'Scripty2', checkPaths: ['S2.Version'] },
        { id: 'Sencha Touch', checkPaths: ['Ext.util.TapRepeater'] },
        { id: 'Sizzle', checkPaths: ['Sizzle'], cdnId: 'sizzle' },
        { id: 'Snack', checkPaths: ['snack.v'] },
        { id: 'Socket.io', checkPaths: ['io.version'], cdnId: 'socket.io' },
        { id: 'Spine', checkPaths: ['Spine.version'], cdnId: 'spinejs' },
        { id: 'SproutCore', checkPaths: ['SC.isReady'] },
        { id: 'Spry', checkPaths: ['Spry.$'] },
        { id: 'Sugar', checkPaths: ['Object.SugarMethods'] },
        { id: 'SWFObject', checkPaths: ['swfobject'], cdnId: 'swfobject' },
        { id: 'Terrific', checkPaths: ['Tc'] },
        { id: 'Tiny Scrollbar', checkPaths: ['jQuery.fn.tinyscrollbar'], cdnId: 'tinyscrollbar' },
        { id: 'Twitter Lib', checkPaths: ['twitterlib'], cdnId: 'twitterlib.js' },
        { id: 'Underscore.js', checkPaths: ['_.VERSION'], cdnId: 'underscore.js' },
        { id: 'Waypoints', checkPaths: ['jQuery.waypoints'], cdnId: 'waypoints' },
        { id: 'Wink toolkit', checkPaths: ['wink'] },
        { id: 'WebFont Loader', checkPaths: ['WebFont'], cdnId: 'webfont' },
        { id: 'xui', checkPaths: ['x$'], cdnId: 'xuijs' },
        { id: 'yepnope.js', checkPaths: ['yepnope'], cdnId: 'yepnope' },
        { id: 'YUI', checkPaths: [['YAHOO.VERSION', 'YUI.version']], cdnId: 'yui' },
        { id: 'Zepto', checkPaths: ['Zepto'], cdnId: 'zepto' },
        { id: 'ZK', checkPaths: ['zk.version'] }
    ];

    const applyCssMap = (element, properties) => {
        Object.entries(properties).forEach(([prop, value]) => {
            if (typeof element.style.setProperty !== 'undefined') {
                element.style.setProperty(prop, value, null);
            } else {
                element.style[prop] = value;
            }
        });
    };

    const createStyledElement = (tagName, attrs = {}, styles = {}, children = []) => {
        const el = document.createElement(tagName);
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'className') {
                el.className = value;
            } else {
                el.setAttribute(key, value);
            }
        });

        applyCssMap(el, styles);

        [].concat(children).flat().filter(Boolean).forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                el.appendChild(child);
            }
        });
        return el;
    };

    const getNestedValue = (obj, path) => {
        const pathSegments = path.split('.');
        return pathSegments.reduce((current, segment) => {
            const actualSegment = (segment === '$' && current === window) ? 'jQuery' : segment;
            return (current && typeof current === 'object' && actualSegment in current) ? current[actualSegment] : undefined;
        }, obj);
    };

    const existingMonitor = document.getElementById(DISPLAY_CONTAINER_ID);
    if (existingMonitor) {
        document.body.removeChild(existingMonitor);
        return;
    }

    let displayContainer;

    const dismantleDisplay = () => {
        if (displayContainer && document.body.contains(displayContainer)) {
            document.body.removeChild(displayContainer);
        }
    };

    displayContainer = createStyledElement('div',
        { id: DISPLAY_CONTAINER_ID, onclick: dismantleDisplay },
        elementStyles.container
    );
    document.body.appendChild(displayContainer);

    const renderLibraryEntry = (libraryName, detectedVersion, cdnData = null) => {
        const cdnPackageDef = libraryCatalog.find(item => item.id === libraryName);
        const cdnPackage = (cdnData && cdnPackageDef && cdnPackageDef.cdnId)
                         ? cdnData[cdnPackageDef.cdnId]
                         : null;

        const latestCdnVersion = cdnPackage?.version || null;
        const homepage = cdnPackage?.homepage || '#';
        let descriptionText = cdnPackage?.description || '';

        if (latestCdnVersion !== null) {
            descriptionText += ` (Latest: ${latestCdnVersion})`;
        }

        const linkAttrs = {
            href: homepage,
            title: descriptionText,
            target: '_blank'
        };

        const versionNameSegment = [];
        if (detectedVersion && detectedVersion !== '%build%') {
            versionNameSegment.push(' (');
            if (latestCdnVersion !== null) {
                const versionSpanStyle = (latestCdnVersion !== detectedVersion) ? elementStyles.versionMismatch : elementStyles.versionMatch;
                versionNameSegment.push(createStyledElement('span', {}, versionSpanStyle, detectedVersion));
            } else {
                versionNameSegment.push(detectedVersion);
            }
            versionNameSegment.push(')');
        }

        const libraryLink = createStyledElement('a', linkAttrs, elementStyles.link, libraryName);
        const libraryEntry = createStyledElement('div', {}, elementStyles.item, [libraryLink, ...versionNameSegment]);

        displayContainer.appendChild(libraryEntry);
    };

    const performLibraryDetection = () => {
        let foundCount = 0;
        const cdnPackages = window[CDNJS_DATA_CACHE_KEY] || {};

        libraryCatalog.forEach(lib => {
            const pathsToProbe = Array.isArray(lib.checkPaths[0]) ? lib.checkPaths[0] : lib.checkPaths;

            for (const path of pathsToProbe) {
                let detectedRef = getNestedValue(window, path);

                if (detectedRef !== undefined) {
                    let determinedVersion = false;
                    if (typeof detectedRef === 'string' && !detectedRef.match(/^<%=/)) {
                        determinedVersion = detectedRef;
                    } else if (typeof detectedRef === 'object' && typeof detectedRef.toString === 'function' && detectedRef.toString !== Object.prototype.toString) {
                        determinedVersion = detectedRef.toString();
                    }

                    if (determinedVersion !== false) {
                        determinedVersion = String(determinedVersion).replace(/\s*\(.+\)\s*/, '');
                    }

                    renderLibraryEntry(lib.id, determinedVersion, cdnPackages);
                    foundCount++;
                    break;
                }
            }
        });

        if (foundCount === 0) {
            renderLibraryEntry('No known framework detected.', false);
        }
    };

    if (!window[CDNJS_DATA_CACHE_KEY]) {
        window[JSONP_CALLBACK_NAME] = (jsonResponse) => {
            const packageList = jsonResponse.query.results.json.packages;
            const packageMap = packageList.reduce((acc, pkg) => {
                if (pkg && pkg.name) {
                    acc[pkg.name.toLowerCase()] = pkg;
                }
                return acc;
            }, {});
            window[CDNJS_DATA_CACHE_KEY] = packageMap;
            performLibraryDetection();
            delete window[JSONP_CALLBACK_NAME];
        };

        const jsonpScript = document.createElement('script');
        jsonpScript.setAttribute('src', CDNJS_YQL_URL);
        document.head.appendChild(jsonpScript);
    } else {
        performLibraryDetection();
    }
})();