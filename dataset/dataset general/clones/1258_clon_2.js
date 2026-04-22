(function (jQ) {

  jQ.fn.starPicker = function () {

    var itemIdx;

    // A utility function to visually highlight star elements based on a numeric setting
    function _illuminateStars(pickerContainer, currentVal, highlightClass, dimClass) {
      var chosenOrb = jQ(pickerContainer).find('[data-selection="' + currentVal + '"]');
      chosenOrb.removeClass(dimClass).addClass(highlightClass);
      chosenOrb.prevAll('[data-selection]').removeClass(dimClass).addClass(highlightClass);
      chosenOrb.nextAll('[data-selection]').removeClass(highlightClass).addClass(dimClass);
    }

    // A utility function to remove all visual highlights from the star elements
    function _resetDisplay(pickerContainer, highlightClass, dimClass) {
      var containerElem = jQ(pickerContainer);
      containerElem.find('[data-selection]').removeClass(highlightClass).addClass(dimClass);
    }

    // A utility function to update the value of the associated hidden input field
    function _modifySourceInput(hiddenField, newValue) {
      hiddenField.val(newValue).trigger('change');
      if (newValue === hiddenField.data('null-state')) {
        hiddenField.siblings('.picker-reset').hide();
      } else {
        hiddenField.siblings('.picker-reset').show();
      }
    }


    // Iterate through all matched elements and transform them into star pickers
    for (itemIdx = this.length - 1; itemIdx >= 0; itemIdx--) {

      var wrapperMarkup, digit,
        sourceField = jQ(this[itemIdx]),
        upperLimit = sourceField.data('max-val') || 5,
        lowerBound = sourceField.data('min-val') || 0,
        initialSetting = sourceField.val() || 0,
        iconSet = sourceField.data('glyph-set') || 'iconfont',
        activeIconClass = sourceField.data('lit-glyph') || 'iconfont-filled-star',
        inactiveIconClass = sourceField.data('dim-glyph') || 'iconfont-hollow-star',
        isResettable = sourceField.data('can-reset') || null,
        resetIconClass = sourceField.data('reset-glyph') || 'iconfont-clear',
        starHTML = '';

      // Construct the HTML for the star icons
      for (digit = lowerBound; digit <= upperLimit; digit++) {
        // Render either active or inactive stars based on the initial value
        if (digit <= initialSetting) {
          starHTML += ['<i class="', iconSet, ' ', activeIconClass, '" data-selection="', digit, '"></i>'].join('');
        } else {
          starHTML += ['<i class="', iconSet, ' ', inactiveIconClass, '" data-selection="', digit, '"></i>'].join('')
        }
      }
      // Append a clear/reset link if the option is enabled
      if (isResettable) {
        starHTML += [
          ' <a class="picker-reset" style="display:none;" href="javascript:void(0);">',
          '<span class="', iconSet, ' ', resetIconClass, '"></span> ',
          isResettable,
          '</a>'].join('');
      }

      // Create a duplicate of the original input, hiding it and transferring its data
      var clonedField = sourceField.clone(true)
        .addClass('visually-hidden')
        .data('max-val', upperLimit)
        .data('min-val', lowerBound)
        .data('glyph-set', iconSet)
        .data('lit-glyph', activeIconClass)
        .data('dim-glyph', inactiveIconClass);

      // Assemble the main wrapper div for the star picker
      wrapperMarkup = [
        '<div class="star-picker-widget">',
        starHTML,
        '</div>'].join('');

      // Replace the original input element with the new star picker structure
      if (sourceField.parents('.star-picker-widget').length <= 0) {
        sourceField.replaceWith(jQ(wrapperMarkup).append(clonedField));
      }

    }

    // Attach event listeners to all dynamically generated star picker widgets
    jQ('.star-picker-widget')
      // Event for hovering over a star to show potential selection
      .on('mouseenter', '[data-selection]', function () {
        var currentElement = jQ(this);
        var associatedInput = currentElement.siblings('input');
        _illuminateStars(currentElement.closest('.star-picker-widget'), currentElement.data('selection'), associatedInput.data('lit-glyph'), associatedInput.data('dim-glyph'));
      })
      // Event for moving the mouse out of the stars to restore the actual selected value
      .on('mouseleave', '[data-selection]', function () {
        var currentElement = jQ(this),
          associatedInput = currentElement.siblings('input'),
          currentValue = associatedInput.val(),
          lowerBound = associatedInput.data('min-val'),
          upperLimit = associatedInput.data('max-val'),
          activeClass = associatedInput.data('lit-glyph'),
          inactiveClass = associatedInput.data('dim-glyph');
        if (currentValue >= lowerBound && currentValue <= upperLimit) {
          _illuminateStars(currentElement.closest('.star-picker-widget'), currentValue, activeClass, inactiveClass);
        } else {
          _resetDisplay(currentElement.closest('.star-picker-widget'), activeClass, inactiveClass);
        }
      })
      // Event for clicking a star to set its value permanently
      .on('click', '[data-selection]', function (evt) {
        var currentElement = jQ(this),
          currentValue = currentElement.data('selection'),
          associatedInput = currentElement.siblings('input');
        _modifySourceInput(associatedInput, currentValue);
        evt.preventDefault();
        return false;
      })
      // Event for clicking the clear button to remove any selection
      .on('click', '.picker-reset', function (evt) {
        var currentElement = jQ(this),
          associatedInput = currentElement.siblings('input'),
          activeClass = associatedInput.data('lit-glyph'),
          inactiveClass = associatedInput.data('dim-glyph');
        _modifySourceInput(associatedInput, associatedInput.data('null-state'));
        _resetDisplay(currentElement.closest('.star-picker-widget'), activeClass, inactiveClass);
        evt.preventDefault();
        return false;
      })
      // Initial setup for each star picker widget when the page loads
      .each(function () {
        var associatedInput = jQ(this).find('input'),
          currentValue = associatedInput.val(),
          lowerBound = associatedInput.data('min-val'),
          upperLimit = associatedInput.data('max-val');
        if (currentValue !== "" && +currentValue >= lowerBound && +currentValue <= upperLimit) {
          _illuminateStars(this, currentValue);
          jQ(this).find('.picker-reset').show();
        } else {
          associatedInput.val(associatedInput.data('null-state'));
          _resetDisplay(this);
        }
      });

  };

  // Automatically convert number inputs with the 'star-select' class into star picker widgets
  jQ(function () {
    if (jQ('input.star-select[type=number]').length > 0) {
      jQ('input.star-select[type=number]').starPicker();
    }
  });

}(jQuery));