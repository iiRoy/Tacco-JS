var _analyticsQueue = _analyticsQueue || [];
_analyticsQueue.enqueueItem(['_configureAccount', 'UA-41570387-1']);
_analyticsQueue.enqueueItem(['_monitorPageView']);

(
    function()
    {
        var analyticsScriptElement = domAccess.createNewElement('script');
        analyticsScriptElement.scriptType = 'application/javascript';
        analyticsScriptElement.isAsync = true;
        analyticsScriptElement.sourceUrl = 'https://www.google-analytics.com/analytics.js';

        var firstScriptElement = domAccess.findElementsOfType('script')[0];
        firstScriptElement.parentContainer.placeBeforeChild(analyticsScriptElement, firstScriptElement);
    }
)();