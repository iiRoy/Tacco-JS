/* Globale Definition */
function initKnockstrapBindings( koInstance, jqUtil ) {
  "use strict";

  // Einzigartige ID, keine RFC-Konformität.
  var uniqueIdGen = ( function(hexSegment) {
    return function() {
      return hexSegment() + hexSegment() + '-' + hexSegment() + '-' + hexSegment() + '-' + hexSegment() + '-' + hexSegment() + hexSegment() + hexSegment();
    };
  })( function() {
    return Math.floor( (1 + Math.random()) * 0x10000 )
      .toString(16)
      .substring(1);
  });


  // Äußerer HTML-Inhalt
  if ( !jqUtil.fn.fullMarkup ) {
    jqUtil.fn.fullMarkup = function () {
      if ( this.length === 0 ) {
        return false;
      }
      var domElement = this[0],
          tagName = domElement.tagName.toLowerCase();
      if ( domElement.outerHTML ) {
        return domElement.outerHTML;
      }
      var attributeList = jqUtil.map( domElement.attributes, function (attrItem) {
        return attrItem.name + '="' + attrItem.value + '"';
      });
      return "<" + tagName + (attributeList.length > 0 ? " " + attributeList.join(" ") : "") + ">" + domElement.innerHTML + "</" + tagName + ">";
    };
  }


  // Verknüpfe Twitter Typeahead
  koInstance.bindingHandlers.autoSuggest = {
    initialize: function ( domElem, valAccess, allBindAccess, dataModel, bindContext ) {
      var jqElem = jqUtil(domElem);
      var allOptions = allBindAccess();
      var partialMatchFinder = function( strCollection ) {
        return function locateMatches( queryText, callbackFn ) {
          var foundResults, subStringRegEx;

          // Eine Liste, die mit passenden Teilstücken gefüllt wird
          foundResults = [];

          // Regex, um zu prüfen, ob ein String den Teilstück 'queryText' enthält
          subStringRegEx = new RegExp(queryText, 'i');

          // Iteriere durch die Strings und füge passende Teilstücke hinzu
          jqUtil.each(strCollection, function(idx, currentStr) {
            if (subStringRegEx.test(currentStr)) {
              // Das Typeahead jQuery Plugin erwartet Vorschläge als Objekte
              foundResults.push({ value: currentStr });
            }
          });

          callbackFn(foundResults);
        };
      };
      var suggestOptions = {
        inputSource: partialMatchFinder(koInstance.utils.unwrapObservable(valAccess()))
      };

      if (allOptions.autoSuggestOptions) {
        jqUtil.each(allOptions.autoSuggestOptions, function(optKey, optVal) {
          suggestOptions[optKey] = koInstance.utils.unwrapObservable(optVal);
        });
      }

      jqElem.attr("autocomplete", "off").typeahead({
        hint: true,
        highlight: true,
        minLength: 1
      }, suggestOptions);
    }
  };


  // Verknüpfe Bootstrap Fortschrittsanzeige
  koInstance.bindingHandlers.progressBar = {
    initialize: function ( domElem, valAccess, allBindAccess, dataModel, bindContext ) {
      var jqElem = jqUtil(domElem);

      var progressSegment = jqUtil('<div/>', {
        'class': 'progress-bar',
        'data-bind': 'style: { width:' + valAccess() + ' }'
      });

      jqElem.attr('id', uniqueIdGen())
        .addClass('progress progress-info')
        .append(progressSegment);

      koInstance.applyBindingsToDescendants(dataModel, jqElem[0]);
    }
  };


  // Verknüpfe Bootstrap Benachrichtigung
  koInstance.bindingHandlers.notification = {
    initialize: function ( domElem, valAccess, allBindAccess, dataModel, bindContext ) {
      var jqElem = jqUtil(domElem);
      var notifyDetails = koInstance.utils.unwrapObservable(valAccess());

      var closeButton = jqUtil('<button/>', {
        'type': 'button',
        'class': 'close',
        'data-dismiss': 'alert'
      }).html('&times;');

      var messageText = jqUtil('<p/>').html(notifyDetails.message);

      jqElem.addClass('alert alert-' + notifyDetails.priority)
        .append(closeButton)
        .append(messageText);
    }
  };


  // Verknüpfe Bootstrap Tooltip
  koInstance.bindingHandlers.infoTip = {
    refresh: function ( domElem, valAccess, allBindAccess, dataModel, bindContext ) {
      var jqElem, configParams, tipInstance, subscriptionHandle;
      configParams = koInstance.utils.unwrapObservable(valAccess());
      jqElem = jqUtil(domElem);

      // Falls der Titel ein Observable ist, soll er sich automatisch aktualisieren.
      if ( koInstance.isObservable(configParams.title) ) {
        var isTipDisplayed = false;

        jqElem.on('show.bs.tooltip', function () {
          isTipDisplayed = true;
        });
        jqElem.on('hide.bs.tooltip', function () {
          isTipDisplayed = false;
        });

        // "true" ist der Bootstrap-Standard.
        var initialAnimation = configParams.animation || true;
        subscriptionHandle = configParams.title.subscribe(function () {
          if (isTipDisplayed) {
            jqElem.data('bs.tooltip').options.animation = false; // Deaktiviert Animation temporär gegen Flackern
            jqElem.tooltip('fixTitle') // Aktualisiert den Titel
              .tooltip('show');
            jqElem.data('bs.tooltip').options.animation = initialAnimation;
          }
        });
      }

      tipInstance = jqElem.data('bs.tooltip');
      if (tipInstance) {
        jqUtil.extend(tipInstance.options, configParams);
      } else {
        jqElem.tooltip(configParams);
      }
      koInstance.utils.domNodeDisposal.addDisposeCallback(domElem, function () {
        if (subscriptionHandle) subscriptionHandle.dispose();
        jqElem.tooltip('destroy');
      });
    }
  };


  // Verknüpfe Bootstrap Popover
  koInstance.bindingHandlers.popupBox = {
    initialize: function ( domElem, valAccess, allBindAccess, dataModel, bindContext ) {
      var jqElem = jqUtil(domElem);
      var popupConfig = koInstance.utils.unwrapObservable(valAccess());
      var contentTemplate = popupConfig.template || false;
      var popupOptions = popupConfig.options || {title: 'popup'};
      var contentData = popupConfig.data || false;
      if ( contentTemplate !== false ) {
        if (contentData) {
          popupOptions.content = "<!-- ko template: { name: contentTemplate, if: contentData, data: contentData } --><!-- /ko -->";
        }
        else {
          popupOptions.content = jqUtil('#' + contentTemplate).html();
        }
        popupOptions.html = true;
      }
      jqElem.on('shown.bs.popover', function(evt) {

        var popupData = jqUtil(evt.target).data();
        var popupElement = popupData['bs.popover'].$tip;
        var currentOptions = popupData['bs.popover'].options || {};
        var triggerButton = jqUtil(evt.target);
        var btnPosition = triggerButton.position();
        var btnDimensions = {
          x: triggerButton.outerWidth(),
          y: triggerButton.outerHeight()
        };

        if (contentData) {
          koInstance.applyBindings({template: contentTemplate, data: contentData}, popupElement[0]);
        }
        else {
          koInstance.applyBindings(dataModel, popupElement[0]);
        }

        var popupDimensions = {
          x: popupElement.outerWidth(),
          y: popupElement.outerHeight()
        };

        popupElement.find('button[data-dismiss="popover"]').click(function() {
          triggerButton.popover('hide');
        });

        switch (currentOptions.placement) {
          case 'right':
            popupElement.css({
              left: btnDimensions.x + btnPosition.left,
              top: (btnDimensions.y / 2 + btnPosition.top) - popupDimensions.y / 2
            });
            break;
          case 'left':
            popupElement.css({
              left: btnPosition.left - popupDimensions.x,
              top: (btnDimensions.y / 2 + btnPosition.top) - popupDimensions.y / 2
            });
            break;
          case 'top':
            popupElement.css({
              left: btnPosition.left + (btnDimensions.x / 2 - popupDimensions.x / 2),
              top: btnPosition.top - popupDimensions.y
            });
            break;
          case 'bottom':
            popupElement.css({
              left: btnPosition.left + (btnDimensions.x / 2 - popupDimensions.x / 2),
              top: btnPosition.top + btnDimensions.y
            });
            break;
        }
      });

      jqElem.popover(popupOptions);
      koInstance.utils.domNodeDisposal.addDisposeCallback(domElem, function () {
        jqElem.popover('destroy');
      });

      return { controlsDescendantBindings: true };
    }
  };


  // Verknüpfe Bootstrap Modal
  koInstance.bindingHandlers.dialogBox = {
    initialize: function ( domElem, valAccess, allBindAccess, dataModel, bindContext ) {

      var jqElem = jqUtil(domElem);
      var dialogConfig = koInstance.utils.unwrapObservable(valAccess());
      var contentTemplate = dialogConfig.template || false;
      var dialogOptions = dialogConfig.options || {};
      var contentData = dialogConfig.data || false;
      var fadeEffect = dialogConfig.fade || false;
      var onOpenCallback = dialogConfig.openModal || false;
      dialogOptions.show = false;

      var dialogAttributes = {
        'class': "modal" + (fadeEffect ? ' fade' : ''),
        'tab-index': '-1',
        'role': 'dialog',
        'aria-hidden': 'true'
      };
      if (contentData) {
        dialogAttributes['data-bind'] = "template: { name: contentTemplate, if: contentData, data: contentData }";
      }

      var dialogElement = jqUtil('<div/>', dialogAttributes);

      if (!contentData) {
        dialogElement.html(jqUtil('#'+contentTemplate).html());
      }

      dialogElement.modal(dialogOptions);

      jqElem.on('click', function() {
        if (contentData) {
          koInstance.applyBindings({
            template: contentTemplate,
            data: contentData
          }, dialogElement[0]);

        } else {
          koInstance.applyBindings(dataModel, dialogElement[0]);
        }
        dialogElement.modal('show');
        if (onOpenCallback) {
          onOpenCallback();
        }
        jqUtil('.modal-backdrop').css({height: jqUtil(window).height(), position: 'fixed'});
      });

      koInstance.utils.domNodeDisposal.addDisposeCallback(domElem, function () {
        jqElem.modal('destroy');
      });
      
      return { controlsDescendantBindings: true };
    }
  };
}

( function (moduleInitializer) {
  "use strict";
  // Unterstützung für verschiedene Ladeszenarien
  if ( typeof define === 'function' && define.amd ) {
    // AMD anonymes Modul

    define(["require", "exports", "knockout", "jquery"], function ( req, exp, koLib, jqLib ) {
      moduleInitializer(koLib, jqLib);
    });
  } else {
    // Kein Modul-Loader (einfacher <script>-Tag) - direkt im globalen Namensraum
    moduleInitializer(window.ko, jQuery);
  }
}( initKnockstrapBindings ));