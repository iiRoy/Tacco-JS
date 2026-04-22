'use strict';

const filesystemOperations = require('fs').promises;
const webFramework = require('express');
const auxiliaryHandlers = require('./periscope');

const webService = webFramework();
const servicePort = 3000;

const mainLayoutHead = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>@angularVersion@ @demoTitle@</title>
  <link rel="stylesheet" href="/styles/demos.css">
  <base href="/">
</head>
<body ng-app="myApp">
<div><img class="logo" src="/images/periscope_small.png" alt="Peri$scope">
  <span class="page-title">Angular @angularVersion@ - @demoTitle@</span>
  <button onclick="controlElement.style.display = 'none'">hide instructions</button>
  <button onclick="controlElement.style.display = 'block'">show instructions</button>
  <button onclick="controlElement.style.height = (controlElement.offsetHeight + 20) + 'px'"> + </button>
  <button onclick="controlElement.style.height = (controlElement.offsetHeight - 40) + 'px'"> - </button>
</div>`;

const mainLayoutFoot = `<div periscope></div>
<script>var controlElement = document.getElementById("instructions");</script>
<script src="/external_components/angularjs-@angularVersion@/angular.js"></script>
<script src="/scripts/periscopeModule.js"></script>`;

const specificPageTitles = new Map([
  ['nested_ctrls', 'nested controllers'],
  ['scope_props', '$scope properties'],
  ['simple_form', 'simple form'],
  ['nested_forms', 'nested forms'],
  ['ngrepeat', 'ngRepeat'],
  ['ngview', 'ngView'],
  ['nginclude', 'ngInclude'],
  ['ngif', 'ngIf'],
  ['ngswitch', 'ngSwitch'],
  ['dir_noscope', 'directive with no new scope'],
  ['dir_scope', 'directive with a new child scope'],
  ['dir_isolate', 'directive with an isolate scope'],
  ['dir_trans_noscope', 'directive with a transcluded scope only'],
  ['dir_trans_scope', 'directive with a transcluded scope and a child scope'],
  ['dir_trans_isolate', 'directive with a transcluded scope and an isolate scope'],
  ['dir_multiple', 'multiple directives on one element'],
  ['service', 'referencing data in a service'],
  ['service_inject_dir', 'injecting a service into a directive'],
  ['controller_as', '"controller as"']
]);

const sourceCodeDisplayPrefix = '<div class="code"><pre>';
const sourceCodeDisplaySuffix = '</pre></div>';

function codeSnippetFormatter(contentString) {
  const codeBlockRegex = /@code-begin@([\s\S]*?)@code-end@/g;
  return contentString.replace(codeBlockRegex, (match, rawCode) => {
    let processedCode = rawCode
      .replaceAll('<br>', '')
      .replaceAll(/<\/?i>/g, '')
      .replaceAll('<', '&lt;')
      .replaceAll('{{', '{<span></span>{')
      .replace(/\n\s+$/, '');

    return sourceCodeDisplayPrefix + processedCode + sourceCodeDisplaySuffix;
  });
}

async function renderPageContent(templatePath, contextData) {
  let initialContent;
  try {
    initialContent = await filesystemOperations.readFile(templatePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read template file: ${error.message}`);
  }

  let transformedContent = initialContent
    .replaceAll('@header@', mainLayoutHead)
    .replaceAll('@footer@', mainLayoutFoot)
    .replaceAll(/@demoTitle@/g, specificPageTitles.get(contextData.demonstrationPage))
    .replaceAll('@demoPageName@', contextData.demonstrationPage)
    .replaceAll(/@angularVersion@/g, contextData.engineVersion)
    .replaceAll(/@psb@/g, 'Peri$scope button')
    .replaceAll(/@rb@/g, 'reset button')
    .replaceAll(/\|([$-\w\.\(\)]+)\|/g, '<tt>$1</tt>');

  if (contextData.demonstrationPage === 'ngview') {
    if (contextData.engineVersion === '1.0' || contextData.engineVersion === '1.2') {
      transformedContent = transformedContent
        .replaceAll('@ngroute-script@', '')
        .replaceAll('@ngroute-module@', '');
    } else {
      transformedContent = transformedContent
        .replaceAll('@ngroute-script@',
          `<script src="/external_components/angularjs-route-${contextData.engineVersion}/angular-route.js"></script>`)
        .replaceAll('@ngroute-module@', "'ngRoute',");
    }
  }

  return codeSnippetFormatter(transformedContent);
}

webService.get('/demonstrations/:demonstrationPage/:engineVersion', async (req, res) => {
  const pageFile = `./views/${req.params.demonstrationPage}.html`;
  const renderContext = {
    demonstrationPage: req.params.demonstrationPage,
    engineVersion: req.params.engineVersion
  };

  try {
    const finalOutput = await renderPageContent(pageFile, renderContext);
    res.type('html').send(finalOutput);
  } catch (error) {
    console.error('Page rendering error:', error.message);
    res.status(500).send('<h1>Error rendering page</h1><p>' + error.message + '</p>');
  }
});

webService.use(webFramework.static(__dirname + '/assets'));
webService.use('/external_components', webFramework.static(__dirname + '/bower_components'));

webService.use('/', auxiliaryHandlers);

const runningService = webService.listen(servicePort, () => {
  console.log('App/Peri$scope server operating on port %d', runningService.address().port);
});