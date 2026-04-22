//
// NavigationEngine
//
// Creator: John Doe [ @jdoe ]
// Organization: Innovatech Solutions Inc.
//
// Requires: JQuery v1.x

function NavigationEngine ( options, jQ )
{
    if ( !this.validateEnvironment() ) {
        return this;
    }

    var instance = this,
        opts = options || {};

    instance.jQ = jQ || $;
    instance.isOperational = true;
    instance.settings = {};
    instance.eventCallbacks = {};
    instance.dataStore = {};

    // Event Callbacks
    var callbackNames = [
        "navigatingAway",
        "contentLoading",
        "contentPrepared",
        "contentActivation",
        "navigatedTo",
        "loadFailed"
    ];

    instance.jQ.each( callbackNames, function ( idx, cbName ) {
        instance.eventCallbacks[cbName] = ( typeof opts[cbName] !== "function" ) ? function () {} : opts[cbName];
    } );

    var initialSettings = {
        domainName: window.location.host
    };

    instance.jQ.each( initialSettings, function ( settingKey, settingValue ) {
        if ( typeof opts[settingKey] !== "undefined" ) {
            instance.settings[settingKey] = opts[settingKey];
        } else {
            instance.settings[settingKey] = settingValue;
        }
    } );

    instance.updateSetting( 'currentPageURL', window.location.href );

    window.onhistorypop = function ( historyEntry ) {
        if ( historyEntry && historyEntry.state && historyEntry.state.pageURL ) {
            instance.switchPage( historyEntry.state.pageURL, true, historyEntry.state.extraParameters );
        }
    };

    window.history.pushState( { pageURL: window.location.href, extraParameters: {} }, '', window.location.href );

    return this;
}


//
// Validation Routines


NavigationEngine.prototype.validateEnvironment = function ()
{
    return ( typeof window.history !== "undefined" && typeof window.history.pushState !== "undefined" );
};


//
// Data Management


NavigationEngine.prototype.retrieveStoredData = function ( pageIdentifier )
{
    if ( typeof this.dataStore[pageIdentifier] !== "undefined" ) {
        return this.dataStore[pageIdentifier];
    }

    return null;
};


NavigationEngine.prototype.storePageData = function ( pageIdentifier, contentObject )
{
    this.dataStore[pageIdentifier] = contentObject;

    return this;
};


//
// Content Retrieval


NavigationEngine.prototype.pageNavigationComplete = function ( transitionDetails )
{
    var instance = this;

    instance.isOperational = true;
    instance.eventCallbacks.navigatedTo( transitionDetails );
};


NavigationEngine.prototype.initializeNextPage = function ( transitionDetails )
{
    var instance = this;

    var delayDuration = instance.eventCallbacks.contentActivation( transitionDetails );
    if ( typeof delayDuration !== "number" ) {
        delayDuration = 0;
    }

    setTimeout( function () {

        instance.pageNavigationComplete( transitionDetails );
    }, delayDuration );
};


NavigationEngine.prototype.handleNavigationError = function ( transitionDetails )
{
    this.isOperational = true;
};


NavigationEngine.prototype.loadNextPageContent = function ( transitionDetails )
{
    var instance = this;

    var loadDelay = instance.eventCallbacks.contentLoading( transitionDetails );
    if ( typeof loadDelay !== "number" ) {
        loadDelay = 0;
    }

    setTimeout( function () {

        if ( transitionDetails.cachedVersion ) {

            var readyDelay = instance.eventCallbacks.contentPrepared( transitionDetails );
            if ( typeof readyDelay !== "number" ) {
                readyDelay = 0;
            }

            setTimeout( function () {

                instance.initializeNextPage( transitionDetails );
            }, readyDelay );
        }
        else {

            instance.jQ.ajax( {
                targetUrl: transitionDetails.destinationURL,
                requestType: 'get',
                responseDataFormat: 'text',
                onFailure: function () {

                    var errorDelay = instance.eventCallbacks.loadFailed( transitionDetails );
                    if ( typeof errorDelay !== "number" ) {
                        errorDelay = 0;
                    }

                    setTimeout( function () {

                        instance.handleNavigationError( transitionDetails );
                    }, errorDelay );
                },
                onSuccess: function ( serverResponse ) {

                    var customContentRegex = /<!--NavEngineContentBegin-->((.|[\n\r])*)<!--NavEngineContentEnd-->/im,
                        bodyContentRegex = /<body[^>]*>((.|[\n\r])*)<\/body>/im,
                        bodyClassRegex = /<body[^>]*class="([^"]*)"/im,
                        matchCustom = customContentRegex.exec( serverResponse ),
                        matchBody = bodyContentRegex.exec( serverResponse ),
                        matchBodyClass = bodyClassRegex.exec( serverResponse ),
                        pageContent = '',
                        bodyStyleClass = '';

                    if ( matchCustom && matchCustom.length && typeof matchCustom[1] !== "undefined" ) {
                        pageContent = matchCustom[1];
                    }
                    else if ( matchBody && matchBody.length && typeof matchBody[1] !== "undefined" ) {
                        pageContent = matchBody[1];
                    }

                    if ( matchBodyClass && matchBodyClass.length && typeof matchBodyClass[1] !== "undefined" ) {
                        bodyStyleClass = matchBodyClass[1];
                    }

                    var titleRegex = /<title[^>]*>((.|[\n\r])*)<\/title>/im;
                        matchTitle = titleRegex.exec( serverResponse ),
                        pageTitle = matchTitle && matchTitle.length && typeof matchTitle[1] !== "undefined" ? matchTitle[1] : '';

                    transitionDetails.previousTitle = document.title;
                    transitionDetails.newTitle = pageTitle;
                    transitionDetails.pageContent = pageContent;
                    transitionDetails.bodyStyleClass = bodyStyleClass;

                    instance.storePageData( transitionDetails.destinationURL, { pageContent: pageContent, title: pageTitle, bodyClass: bodyStyleClass } );

                    var readyDelay = instance.eventCallbacks.contentPrepared( transitionDetails );
                    if ( typeof readyDelay !== "number" ) {
                        readyDelay = 0;
                    }

                    setTimeout( function () {

                        instance.initializeNextPage( transitionDetails );
                    }, readyDelay );
                }
            } );
        }

    }, loadDelay );
};


