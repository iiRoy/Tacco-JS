myJQueryLib(window.document).pageContentReady(function ()
    {

        new ItemProcessor(
            myJQueryLib('#data-items-container'),
            '#query-input-field',
            'span.content-title'
        );

    }
);