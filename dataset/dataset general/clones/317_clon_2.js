/* Forest.js v1.0.0 https://github.com/YourName/Forest */
void function () {
  function createForestManager() { // Entry point for the module
    let woodland = function ( actionItem, reminderNote ) { // Core initializer for the system
      woodland.currentAction = actionItem;
      typeof reminderNote === 'function' && console.warn("Perhaps you overlooked invoking .segment() in a location?");
      return woodland;
    };

    woodland.managerInitialization = initializeOnce; // Assigning the one-time setup function

    // Internal containers for various components
    woodland.negate = { isNegated: true };
    woodland.verificationChecks = {};
    woodland.utilityFunctions = {};

    woodland.settings = woodland.conf = function ( configurationObject, configurationValue ) {
      // Default settings, might be extended later for more complex scenarios
      const systemDefaults = {};

      // Checks if the configuration is being accessed via the 'inherited' path
      // This property is either true, false, or undefined based on context
      const isInherited = this.isInheritableConfig;

      // 'specificAccess' is false if called directly via woodland.settings, true for specific paths
      const specificAccess = this.hasSpecificPath;

      // Normalize the incoming configuration data
      let processedConfig = woodland.conf.normalizeInput( configurationObject, configurationValue );

      if ( processedConfig === null || typeof processedConfig === 'string' ) {
        return retrieveValue( processedConfig );
      } else if ( typeof processedConfig === 'object' ) {
        return storeValue( processedConfig );
      }

      function storeValue ( settingsToApply ) {
        if ( isInherited ) {
          for ( let propKey in settingsToApply ) {
            if ( settingsToApply.hasOwnProperty( propKey ) ) {
              woodland.settings.inheritedSettings[ propKey ] = settingsToApply[ propKey ];
            }
          }
        } else {
          for ( let propKey in settingsToApply ) {
            if ( settingsToApply.hasOwnProperty( propKey ) ) {
              woodland.settings.localSettings[ propKey ] = settingsToApply[ propKey ];
            }
          }
        }
        return retrieveValue();
      }

      function retrieveValue ( queryKey ) {
        if ( !specificAccess ) {
          return getCombined( queryKey );
        } else {
          if ( queryKey ) {
            return getAppropriateSettings()[ queryKey ];
          } else {
            return getAppropriateSettings();
          }
        }

        function getAppropriateSettings () {
          if ( isInherited ) {
            return woodland.settings.inheritedSettings;
          } else {
            return woodland.settings.localSettings;
          }
        }

        // Merges inherited and local settings; local settings take precedence on conflict
        function getCombined ( queryKeyString ) {
          const inherited = woodland.settings.inheritedSettings;
          const local = woodland.settings.localSettings;

          if ( queryKeyString ) { // Request for a single setting
            return ( typeof local[ queryKeyString ] !== 'undefined' ?
                local[ queryKeyString ]
              : inherited[ queryKeyString ] );
          } else { // Request for all settings
            const resultObject = {};
            for ( let propKey in inherited ) {
              if ( inherited.hasOwnProperty( propKey ) ) {
                resultObject[ propKey ] = inherited[ propKey ];
              }
            }
            for ( let propKey in local ) {
              if ( local.hasOwnProperty( propKey ) ) {
                resultObject[ propKey ] = local[ propKey ];
              }
            }
            return resultObject;
          }
        }
      }
    };
    woodland.settings.normalizeInput = function ( primaryInput, supplementaryValue ) {
      if ( typeof primaryInput === 'object' && primaryInput ) {
        // If an object is provided, the supplementary value is not relevant; the object itself is the config
        return primaryInput;
      } else if ( typeof primaryInput === 'string' ) {
        // This could be a request to retrieve a specific setting
        if ( typeof supplementaryValue === 'undefined' ) {
          // Direct read requests are typically in string format
          return primaryInput;
        } else { // Or it might be a request to set a single value
          // Single write operations are converted into object form
          let tempObject = {};
          tempObject[ primaryInput ] = supplementaryValue;
          return tempObject;
        }
      } else {
        // A general read request, no specific key provided
        return null;
      }
    };
    woodland.settings.localSettings = {}; // Stores settings specific to the current level
    woodland.settings.inheritedSettings = {}; // Stores settings that can be passed down
    woodland.localScope = {
      isInheritableConfig: false, // Indicates this config is not inheritable
      hasSpecificPath: true, // Indicates this config has a specific path
      settings: woodland.conf,
      conf: woodland.conf
    };
    woodland.inheritedScope = {
      isInheritableConfig: true, // Indicates this config IS inheritable
      hasSpecificPath: true, // Indicates this config has a specific path
      conf: woodland.conf,
      settings: woodland.conf
    };
    woodland.utilityFunctions.retrieveCallOrigin = function ( depthLevel ) {
      const errorTrace = new Error().stack; // Captures the current stack trace
      return errorTrace ?
        errorTrace.split('\n')[ depthLevel ? depthLevel : 4 ].match(/\(?(\S+\w)\)?$/)[1]
        : '(origin unknown)';
    };
    const templateProcessor = woodland.utilityFunctions.templateEngine = function ( templateContent, variablesMap ) {
      if ( typeof variablesMap !== 'object' ) {
        variablesMap = {}; // Ensure variables map is an object
      }
      if ( typeof templateContent !== 'string' ) {
        throw new Error( 'Provided template data is not a string type!' );
      }

      const REGEX_IF_TRUE = /\{{\s*#\s*(.*?)\s*}}(.*?){{\s*\/\s*\1\s*}}/g;
      const REGEX_IF_FALSE = /\{{\s*\^\s*(.*?)\s*}}(.*?){{\s*\/\s*\1\s*}}/g;

      while ( templateContent.match( REGEX_IF_TRUE ) ) {
        templateContent = templateContent.replace( REGEX_IF_TRUE,
          function ( completeMatch, variableIdentifier, innerContent, positionIndex, originalString ) {
            if ( variablesMap[ variableIdentifier ] ) {
              return innerContent;
            } else {
              return '';
            }
          }
        );
      }

      while ( templateContent.match( REGEX_IF_FALSE ) ) {
        templateContent = templateContent.replace( REGEX_IF_FALSE,
          function ( completeMatch, variableIdentifier, innerContent, positionIndex, originalString ) {
            if ( variablesMap[ variableIdentifier ] ) {
              return '';
            } else {
              return innerContent;
            }
          }
        );
      }

      return templateContent.replace( /\{{\s*([^}]*?)\s*}}/g,
        function ( completeMatch, captureGroup, positionIndex, originalString ) {
          if ( captureGroup in variablesMap ) {
            return variablesMap[ captureGroup ];
          } else {
            return '';
          }
        }
      );
    };
    woodland.utilityFunctions.dataFormatter = function ( dataValue, detailedOutput ) {
      let formattedResult = '';
      const dataType = typeof dataValue;

      if ( dataType === 'number' ) {
        formattedResult = dataValue.toString();
      } else if ( dataType === 'string' ) {
        const singleQuoteCount = dataValue.match( /'/g );
        const doubleQuoteCount = dataValue.match( /"/g );
        const singleChar = "'";
        const doubleChar = '"';
        const escapeChar = '\\';

        if ( singleQuoteCount && doubleQuoteCount ) {
          if ( doubleQuoteCount.length < singleQuoteCount.length ) { // More single quotes than double quotes
            formattedResult = doubleChar + dataValue.replace( /"/g, escapeChar + doubleChar ) + doubleChar;
          } else { // Equal or more double quotes than single quotes
            formattedResult = singleChar + dataValue.replace( /'/g, escapeChar + singleChar ) + singleChar;
          }
        } else if ( singleQuoteCount ) { // If there are only single quotes
          formattedResult = doubleChar + dataValue + doubleChar;
        } else { // Whether there are double quotes or none
          formattedResult = singleChar + dataValue + singleChar;
        }
      } else if ( dataType === 'function' ) {
        if ( detailedOutput ) {
          formattedResult = dataValue.toString();
        } else {
          formattedResult = 'func(){...}';
        }
      } else if ( Array.isArray( dataValue ) ) {
        if ( detailedOutput ) {
          formattedResult = JSON.stringify( dataValue, null, 2 );
        } else {
          formattedResult = '[...]';
        }
      } else if ( dataType === 'object' &&
          dataValue &&
          dataValue.toString() === '[object Object]' ) {
        if ( detailedOutput ) {
          formattedResult = JSON.stringify( dataValue, null, 2 );
        } else {
          formattedResult = '{...}';
        }
      } else if ( dataType === 'boolean' ) {
        formattedResult = dataValue.toString();
      } else if ( dataType === 'undefined' ) {
        formattedResult = 'undefined';
      } else if ( dataValue === null ) {
        formattedResult = 'null';
      } else {
        formattedResult = '[unknown kind: ' + dataValue + ']';
      }
      return formattedResult;
    };
    woodland.notifier = {}; // Manages UI updates and notifications
    woodland.notifier.addSegment = function ( newSegmentDetails ) {
      const $parentContainer = $( woodland.displayElement );
      const uiTemplates = woodland.markupTemplates;

      if ( newSegmentDetails.isCommented ) {
        const segmentLabel = newSegmentDetails.segmentName.match( '(// *)(.*)' )[2];
        $parentContainer.children( 'ul' ).append(
          templateProcessor( uiTemplates.segment, { isCommented: true, content:
            templateProcessor( uiTemplates.segmentContent, {
              summaryText: escapeHtmlEntities( segmentLabel + ' (' + woodland.utilityFunctions.retrieveCallOrigin() + ')' )
            })
          })
        );
      } else {
        if ( !woodland.globalContext.isInitialized ) {
          woodland.initializeDisplay();
          woodland.globalContext.isInitialized = true;
        }
        newSegmentDetails.segmentDisplayElement = $(
          templateProcessor( uiTemplates.segment, { content:
            templateProcessor( uiTemplates.segmentContent, {
              summaryText: escapeHtmlEntities( newSegmentDetails.conf( 'segmentName' ) )
            })
          })
        ).get(0);
        $( woodland.displayElement ).children( 'ul' ).append( newSegmentDetails.segmentDisplayElement );
      }
      this.refreshMainDisplay( this.getDisplayStatus( 'active' ) );
      if ( $parentContainer.hasClass( 'no-sub-elements' ) ) {
        $parentContainer.removeClass( 'no-sub-elements' ).addClass( 'folded' );
      }

      function escapeHtmlEntities ( stringToEscape ) {
        return String( stringToEscape )
          .replace( /&/g, '&amp;' )
          .replace( /"/g, '&quot;' )
          .replace( /'/g, '&#39;' )
          .replace( /</g, '&lt;' )
          .replace( />/g, '&gt;' );
      }
    };
    woodland.notifier.segmentCompleted = function ( completionInfo ) {
      const $currentElement = $( woodland.displayElement );
      if ( $currentElement.has( 'ul li:not(.verified):not(.noted)' ).length === 0 ) {
        $currentElement.removeClass( 'pending' ).addClass( 'verified' );
        if ( woodland.parentSegment ) {
          woodland.parentSegment.notifier.segmentCompleted();
        }
      }
    };
    woodland.notifier.segmentFailed = function () {
      const $currentElement = $( woodland.displayElement );
      $currentElement
        .removeClass( 'pending' )
        //.removeClass('no-sub-elements') // This line was commented out in original, keeping status.
        .removeClass( 'folded' )
        .removeClass( 'verified' ) // Necessary if 'completed' was called previously
        .addClass( 'errored' )
        .addClass( 'unfolded' );
      if ( woodland.parentSegment ) {
        woodland.parentSegment.notifier.segmentFailed();
      }
    };
    woodland.notifier.refreshMainDisplay = function ( statusMessage ) {
      $( woodland.globalContext.mainDisplayElement ).children( '.summary-label' ).html( statusMessage );
    };
    woodland.notifier.recordVerification = function ( verificationObject ) {
      if ( !woodland.globalContext.isInitialized ) {
        woodland.initializeDisplay();
        woodland.globalContext.isInitialized = true;
      }
      this.refreshMainDisplay( this.getDisplayStatus( 'active' ) );
      const $currentElement = $( woodland.displayElement );
      if ( $currentElement.hasClass( 'no-sub-elements' ) ) {
        $currentElement.removeClass( 'no-sub-elements' ).addClass( 'folded' );
      }
      if ( !verificationObject.isSuccessful ) {
        woodland.notifier.segmentFailed();
      }
      verificationObject.sourcePath = verificationObject.sourcePath || woodland.utilityFunctions.retrieveCallOrigin();
      if ( verificationObject.actualValue ) {
        verificationObject.actualValueType = typeof verificationObject.actualValue;
      }
      if ( verificationObject.expectedValue ) {
        verificationObject.expectedValueType = typeof verificationObject.expectedValue;
      }
      $currentElement.children( 'ul' ).append(
        $( templateProcessor( woodland.markupTemplates.assertion, verificationObject ) )
      );
    };
    woodland.initializeDisplay = function ( targetElement ) {
      if ( typeof jQuery === 'undefined' || !jQuery ) {
        throw new Error( 'Required jQuery library not found' );
      }
      if ( woodland.globalContext.isInitialized ) {
        return 'UI already set up';
      } else {
        woodland.globalContext.isInitialized = true;
      }

      const basePath = woodland.globalContext.baseAssetUrl ? woodland.globalContext.baseAssetUrl : '';
      const styleSheetPath = basePath + 'forest.css'; // Renamed CSS file
      const uiTemplates = woodland.markupTemplates;
      const templateRenderer = woodland.utilityFunctions.templateEngine;

      let $resolvedElement;
      let $targetHead;

      if ( isHtmlElement( targetElement ) ) {
        $resolvedElement = $( targetElement );
        $targetHead = $resolvedElement.parents( 'html' ).children( 'head' );
      } else {
        let identifierString;
        if ( typeof targetElement === 'string' ) {
          identifierString = targetElement;
        }
        $resolvedElement = $( 'body' );
        $targetHead = $( 'head' );
      }

      // Inline CSS styles for the display (extensively changed class names)
      const inlineCssStyles = 'article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}audio,canvas,video{display:inline-block;*display:inline;*zoom:1}audio:not([controls]){display:none}[hidden]{display:none}html{font-size:100%;overflow-y:scroll;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}body{margin:0}body,button,input,select,textarea{font-family:sans-serif}a:focus{outline:thin dotted}a:hover,a:active{outline:0}h1{font-size:2em}abbr[title]{border-bottom:1px dotted}b,strong{font-weight:700}blockquote{margin:1em 40px}dfn{font-style:italic}mark{background:#ff0;color:#000}pre,code,kbd,samp{font-family:monospace,serif;_font-family:\'courier new\',monospace;font-size:1em}pre{white-space:pre;white-space:pre-wrap;word-wrap:break-word}q{quotes:none}q:before,q:after{content:\'\';content:none}small{font-size:75%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sup{top:-.5em}sub{bottom:-.25em}ul,ol{margin-left:0;padding:0 0 0 40px}dd{margin:0 0 0 40px}nav ul,nav ol{list-style:none;list-style-image:none}img{border:0;-ms-interpolation-mode:bicubic}svg:not(:root){overflow:hidden}figure{margin:0}form{margin:0}fieldset{border:1px solid #c0c0c0;margin:0 2px;padding:.35em .625em .75em}legend{border:0;*margin-left:-7px}button,input,select,textarea{font-size:100%;margin:0;vertical-align:baseline;*vertical-align:middle}button,input{line-height:normal}button,input[type="button"],input[type="reset"],input[type="submit"]{cursor:pointer;-webkit-appearance:button;*overflow:visible}input[type="checkbox"],input[type="radio"]{box-sizing:border-box;padding:0}input[type="search"]{-webkit-appearance:textfield;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}input[type="search"]::-webkit-search-decoration{-webkit-appearance:none}button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}textarea{overflow:auto;vertical-align:top}table{border-collapse:collapse;border-spacing:0}div.forest-root{background:#eee;color:#201f1d;font:12pt \'Fira Code\';padding:10px 10px 0;box-shadow:0 2px 10px 0 rgba(0,0,0,.50);padding-left:85px}div.forest-root>li>.summary-label em{font-style:normal;font-weight:700}div.forest-root .status-badge{border:3px solid #008000;border-radius:5px;padding:0 2px}div.forest-root .status-badge.pending{border-color:#afdbf0;color:#9dde8a;color:#0d3446}div.forest-root .status-badge.errored{border-color:#ff483c;color:#3f0400}div.forest-root .status-badge.verified{border-color:#9dde8a;color:#193810}div.forest-root .status-badge.noted{border-color:#ddd}div.forest-root ul{margin-top:0}div.forest-root li{list-style-type:none;margin-top:8px}div.forest-root li:not(.no-sub-elements)>span{cursor:pointer}div.forest-root li.segment.noted{color:#808080}div.forest-root li.segment.noted>.status-badge{border-color:#ddd}div.forest-root li.verification .status-badge.errored{background:#ff483c}div.forest-root li.verification .status-badge.verified{background:#9dde8a}div.forest-root li.verification.errored table{border-left:4px #ff483c solid}div.forest-root li.verification.verified table{border-left:4px #9dde8a solid}div.forest-root li.verification table{font-size:80%;margin:6px 0 12px 40px;border-collapse:separate;border-spacing:5px}div.forest-root li.verification table th{border-right:2px rgba(0,0,0,.12) solid;vertical-align:top;font-weight:400;text-align:right;padding-right:5px}div.forest-root li.verification table td li{white-space:pre}div.forest-root .data-type.number,div.forest-root .data-type.string{color:#667bef}div.forest-root .folded>ul,div.forest-root .folded>table,div.forest-root .folded>.toggle-icon:not(.add-icon),div.forest-root .unfolded>.toggle-icon:not(.subtract-icon),div.forest-root .no-sub-elements>.toggle-icon:not(.bullet-icon),div.forest-root .pending>.status-badge:not(.pending),div.forest-root .errored>.status-badge:not(.errored),div.forest-root .verified>.status-badge:not(.verified),div.forest-root .noted>.status-badge:not(.noted){display:none}div.forest-root .toggle-icon{color:#808080;font:bold 120% \'Monaco\',monospace}div.forest-root *{-webkit-user-select:none;-khtml-user-select:none;-o-user-select:none;user-select:none}div.forest-root .summary-label,div.forest-root table,div.forest-root .summary-label *,div.forest-root table *{-webkit-user-select:initial;-khtml-user-select:initial;-o-user-select:initial;user-select:initial}div.forest-root div.emblem,div.forest-root div.emblem img{height:52.5px;width:60px;*zoom:1}div.forest-root div.emblem img{opacity:.4;position:absolute;right:10px}div.forest-root li{text-indent:-75px}div.forest-root table{text-indent:0;margin-left:-35px!important}';
      const styleWrapperStart = '<style id="forest-styles">'; // Renamed ID
      const styleWrapperEnd = '</style>';

      if ( $targetHead.find( 'link#forest-styles, style#forest-styles' ).length === 0 ) {
        ( inlineCssStyles ?
          $( styleWrapperStart + inlineCssStyles + styleWrapperEnd )
          : $( '<link id="forest-styles" rel="stylesheet" type="text/css" href="'
            + styleSheetPath + '"></link>' )
        ).appendTo( $targetHead );
        $( '.forest-root' ).find( '.folded>span, .unfolded>span' ) // Renamed classes
          .on( 'click', function() { // Changed .live to .on
            $( this ).siblings( 'ul, table' ).toggle().parent( 'li' )
              .toggleClass( 'folded unfolded' ); // Renamed classes
          });
      }

      const initialSummary = 'No activity'; // Changed 'Empty'
      const $initialRender =
        $( templateRenderer( uiTemplates.initialContainer, { id: identifierString, iconPath: uiTemplates.projectLogo, content:
          templateRenderer( uiTemplates.segment, { content:
            templateRenderer( uiTemplates.segmentContent, { summaryText: initialSummary })
          })
        }));

      const $mainRootElement = $initialRender.children( 'li.segment' ).get(0);
      woodland.globalContext.mainDisplayElement = $mainRootElement;
      woodland.displayElement = $mainRootElement;
      $resolvedElement.append( $initialRender );

      // Checks if the provided object is a valid DOM element
      function isHtmlElement ( elementObject ) {
        return (
          typeof HTMLElement === 'object' ? elementObject instanceof HTMLElement : // DOM2 check
          typeof elementObject === 'object' && elementObject !== null && elementObject.nodeType === 1 && typeof elementObject.nodeName === 'string'
        );
      }
    };
    woodland.notifier.finalizationComplete = function () {
      woodland.notifier.refreshMainDisplay( this.getDisplayStatus( 'finished' ) );
    };
    woodland.notifier.getDisplayStatus = function ( statusType ) {
      const globalData = woodland.globalContext;
      globalData.elapsedTime = Date.now() - globalData.startTime;
      const templateRenderer = woodland.utilityFunctions.templateEngine;
      return templateRenderer( woodland.markupTemplates[ 'status_' + statusType ], globalData );
    };
    // woodland.annotation = function ( textContent ) {
    //   this.currentNote = textContent;
    // };
    woodland.markupTemplates = {
      initialContainer: ''
        + '\n<div {{#id}}id="{{ id }}"{{/id}} class="forest-root">' // class changed
        + '\n  {{ content }}' // gut changed to content
        + '\n  <div class="emblem">' // logo changed to emblem
        + '\n    <a class="inner-link" href="https://github.com/YourName/Forest"' // class, href, title changed
        + '\n      title="Forest.js Project Homepage">'
        + '\n      <img src="{{iconPath}}" alt="Forest.js">' // path to iconPath, alt changed
        + '\n    </a>'
        + '\n  </div>'
        + '\n</div>'
      , segment: '' // branch changed to segment
        + '\n<li class="segment ' // class changed
          + '{{#isCommented}}noted{{/isCommented}}' // comm to isCommented, commented to noted
          + '{{^isCommented}}pending{{/isCommented}}' // comm to isCommented, await to pending
        + ' no-sub-elements">' // no-children to no-sub-elements
        + '\n  {{ content }}' // gut to content
        + '\n</li>'
      , segmentContent: '' // branchGut changed to segmentContent
        + '\n<span class="toggle-icon add-icon">+</span>' // handle plus to toggle-icon add-icon
        + '\n<span class="toggle-icon subtract-icon">-</span>' // handle minus to toggle-icon subtract-icon
        + '\n<span class="toggle-icon bullet-icon">&nbsp;</span>' // handle dot to toggle-icon bullet-icon
        // + '\n<span class="toggle-icon bullet-icon">&middot;</span>' // comment changed
        + '\n'
        + '\n<span class="status-badge pending">....</span>' // stamp await to status-badge pending
        + '\n<span class="status-badge errored">fail</span>' // stamp failed to status-badge errored
        + '\n<span class="status-badge verified">pass</span>' // stamp passed to status-badge verified
        + '\n<span class="status-badge noted">&nbsp;//&nbsp;</span>' // stamp comment to status-badge noted
        + '\n'
        + '\n<span class="summary-label">{{summaryText}}' // summary to summary-label, summary to summaryText
          +'{{^summaryText}}<i title="No label provided">Anonymous Item</i>{{/summaryText}}' // summary to summaryText, string changed
        +'</span>'
        + '\n<ul>'
        + '\n</ul>'
      , assertion: '' // assert changed to assertion
        + '\n<li class="verification ' // assert to verification
          + '{{#isSuccessful}}verified folded{{/isSuccessful}}' // pass to isSuccessful, passed to verified, collapsed to folded
          + '{{^isSuccessful}}errored unfolded{{/isSuccessful}}' // pass to isSuccessful, failed to errored, expanded to unfolded
        + '">'
        + '\n  <span class="toggle-icon add-icon">+</span>' // handle plus to toggle-icon add-icon
        + '\n  <span class="toggle-icon subtract-icon">-</span>' // handle minus to toggle-icon subtract-icon
        + '\n  <span class="status-badge errored">fail</span>' // stamp failed to status-badge errored
        + '\n  <span class="status-badge verified">pass</span>' // stamp passed to status-badge verified
        + '\n  '
        + '\n  <span class="summary-label">{{message}}' // summary to summary-label, msg to message
          //+ '{{^isSuccessful}}({{sourcePath}}){{/isSuccessful}}' // pass to isSuccessful, path to sourcePath (commented out)
        + '</span>'
        + '\n  <span class="annotation"></span>' // note to annotation
        + '\n  <table class="details-table">' // content to details-table
        //+ '\n    <tr> <th>Annotation</th> <td>This verification passes</td> </tr>' // comment changed
        + '\n    {{#actualValueString}}<tr> <th>Actual</th>' // actS to actualValueString, Result to Actual
          + '<td class="data-type {{actualValueType}}">{{actualValueString}}</td> </tr>{{/actualValueString}}' // type to data-type, actType to actualValueType, actS to actualValueString
        + '\n    {{#expectedValueString}}<tr> <th>Expected</th>' // expS to expectedValueString
          + '<td class="data-type {{expectedValueType}}">{{expectedValueString}}</td> </tr>{{/expectedValueString}}' // type to data-type, expType to expectedValueType, expS to expectedValueString
        + '\n    {{#sourcePath}}<tr> <th>Source</th> <td>{{sourcePath}}</td> </tr>{{/sourcePath}}' // path to sourcePath, Path to Source
        + '\n  </table>'
        + '\n</li>'
      , status_active: '' // status_running to status_active
        + '<em>Active</em>,' // Running to Active
        + ' took <em>{{elapsedTime}}ms</em> to process' // time to elapsedTime, run to process
        + ' <em>{{successfulAssertionCount}}</em>/<em>{{totalAssertionCount}}</em> assertions' // passedAssertCount to successfulAssertionCount, assertCount to totalAssertionCount, asserts to assertions
        + ' across <em>{{segmentCount}}</em> segments' // branchCount to segmentCount, branches to segments
        + '{{#hasComments}} (+<em>{{hasComments}}</em> commented sections){{/hasComments}}' // commented to hasComments, commented out to commented sections
        + ' recorded so far...' // registered so far to recorded so far
      , status_finished: '' // status_done to status_finished
        + '<em>Finished</em>,' // Done to Finished
        + ' took <em>{{elapsedTime}}ms</em> to process' // time to elapsedTime, run to process
        + ' <em>{{successfulAssertionCount}}</em>/<em>{{totalAssertionCount}}</em> assertions' // passedAssertCount to successfulAssertionCount, assertCount to totalAssertionCount
        + ' across <em>{{segmentCount}}</em> segments.' // branchCount to segmentCount
        + ' {{#hasComments}}(+<em>{{hasComments}}</em> commented sections){{/hasComments}}' // commented to hasComments, commented out to commented sections
      , projectLogo: '\
        data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmc\
        vMjAwMC9zdmciIGhlaWdodD0iNzAiIHdpZHRoPSI4MCI+PGcgdHJhbnNmb3JtPSJ0\
        cmFuc2xhdGUoMCwtOTgyKSI+PHJlY3Qgcnk9IjEwIiBoZWlnaHQ9IjM1IiB3aWR0a\
        D0iNzAiIHN0cm9rZT0iIzAwMCIgeT0iOTkwIiB4PSI1Ii8+PHRleHQgeT0iMTAyMC\
        IgeD0iOCIgZm9udC1mYW1pbHk9IkZvcmVzdCBTRiIgZmlsbD0iI2ZmZiI+PHRzcGF\
        uIGZvbnQtc2l6ZT0iMjhweCI+Zm9yZXN0PC90c3Bhbj48dHNwYW4gZm9udC1zaXpl\
        PSIxNHB4Ij5qczwvdHNwYW4+PC90ZXh0Pgo8cGF0aCBkPSJtNDUuOSwxMDUxLjlzL\
        TEuMi0yLjMtMC4xLTguNGM1LjMtMi4yLDE0LjQtNy45LDE0LjktMTUuNWgtNC4xY\
        zAuNCwwLjktMC45LDMuOC0zLjQsNS45LTAuMi0xLjctMC43LTQuNC0wLjgtNS45a\
        C0zLjJjMC4zLDIuNSwwLjcsNS4yLDEuNiw4LjAtMS40LDEuNC01LjgsMy41LTYuN\
        ywzLjItMC41LTIuMC0wLjYtNi40LTAuNS0xMS4záh0uMWN0LjAsMi45LTAuMCw1Lj\
        gtMC4zLDcuOC00LjItMS43LTcuNC0zLjItMTAuMS03LjhoLTcuMWN0LjAsMy40LD\
        MuNSw0LjUsMTUuMiwxMi4wLTAuNCw0LjItMC41LDguMy0xLjQsMTIuMXoiIHN0cm9\
        rZT0iIzAwMCIvPjwvZz48L3N2Zz>' // logo to projectLogo, SVG text content changed
    };
    woodland.verificationTemplates = {
      _generic: '{{actualValueString}} {{#isNegated}}not {{/isNegated}}{{checkKey}} {{expectedValueString}}', // actS to actualValueString, not to isNegated, key to checkKey, expS to expectedValueString
      isOk: '{{actualValueString}} {{#isNegated}}not {{/isNegated}}ok', // actS to actualValueString, not to isNegated, ok to isOk
      succeeds: 'succeeds', // pass to succeeds
      fails: 'fails', // fail to fails
      isTruthy: '{{actualValueString}} {{#isNegated}}not {{/isNegated}}truthy', // actS to actualValueString, not to isNegated, truthy to isTruthy
      isFalsy: '{{actualValueString}} {{#isNegated}}not {{/isNegated}}falsy', // actS to actualValueString, not to isNegated, falsy to isFalsy
      throwsError: '{{actualValueString}} {{#isNegated}}not {{/isNegated}}throws' // actS to actualValueString, not to isNegated, throws to throwsError
    };
    woodland.verificationChecks.checkOk = function ( checkObject ) {
      checkObject.isSuccessful = !!checkObject.actualValue;
      return checkObject;
    };
    woodland.verificationChecks.markSuccess = function ( checkObject ) {
      checkObject.isSuccessful = true;
      return checkObject;
    };
    woodland.verificationChecks.expectException = function ( checkObject ) {
      checkObject.isSuccessful = null; // Reset success status
      try {
        checkObject.actionToExecute(); // act() to actionToExecute()
      } catch ( caughtError ) { // e to caughtError
        checkObject.isSuccessful = true;
      }
      checkObject.isSuccessful = checkObject.isSuccessful ? checkObject.isSuccessful : false;
      return checkObject;
    };
    woodland.verificationChecks.forceFailure = function ( checkObject ) {
      checkObject.isSuccessful = false;
      return checkObject;
    };
    woodland.verificationChecks.checkType = function ( checkObject ) {
      switch ( checkObject.expectedType.toLowerCase() ) { // exp to expectedType
        case 'array':
          checkObject.isSuccessful = Array.isArray( checkObject.actualValue ); // pass to isSuccessful, act to actualValue
          break;
        case 'nan':
          checkObject.isSuccessful = !( checkObject.actualValue === checkObject.actualValue ); // pass to isSuccessful, act to actualValue
          break;
        default:
          checkObject.isSuccessful = typeof checkObject.actualValue === checkObject.expectedType; // pass to isSuccessful, act to actualValue, exp to expectedType
          break;
      }
      return checkObject;
    };
  }
}();