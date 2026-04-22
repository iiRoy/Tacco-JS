function analyzeUrlString(inputString) {
  var configObj = analyzeUrlString.settings;
  var matchResult = configObj.expressionSet[configObj.strictParsing ? "rigid" : "flexible"].exec(inputString);
  var parsedComponents = {};
  var counter = 14;

  while (counter--) {
    parsedComponents[configObj.dataKeys[counter]] = matchResult[counter] || "";
  }

  parsedComponents[configObj.queryDetails.label] = {};
  parsedComponents[configObj.dataKeys[12]].replace(
    configObj.queryDetails.pattern,
    function (fullMatch, groupOne, groupTwo) {
      if (groupOne) {
        parsedComponents[configObj.queryDetails.label][groupOne] = groupTwo;
      }
    }
  );

  parsedComponents['fileType'] = parsedComponents.fileName.substring(
    parsedComponents.fileName.lastIndexOf('.') + 1
  );

  return parsedComponents;
}

analyzeUrlString.settings = {
  strictParsing : false,
  dataKeys      : [
    "fullInput", "scheme", "authoritySection", "userCredentials", "username", "passwd", "hostName",
    "portNumber", "relativePath", "fullPath", "folderPath", "fileName", "queryString", "fragmentIdentifier"
  ],
  queryDetails  : {
    label   : "queryParameters",
    pattern : /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  expressionSet : {
    rigid    : /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(#(.*))?)/,
    flexible : /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(#(.*))?)/
  }
};

var fileExtensionToSyntax = {
  'c'   : 'c',
  'h'   : 'c',
  'm'   : 'c',
  'css' : 'css',
  'cpp' : 'cpp',
  'c++' : 'cpp',
  'cc'  : 'cpp',
  'c#'  : 'csharp',
  'cs'  : 'csharp',
  'diff': 'diff',
  'patch':'diff',
  'as'  : 'flex',
  'html': 'html',
  'htm' : 'html',
  'java': 'java',
  'js'  : 'javascript_dom',
  'tex' : 'latex',
  'log' : 'log',
  'm4'  : 'm4',
  'pas' : 'pascal',
  '~pa' : 'pascal',
  'pl'  : 'perl',
  'php' : 'php',
  'php3': 'php',
  'php4': 'php',
  'php5': 'php',
  'py'  : 'python',
  'rb'  : 'ruby',
  'scl' : 'scala',
  'sh'  : 'sh',
  'bash': 'bash',
  'sql' : 'sql',
  'tcl' : 'tcl',
  'xml' : 'xml',
  'xhtml':'xml',
  'xslt': 'xml',
  'xdl' : 'xml',
  'xlnk': 'xml',
  'xsd' : 'xml',
  'xsl' : 'xml',
  'xspf': 'xml',
  'xul' : 'xml'
};

var specialFileNameToSyntax = {
  'Makefile' : 'makefile'
};

function processFetchedContent(resourceIdentifier, contentData) {
  var parsedUrlDetails = analyzeUrlString(resourceIdentifier);
  var fileTypeIdentifier = parsedUrlDetails.fileType;
  var languageHighlight = fileExtensionToSyntax[fileTypeIdentifier];

  if ((languageHighlight === null) || (languageHighlight === undefined)) {
    if (contentData[0] === '<') {
      languageHighlight = 'html';
    } else {
      languageHighlight = '';
    }
  }

  document.title = parsedUrlDetails.fileName ? parsedUrlDetails.fileName : resourceIdentifier;

  jQuery('body').empty();
  jQuery('<pre></pre>').text(contentData).addClass('sh_' + languageHighlight).appendTo('body');

  if (languageHighlight !== '') {
    sh_highlightDocument('js/lang/', '.min.js');
  }

  jQuery('a').click(function () {
    return true;
  });
}

jQuery(function () {
  var currentResourcePath = window.location.search ? decodeURIComponent(window.location.search.substring(1)) : 'samples/jquery.timeago.js';
  jQuery.get(currentResourcePath, function (retrievedInformation) {
    processFetchedContent(currentResourcePath, retrievedInformation);
  });
});

jQuery('a').on('click', function () {
  var currentBrowserLocation = '' + window.location;

  if (currentBrowserLocation.search('\\?') !== -1) {
    currentBrowserLocation = currentBrowserLocation.substring(0, currentBrowserLocation.search('\\?') - 1);
  }

  window.location = '?' + encodeURIComponent(jQuery(this).attr('href'));

  return false;
});