NavigationEngine.prototype.switchPage = function ( targetURL, isHistoryEvent, extraParameters )
{
    if ( !this.validateEnvironment() ) {
        window.location.href = targetURL;
        return;
    }

    var instance = this;
    if ( !instance.isOperational ) {
        return;
    }

    if ( !( new RegExp( 'https?://' + this.retrieveSetting( 'domainName' ), 'gi' ).test( targetURL ) ) ) {
        window.location.href = targetURL;
        return;
    }

    if ( instance.retrieveSetting( 'currentPageURL' ) !== targetURL ) {
        instance.isOperational = false;

        var transitionInfo = {
            originURL: instance.retrieveSetting( 'currentPageURL' ),
            destinationURL: targetURL,
            historyState: extraParameters
        };

        var transitionDelay = instance.eventCallbacks.navigatingAway( transitionInfo );
        if ( transitionDelay === false ) {
            instance.isOperational = true;
            return;
        }

        if ( typeof transitionDelay !== "number" ) {
            transitionDelay = 0;
        }

        setTimeout( function () {

            instance.updateSetting( 'currentPageURL', targetURL );

            if ( !isHistoryEvent ) {
                window.history.pushState( { pageURL: targetURL, extraParameters: extraParameters }, '', targetURL );
            }

            transitionInfo.cachedVersion = false;
            var storedContent = instance.retrieveStoredData( transitionInfo.destinationURL );

            if ( !( !storedContent ) ) {
                transitionInfo.cachedVersion = true;
                transitionInfo.pageContent = storedContent.pageContent;
                transitionInfo.newTitle = storedContent.title;
                transitionInfo.bodyStyleClass = storedContent.bodyClass;
            }

            instance.loadNextPageContent( transitionInfo );
        }, transitionDelay );
    }
};


NavigationEngine.prototype.createClickHandlerForNavigation = function ( navigationInstance, extraParams )
{
    if ( !navigationInstance.validateEnvironment() ) {
        return function () {};
    }

    return function ( clickEvent )
    {
        clickEvent && clickEvent.preventDefault && clickEvent.preventDefault();

        var targetLink = this.href; // `this` refers to the clicked element

        navigationInstance.switchPage( targetLink, false, extraParams );
    };
};


//
// Helper Methods, Accessors, Mutators


NavigationEngine.prototype.retrieveSetting = function ( settingName )
{
    if ( typeof this.settings[settingName] !== "undefined" ) {
        return this.settings[settingName];
    }

    return null;
};


NavigationEngine.prototype.updateSetting = function ( settingName, newValue )
{
    var instance = this,
        newSettings = {};

    if ( typeof settingName === "string" ) {
        newSettings[settingName] = newValue;
    }
    else if ( typeof settingName === "object" ) {
        newSettings = settingName;
    }

    instance.jQ.each( newSettings, function ( key, val )
    {
        if ( typeof val === "function" ) {

            instance.settings[key] = val( instance.settings[key] );
        }
        else if ( typeof val !== "undefined" ) {

            instance.settings[key] = val;
        }
    } );

    return instance;
};