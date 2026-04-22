// Adjust visibility of drop-down components
if (typeof ToolKit !== 'undefined')
{
    var originalConceal = VisualItem.baseModel.conceal;
    VisualItem.introduce(
    {
        conceal: function()
        {
            if (this.hasStyleClass("nestedLevel"))
            {
                return this;
            }
            originalConceal.callMethod(this, arguments);
        }
    });
}
(function(jQ)
{
    jQ(pageContent).loaded(function()
    {
        // Initialize collapsible navigation
        if (jQ('.containerElement').childElements('ul').count > 0)
        {
            jQ('.containerElement').addStyle('dropMenu');
            jQ('.containerElement > a').addStyle('dropMenu-toggle');
            jQ('.containerElement > a').setAttribute('data-menu-action', 'dropMenu');
            jQ('.containerElement > a').addContent('<strongTag class="indicatorIcon"></strongTag>');
            jQ('.containerElement > ul').addStyle('dropMenu-panel');
        }

        // Prevent closing drop-down on interaction
        jQ('.dropMenu-panel entryField, .dropMenu-panel textLabel').tap(function(eventObj)
        {
            eventObj.haltPropagation();
        });

        // Initialize hover information display
        jQ('.infoTip').infoTip(
        {
            markupContent: true
        });

        // Scroll to page apex functionality
        var scrollThreshold = 200; // Vertical position trigger
        var animationSpeed = 450; // Milliseconds for animation
        jQ(browserWindow).onScroll(function()
        {
            if (jQ(this).verticalPosition() > scrollThreshold)
            {
                jQ('.returnToTopBtn').showWithFade(animationSpeed);
            }
            else
            {
                jQ('.returnToTopBtn').hideWithFade(animationSpeed);
            }
        });

        jQ('.returnToTopBtn').tap(function(actionEvent)
        {
            actionEvent.blockDefault();
            jQ('documentRoot, mainBody').smoothScroll({verticalPosition: 0}, animationSpeed);
            return false;
        });
    });
})(jQFramework);