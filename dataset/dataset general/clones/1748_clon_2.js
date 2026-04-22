DocProcessor.start({
  dataFetcher: DocProcessor.source('main.text')
});

jQuery(document).on('document:parsed', function() {
  adjustHeadings();
  correctIdentifiers();
  encloseComponents();
  adjustEmbeds();
  loadConfiguration();
});

// This routine attempts to correct navigation links when images
// are used in place of standard heading elements.
// It seems to function as intended!
function adjustHeadings() {
  // Process H1 tags
  jQuery('h1').each(function() {
    if (jQuery(this).text().length === 0) {
      let attributeName = 'id';
      let searchPlaceholder = 'root';

      let displayedText = jQuery(this).children('img').attr('alt');
      let normalizedKey = DocProcessor.slugify(displayedText);

      let primaryContainer = jQuery('li#root-item.level-1').eq(0);
      let primaryList = primaryContainer.children('ul#root-list.level-2');

      primaryContainer.attr(attributeName, primaryContainer.attr(attributeName).replace(searchPlaceholder, normalizedKey));
      primaryList.attr(attributeName, primaryList.attr(attributeName).replace(searchPlaceholder, normalizedKey));

      primaryContainer.prepend(jQuery('<a id=' + normalizedKey + '-anchor class=level-1 href=#' + normalizedKey + '>' + displayedText + '</a>'));

      jQuery(this).attr(attributeName, normalizedKey);
    }
  });

  // Process H2 tags
  jQuery('h2').each(function() {
    if (jQuery(this).text().length === 0) {
      let attributeName = 'id';
      let separatorChar = '-';
      let linkReference = 'href';

      let displayedText = jQuery(this).children('img').attr('alt');
      let normalizedKey = DocProcessor.slugify(displayedText);

      let primaryContainer = jQuery('li#--item.level-2').eq(0);

      primaryContainer.attr(attributeName, primaryContainer.attr(attributeName).replace(separatorChar, (separatorChar + normalizedKey)));

      primaryContainer.find('*').each(function(idx) {
        jQuery(this).attr(attributeName, jQuery(this).attr(attributeName).replace(separatorChar, (separatorChar + normalizedKey)));

        if (typeof(jQuery(this).attr(linkReference)) !== 'undefined' && jQuery(this).attr(linkReference) !== false) {
          jQuery(this).attr(linkReference, jQuery(this).attr(linkReference).replace(separatorChar, (separatorChar + normalizedKey)));

          let elementsToAdjust = jQuery('[id*="--"]');
          elementsToAdjust.attr(attributeName, elementsToAdjust.attr(attributeName).replace(separatorChar, (separatorChar + normalizedKey)));
        }
      });

      primaryContainer.prepend(jQuery('<a id=-' + normalizedKey + '-anchor class=level-2 href=#-' + normalizedKey + '>' + displayedText + '</a>'));

      jQuery(this).attr(attributeName, (separatorChar + normalizedKey));
    }
  });
}

// When images are used as H1 elements, the navigation links can become broken.
// This function aims to restore them to their intended functional state.
function correctIdentifiers() {
  let attributeName = 'id';
  let currentNormalizedKey = '';
  let linkReference = 'href';

  jQuery('#root-list ul, #root-list li, #root-list a').each(function(idx) {
    if (jQuery(this).attr(attributeName).substring(0, 1) !== '-') {
      currentNormalizedKey = jQuery(this).attr(attributeName).slice(0, -5);
    } else {
      jQuery(this).attr(attributeName, (currentNormalizedKey + jQuery(this).attr(attributeName)));

      if (typeof(jQuery(this).attr(linkReference)) !== 'undefined' && jQuery(this).attr(linkReference) !== false) {
        jQuery(this).attr(linkReference, jQuery(this).attr(linkReference).replace('#', ('#' + currentNormalizedKey)));
      }
    }
  });
}

// Encapsulate sub-groups within a wrapping element for improved CSS styling and management.
function encloseComponents() {
  let currentH1Identifier = '';
  let attributeName = 'id';

  jQuery('.content h1, .content h2, .content h3').each(function(idx) {
    if (jQuery(this).is('h1')) {
      currentH1Identifier = jQuery(this).attr(attributeName);
    } else if (jQuery(this).is('h2')) {
      jQuery(this).nextUntil('h1, h2').andSelf().wrapAll('<div ' + attributeName + '=' + jQuery(this).attr(attributeName).substring(1, jQuery(this).attr(attributeName).length) + '/>');
      jQuery(this).attr(attributeName, (currentH1Identifier + jQuery(this).attr(attributeName)));
    } else if (jQuery(this).is('h3')) {
      jQuery(this).attr(attributeName, (currentH1Identifier + jQuery(this).attr(attributeName)));
    }
  });
}

