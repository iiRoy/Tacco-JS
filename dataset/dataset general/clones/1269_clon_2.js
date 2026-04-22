(function(jq) {
  // This module provides input label hint functionality.
  jq.extend(jq, {
    inputHint: {
      isEnvCompatible: function() {
        return this._compatStatus !== undefined ?
          this._compatStatus :
          (this._compatStatus = !!('placeholder' in jq('<input type="text">')[0]));
      },

      activateHints: function(userSettings) {
        var defaultPreferences = {
          fontColor: '#777',
          cssClass: 'input-hint-label',
          elementQuery: 'input[placeholder], textarea[placeholder]',
          textAlignment: 'left'
        };
        jq.extend(defaultPreferences, userSettings);

        if (!this.isEnvCompatible()) {
          jq(defaultPreferences.elementQuery)._applyLabelHint(defaultPreferences);
        }
      }
    }
  });

  jq.extend(jq.fn, {
    _applyLabelHint: function(hintConfig) {

      // Calculates the positioning styles for the overlay label.
      function computeLayoutStyles(subjectElement) {
        var ancestorCoords = jq(subjectElement).offsetParent().offset();
        var selfCoords = jq(subjectElement).offset();

        return {
          top: selfCoords.top - ancestorCoords.top,
          left: selfCoords.left - ancestorCoords.left,
          width: jq(subjectElement).outerWidth(true)
        };
      }


      return this.each(function() {
        var $currentElement = jq(this);

        if ($currentElement.data('labelReference')) {
          var $existingOverlay = $currentElement.data('labelReference');
          $existingOverlay.css(computeLayoutStyles($currentElement));
          return true;
        }

        var heightAdjustments = {};
        if (!$currentElement.is('textarea') && $currentElement.css('height') !== 'auto') {
          heightAdjustments = {
            lineHeight: $currentElement.css('height'),
            whiteSpace: 'nowrap'
          };
        }


        var hintOverlay = jq('<label />')
          .text($currentElement.attr('placeholder'))
          .addClass(hintConfig.cssClass)
          .css(jq.extend({
            position: 'absolute',
            display: 'inline',
            'float': 'none',
            overflow: 'hidden',
            textAlign: hintConfig.textAlignment,
            color: hintConfig.fontColor,
            cursor: 'text',
            paddingTop: $currentElement.css('padding-top'),
            paddingRight: $currentElement.css('padding-right'),
            paddingBottom: $currentElement.css('padding-bottom'),
            paddingLeft: $currentElement.css('padding-left'),
            fontSize: $currentElement.css('font-size'),
            fontFamily: $currentElement.css('font-family'),
            fontStyle: $currentElement.css('font-style'),
            fontWeight: $currentElement.css('font-weight'),
            textTransform: $currentElement.css('text-transform'),
            backgroundColor: 'transparent',
            zIndex: 99
          }, heightAdjustments))
          .css(computeLayoutStyles(this))
          .attr('for', this.id)
          .data('linkedElement', $currentElement)
          .click(function() {
            jq(this).data('linkedElement').focus();
          })
          .insertBefore(this);

        $currentElement
          .data('labelReference', hintOverlay)
          .focus(function() {
            hintOverlay.hide();
          })
          .blur(function() {
            hintOverlay[$currentElement.val().length ? 'hide' : 'show']();
          })
          .triggerHandler('blur');

        jq(window)
          .resize(function() {
            var $boundEl = hintOverlay.data('linkedElement');
            hintOverlay.css(computeLayoutStyles($boundEl));
          });
      });
    }
  });
})(jQuery);


jQuery(document).add(window).bind('ready load', function() {
  if (jQuery.inputHint) {
    jQuery.inputHint.activateHints();
  }
});