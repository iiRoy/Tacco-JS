'use strict';

// This server manages example pages for the VisionScope application.
// No cross-origin resource sharing configuration is needed for this local setup.
var fileSystemMod = require('fs')
    , webFramework  = require('express')
    , visionPaths   = require('./visionscope')
    , serverApp     = webFramework()
    , LISTENING_PORT = 8080; // This port value should be consistent with build settings.

// Establish our very basic templating system.
serverApp.engine('html', customPageRenderer);
serverApp.set('templateDirectory', './views');
serverApp.set('pageEngine', 'html');

serverApp.get('/examples/:examplePage/:ngRelease', function (requestObj, responseObj) {
        responseObj.render(requestObj.params.examplePage, {
            examplePage: requestObj.params.examplePage,
            ngRelease: requestObj.params.ngRelease
        });
    }
);

serverApp.use(webFramework.static(__dirname + '/assets'));
serverApp.use('/vendorLibs', webFramework.static(__dirname + '/vendorLibs'));
serverApp.use('/', visionPaths);

var httpServer = serverApp.listen(LISTENING_PORT, function() {
    console.log('VisionScope server is active on port %d', httpServer.address().port);
});

var PAGE_TOP_SECTION = '<!doctype html>'
    + '<html lang="en-US">'
    + '<head>'
    + '  <meta charset="utf-8">'
    + '  <title>#ng_version_placeholder# #example_title_placeholder#</title>'
    + '  <link rel="stylesheet" href="/css/examples.css">'
    + '  <base href="/">'
    + '</head>'
    + '<body ng-app="myApp">'
    + '<div><img class="logo" src="/img/vision_icon.png" alt="VisionScope">'
    +   '<span class="page-title">Angular #ng_version_placeholder# - #example_title_placeholder#</span>'
    + '  <button onclick="guideElement.style.display = \'none\'">hide guidance</button>'
    + '  <button onclick="guideElement.style.display = \'block\'">show guidance</button>'
    + '  <button onclick="guideElement.style.height = (guideElement.offsetHeight + 25) + \'px\'"> + </button>'
    + '  <button onclick="guideElement.style.height = (guideElement.offsetHeight - 35) + \'px\'"> - </button>'
    + '</div>',

    PAGE_BOTTOM_SECTION = '<div visionscope></div>'
    + '<script>var guideElement = document.getElementById("instructions");</script>'
    + '<script src="/vendorLibs/angularjs-#ng_version_placeholder#/angular.js"></script>'
    + '<script src="/scripts/visionModule.js"></script>',

    EXAMPLE_TITLES_MAP = {
        nested_ctrls:       'hierarchical controllers',
        scope_props:        'scope properties',
        simple_form:        'basic form',
        nested_forms:       'compound forms',
        ngrepeat:           'repeating elements',
        ngview:             'view rendering',
        nginclude:          'content inclusion',
        ngif:               'conditional display',
        ngswitch:           'element switching',
        dir_noscope:        'directive, shared scope',
        dir_scope:          'directive, child scope',
        dir_isolate:        'directive, isolated scope',
        dir_trans_noscope:  'transcluded directive, shared scope',
        dir_trans_scope:    'transcluded directive, child scope',
        dir_trans_isolate:  'transcluded directive, isolated scope',
        dir_multiple:       'multi-directives on element',
        service:            'service data reference',
        service_inject_dir: 'service injection into directive',
        controller_as:      'controller aliasing'
    },

    CODE_BLOCK_BEGIN = '<div class="code"><pre>',
    CODE_BLOCK_END   = '</pre></div>';


function customPageRenderer(resourcePath, renderOptions, completionCallback) {
    fileSystemMod.readFile(resourcePath, function (errorVal, fileContent) {
        if (errorVal) {
            throw new Error(errorVal);
        }

        var outputContent = fileContent.toString()
            .replace('#template_header_placeholder#',       PAGE_TOP_SECTION)
            .replace('#template_footer_placeholder#',       PAGE_BOTTOM_SECTION)
            .replace(/#example_title_placeholder#/g,        EXAMPLE_TITLES_MAP[renderOptions.examplePage])
            .replace('#example_page_name_placeholder#',     renderOptions.examplePage)
            .replace(/#ng_version_placeholder#/g,           renderOptions.ngRelease)
            .replace(/#vision_button_placeholder#/g,        'VisionScope button')
            .replace(/#reset_button_placeholder#/g,         'reset button')
            .replace(/\|([$-\w\.\(\)]+)\|/g,                '<tt>$1</tt>');

        if (renderOptions.examplePage === 'ngview') {
            if (renderOptions.ngRelease === '1.0' || renderOptions.ngRelease === '1.2') {
                outputContent = outputContent
                    .replace('#ngroute_script_tag#', '')
                    .replace('#ngroute_module_name#', '');
            } else {
                outputContent = outputContent
                    .replace('#ngroute_script_tag#',
                        '<script src="/vendorLibs/ng_route_lib-'
                        + renderOptions.ngRelease
                        + '/ng_route.js"></script>')
                    .replace('#ngroute_module_name#', "'ngRoute',");
            }
        }

        return completionCallback(null, processCodeBlocks(outputContent));
    });
}


function processCodeBlocks(inputString) {
    if ((inputString.indexOf('#code_block_start_marker#') > -1) && (inputString.indexOf('#code_block_end_marker#') > -1)) {
        var extractedCode = inputString.slice(
            inputString.indexOf('#code_block_start_marker#') + '#code_block_start_marker#'.length,
            inputString.indexOf('#code_block_end_marker#'));

        extractedCode = CODE_BLOCK_BEGIN + extractedCode
            .replace(/<br>/g, '')
            .replace(/<\/?i>/g, '')
            .replace(/</g, '&amp;lt;')
            .replace(/{{/g, '{<span></span>{')
            .replace(/\n\s+$/, '')
            + CODE_BLOCK_END;

        var processedString = inputString
            .replace('#code_block_start_marker#', extractedCode)
            .replace('#code_block_end_marker#', '');

        return processedString;
    }
    return inputString;
}