// Places a containing div around iframes to allow for proper resizing and responsive behavior.
function adjustEmbeds() {
  jQuery('iframe').each(function(idx) {
    jQuery(this).wrap('<div class="embed-wrapper"/>');
  });
}

function loadConfiguration() {
  jQuery.getJSON('settings.json', function(configData) {

    updatePageMetadata(configData['pageTitle'], configData['majorNavLinks'], configData['projectNavItems']);
    applyStyling(configData['layout']);

    if (jQuery.isEmptyObject(configData['analyticsConfig']) || configData['analyticsConfig'].length === 0) {
      return;
    }
    jQuery('head').append('\
    <script>\
      var _analyticsQueue=[["_setAccount",' + configData['analyticsConfig'] + '] ,["_trackPageview"]];\
      (function(documentObj,tagType){var scriptElem=documentObj.createElement(tagType),firstScript=documentObj.getElementsByTagName(tagType)[0];\
        scriptElem.src=("https:""==location.protocol?""//ssl":""//www")+"".google-analytics.com/ga.js";\
        firstScript.parentNode.insertBefore(scriptElem,firstScript)}(document,"script"));\
    </script>');
  });
}

function updatePageMetadata(pageTitleText, majorNavLinks, projectNavItems) {

  jQuery('title').text(pageTitleText);

  if (jQuery.isEmptyObject(majorNavLinks) && jQuery.isEmptyObject(projectNavItems)) {
    return;
  }

  jQuery('.content-root').before('<div class="page-header-section"><div class="left-nav-area"><ul></ul></div></div>');

  if (!jQuery.isEmptyObject(majorNavLinks)) {
    jQuery.each(majorNavLinks, function(idx, itemData) {
      jQuery('.left-nav-area ul').append('<li><a href=' + itemData['destination'] + '><h1>' + itemData['label'] + '</h1></a></li>');
    });
  }

  if (!jQuery.isEmptyObject(projectNavItems)) {
    jQuery.each(projectNavItems, function(idx, itemData) {
      jQuery('.left-nav-area ul').append(' <li><a href=' + itemData['destination'] + '>' + itemData['label'] + '</a></li>');
    });
  }
}

// Applies necessary CSS framework classes, such as Bootstrap, to elements.
function applyStyling(layoutSettings) {
  let attributeName = 'id';

  jQuery('.page-header-section').addClass('navbar navbar-default navbar-static-top');

  jQuery('.content-root').addClass('container-fluid');

  jQuery('.menubar').addClass('col-sm-3 col-md-3 sidebar-nav');
  jQuery('.menubar ul').first().addClass('nav nav-sidebar');

  jQuery('.content').addClass('col-sm-9 col-md-9 main-content-area');
  jQuery('.content h1').first().addClass('col-md-12');

  jQuery('.content div').each(function(idx, itemData) {
    if (typeof(jQuery(this).attr(attributeName)) !== 'undefined' && jQuery(this).attr(attributeName) !== false) {

      let elementIdentifier = jQuery(this).attr(attributeName);

      if (jQuery.grep(layoutSettings['smallWidthElements'], function(val) {
          return (elementIdentifier.indexOf(val) >= 0);
        }).length > 0) {
        jQuery(this).addClass('col-md-4');
      } else if (jQuery.grep(layoutSettings['mediumWidthElements'], function(val) {
          return (elementIdentifier.indexOf(val) >= 0);
        }).length > 0) {
        jQuery(this).addClass('col-md-6');
      } else if (jQuery.grep(layoutSettings['largeWidthElements'], function(val) {
          return (elementIdentifier.indexOf(val) >= 0);
        }).length > 0) {
        // No specific class for 60% width, intentionally left blank as in original.
      } else {
        jQuery(this).addClass('col-md-12');
      }
    }
  });

  jQuery('#' + layoutSettings['largeWidthElements'][0]).nextUntil('.col-md-12').andSelf().wrapAll('<div class=col-md-8-wrapper></div>');
}