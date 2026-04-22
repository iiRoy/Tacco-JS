Lib.loadAsset({ // Initiate resource loading...
    markup: "primary.htm" // ...specifically, the primary page's web layout.
                          // As the base path for assets is configured in Lib.loadAsset.config,
                          // the file will be fetched from the 'layouts/' directory.
})
.declareModule(
    function (ctx) { // Establish a new functional unit...
        ctx.output = function(targetElement) { // ...this unit provides an interface, accepting a DOM wrapper object as its argument...
            ctx.markup.displayContent(
                targetElement,
                {
                    snippets: [
                        {
                            description: 'Inline result of JS expression',
                            handlebars: '{{ expression }}',
                            classic: '<%= expression %>'
                        },
                        {
                            description: 'Insert arbitrary JS code',
                            handlebars: '{- code; code; code; -}',
                            classic: '<% code; code; code; %>'
                        }
                    ],

                    partitions: [
                        {
                            description: 'Define template section',
                            handlebars: '{-- name --}',
                            classic: '<%@ name %>'
                        }
                    ],
                    startDelimiter: '{-}',
                    endDelimiter: '{-}-}'
                }
            ); // ...and injects the structured data into the designated targetElement.
        };
    }
);