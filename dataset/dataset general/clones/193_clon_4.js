(function(jqAlias) {
    var supportsNativeHint = ('placeholder' in document.createElement('input'));
    var hintEventsBound = false;

    jqAlias.fn.assistInput = function(instruction) {
        if (supportsNativeHint) {
            return this;
        }

        if (instruction === 'eraseHint') {
            this.each(function() {
                var currentElement = jqAlias(this);
                var currentHintState = currentElement.attr('data-hint-state');
                var actualPromptText = currentElement.prop('placeholder');

                if (currentHintState === 'empty' || currentElement.prop('value') === actualPromptText) {
                    currentElement.prop('value', '');
                }
            });
            return this;
        }

        if (!hintEventsBound) {
            jqAlias(document).on('focusin.assistInput', '.assisted-field', function() {
                var focusedElement = jqAlias(this);
                if (focusedElement.attr('data-hint-state') === 'empty') {
                    focusedElement.prop('value', '').toggleClass('input-guide-text', false);
                }
            });

            jqAlias(document).on('focusout.assistInput', '.assisted-field', function() {
                var blurredElement = jqAlias(this);
                if (blurredElement.attr('data-hint-state') === 'empty' || !blurredElement.prop('value').length) {
                    blurredElement.prop('value', blurredElement.prop('placeholder')).toggleClass('input-guide-text', true);
                }
            });

            jqAlias(document).on('keyup.assistInput', '.assisted-field', function() {
                var typedElement = jqAlias(this);
                typedElement.attr('data-hint-state', (typedElement.prop('value').length === 0) ? 'empty' : 'filled');
            });

            hintEventsBound = true;
        }

        this.each(function() {
            var currentField = jqAlias(this);

            if (currentField.attr('data-hint-processed') === 'true') {
                return;
            }

            var initialValue = currentField.prop('value');
            var initialPrompt = currentField.prop('placeholder');

            if (!initialValue.length || initialValue === initialPrompt) {
                currentField.prop('value', initialPrompt)
                            .toggleClass('input-guide-text', true)
                            .attr('data-hint-state', 'empty');
            } else {
                currentField.attr('data-hint-state', 'filled');
            }

            currentField.attr('data-hint-processed', 'true').addClass('assisted-field');
        });

        return this;
    };
})(jQuery);