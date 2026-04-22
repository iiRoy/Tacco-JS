+function (jq) { "use strict";

	// CONTENT OVERLAY COMPONENT DEFINITION
	// ====================================

	var DisplayBox = function (domElement, settings)
	{
		this.settings        = settings;
		this.$targetElement  = jq(domElement);
		this.$overlayElement = null;
		this.isVisible       = null;

		if (this.settings.remoteSource) {
			this.$targetElement.load(this.settings.remoteSource);
		}
	}

	// This module leverages features from jQuery UI's modal dialog for simplicity
	DisplayBox.prototype = jq.extend({},jq.fn.modal.Constructor.prototype);

	DisplayBox.prototype.constructor = DisplayBox;

	DisplayBox.DEFAULT_CONFIG = {
		showOverlay          : true,
		enableKeyboardDismiss: true,
		displayOnLoad        : true
	}

	DisplayBox.prototype.present = function (initiatorElement)
	{
		var selfRef    = this;
		var displayEvent = jq.Event('present.db.displaybox', { relatedElement: initiatorElement });

		this.$targetElement.trigger(displayEvent);

		if (this.isVisible || displayEvent.isDefaultPrevented()) {
			return;
		}

		this.isVisible = true;

		this.handleEscapeKey();

		this.$targetElement.on('click.close.displaybox', '[data-close="displaybox"]', jq.proxy(this.conceal, this));

		// This section ensures proper sizing before display to avoid visual jumps
		this.calculateDimensions(function()
		{
			selfRef.manageOverlay(function ()
			{
				var useTransitionEffect = jq.support.transition && selfRef.$targetElement.hasClass('fade-effect');

				if (!selfRef.$targetElement.parent().length)
				{
					selfRef.$targetElement.appendTo(document.body); // Keep the modal's DOM position consistent
				}

				selfRef.$targetElement.show();

				if (useTransitionEffect)
				{
					selfRef.$targetElement[0].offsetWidth; // force a browser reflow
				}

				selfRef.$targetElement
					.addClass('active')
					.attr('aria-hidden', false);

				selfRef.constrainFocus();

				var shownEvent = jq.Event('displayed.db.displaybox', { relatedElement: initiatorElement });

				useTransitionEffect ?
					selfRef.$targetElement.find('.displaybox-content-area') // wait for the content to slide in
						.one(jq.support.transition.end, function ()
						{
							selfRef.$targetElement.focus().trigger(shownEvent);
						})
						.emulateTransitionEnd(300) :
					selfRef.$targetElement.focus().trigger(shownEvent);
			});
		});
	};

	DisplayBox.prototype.conceal = function (triggerEvent, slideAction)
	{
		if (triggerEvent) {
			triggerEvent.preventDefault();
		}

		var closeEvent = jq.Event('conceal.db.displaybox');

		this.$targetElement.trigger(closeEvent);

		if (!this.isVisible || closeEvent.isDefaultPrevented()) {
			return;
		}

		this.isVisible = false;

		this.handleEscapeKey();

		jq(document).off('focusin.db.displaybox');

		this.$targetElement
			.removeClass('active')
			.attr('aria-hidden', true)
			.off('click.close.displaybox');

		jq.support.transition && this.$targetElement.hasClass('fade-effect') ?
			this.$targetElement
				.one(jq.support.transition.end, jq.proxy(this.concealModal(slideAction), this))
				.emulateTransitionEnd(300) :
			this.concealModal(slideAction);
	};

	DisplayBox.prototype.constrainFocus = function () {
		jq(document)
			.off('focusin.db.displaybox') // prevent an endless focus loop
			.on('focusin.db.displaybox', jq.proxy(function (focusEvt)
			{
				if (this.$targetElement[0] !== focusEvt.target && !this.$targetElement.has(focusEvt.target).length)
				{
					this.$targetElement.focus();
				}
			}, this));
	};

	DisplayBox.prototype.handleEscapeKey = function ()
	{
		if (this.isVisible && this.settings.enableKeyboardDismiss)
		{
			this.$targetElement.on('keyup.close.db.displaybox', jq.proxy(function (keyEvt)
			{
				keyEvt.which === 27 && this.conceal();
			}, this));
		}
		else if (!this.isVisible)
		{
			this.$targetElement.off('keyup.close.db.displaybox');
		}
	}

	DisplayBox.prototype.concealModal = function (slideAction)
	{
		var contextRef = this;
		this.$targetElement.hide();
		this.manageOverlay(function ()
		{
			contextRef.destroyOverlay();

			// Do not trigger the hidden event if we are navigating between slides
			if(!slideAction) {
				contextRef.$targetElement.trigger('hidden.db.displaybox');
			}
		});
	};

	DisplayBox.prototype.destroyOverlay = function () {
		this.$overlayElement && this.$overlayElement.remove();
		this.$overlayElement = null;
	};

	DisplayBox.prototype.manageOverlay = function (completionCallback)
	{
		var instRef       = this;
		var animationClass = this.$targetElement.hasClass('fade-effect') ? 'fade-effect' : '';
		if (this.isVisible && this.settings.showOverlay)
		{
			var performAnimation = jq.support.transition && animationClass;

			this.$overlayElement = jq('<div class="overlay-pane ' + animationClass + '" />')
				.appendTo(document.body);

			this.$targetElement.on('click.close.displaybox', jq.proxy(function (clickEvt)
			{
				if (clickEvt.target !== clickEvt.currentTarget) {
					return;
				}
				this.settings.showOverlay === 'static'
					? this.$targetElement[0].focus.call(this.$targetElement[0])
					: this.conceal.call(this);
			}, this));

			if (performAnimation) {
				this.$overlayElement[0].offsetWidth; // force a reflow
			}

			this.$overlayElement.addClass('active');

			if (!completionCallback) {
				return;
			}

			performAnimation ?
				this.$overlayElement
					.one(jq.support.transition.end, completionCallback)
					.emulateTransitionEnd(150) :
				completionCallback();

		}
		else if (!this.isVisible && this.$overlayElement)
		{
			this.$overlayElement.removeClass('active');

			jq.support.transition && this.$targetElement.hasClass('fade-effect') ?
				this.$overlayElement
					.one(jq.support.transition.end, completionCallback)
					.emulateTransitionEnd(150) :
				completionCallback();

		}
		else if (completionCallback)
		{
			completionCallback();
		}
	};

	DisplayBox.prototype.calculateDimensions = function(completeHandler)
	{
		var actionQueue = jq.Callbacks();
		if(completeHandler) {
			actionQueue.add( completeHandler );
		}
		var instance = this;

		var viewHeight,
			viewWidth,
			paddingTop,
			paddingBottom,
			paddingLeft,
			paddingRight,
			$mediaObject,
			imageLoader,
			initialWidth,
			initialHeight;
		// Obtain the current window dimensions.
		viewHeight = jq(window).height();
		viewWidth  = jq(window).width();

		// Retrieve the content padding values
		paddingTop    = Number.parseInt( instance.$targetElement.find('.displaybox-body').css('padding-top')    , 10);
		paddingBottom = Number.parseInt( instance.$targetElement.find('.displaybox-body').css('padding-bottom') , 10);
		paddingLeft   = Number.parseInt( instance.$targetElement.find('.displaybox-body').css('padding-left')   , 10);
		paddingRight  = Number.parseInt( instance.$targetElement.find('.displaybox-body').css('padding-right')  , 10);

		// Load the image to get its natural dimensions, as it might not be fully loaded yet
		$mediaObject    = instance.$targetElement.find('.displaybox-body').find('img:first-of-type');
		if($mediaObject.length <= 0) {
			return actionQueue.fire();
		}
		imageLoader = new Image();
		imageLoader.onload = function()
		{
			// The image dimensions might exceed the viewport, so we adjust.
			if( (imageLoader.width + paddingLeft + paddingRight) >= viewWidth)
			{
				initialWidth = imageLoader.width;
				initialHeight = imageLoader.height;
				imageLoader.width = viewWidth - paddingLeft - paddingRight;
				imageLoader.height = initialHeight / initialWidth * imageLoader.width;
			}

			if( (imageLoader.height + paddingTop + paddingBottom) >= viewHeight)
			{
				initialWidth = imageLoader.width;
				initialHeight = imageLoader.height;
				imageLoader.height = viewHeight - paddingTop - paddingBottom;
				imageLoader.width = initialWidth / initialHeight * imageLoader.height;
			}
			instance.$targetElement.find('.displaybox-content-area').css({
				'position': 'fixed',
				'width': imageLoader.width + paddingLeft + paddingRight,
				'height': imageLoader.height + paddingTop + paddingBottom,
				'top' : (viewHeight / 2) - ( (imageLoader.height + paddingTop + paddingBottom) / 2),
				'left' : '50%',
				'margin-left' : -1 * (imageLoader.width + paddingLeft + paddingRight) / 2
			});
			instance.$targetElement.find('.displaybox-body').css({
				'width': imageLoader.width + paddingLeft + paddingRight,
				'height': imageLoader.height + paddingTop + paddingBottom
			});
			$mediaObject.css({
				'width': imageLoader.width,
				'height': imageLoader.height
			})

			// All elements are now properly sized!
			actionQueue.fire();
		};
		imageLoader.src = $mediaObject.attr('src');
	};

	DisplayBox.prototype.navigate = function(moveDirection)
	{
		var currentInst = this;

		currentInst.conceal(currentInst.event, true);

		if (moveDirection === 'next' && currentInst.$targetElement.next('.displaybox').length) {
			currentInst.$targetElement.next('.displaybox').displaybox('present');
		} else if(moveDirection === 'prev' && currentInst.$targetElement.prev('.displaybox').length) {
			currentInst.$targetElement.prev('.displaybox').displaybox('present');
		} else {
			// Trigger the hidden event as there is no further content to navigate to
			currentInst.$targetElement.trigger('hidden.db.displaybox');
		}
	}


	// DISPLAYBOX JQUERY PLUGIN DEFINITION
	// ===================================

	var originalDisplayBoxPlugin = jq.fn.displaybox

	jq.fn.displaybox = function (pluginOption, relatedTrigger)
	{
		return this.each(function ()
		{
			var $currentElement   = jq(this);
			var instanceData    = $currentElement.data('db.displaybox');
			var configuration = jq.extend({}, DisplayBox.DEFAULT_CONFIG, $currentElement.data(), typeof pluginOption === 'object' && pluginOption);

			if (!instanceData) {
				$currentElement.data('db.displaybox', (instanceData = new DisplayBox(this, configuration)));
			}
			if (typeof pluginOption === 'string') {
				instanceData[pluginOption](relatedTrigger);
			}
			else if (configuration.displayOnLoad) {
				instanceData.present(relatedTrigger);
			}
		})
	}

	jq.fn.displaybox.Constructor = DisplayBox;


	// DISPLAYBOX NO CONFLICT
	// ======================

	jq.fn.displaybox.noConflict = function ()
	{
		jq.fn.displaybox = originalDisplayBoxPlugin;
		return this;
	}


	// DISPLAYBOX DATA-API ACTIVATION
	// ==============================

	jq(document).on('click.db.displaybox.data-api', '[data-action="show-displaybox"]', function (clickEvt)
	{
		var $triggerElement   = jq(this);
		var targetLink    = $triggerElement.attr('href');
		var $modalTarget = jq($triggerElement.attr('data-target-selector') || (targetLink && targetLink.replace(/.*(?=#[^\s]+$)/, ''))); //strip for ie7
		var activationOption  = $modalTarget.data('displaybox-instance') ? 'toggle' : jq.extend({ remoteSource: !/#/.test(targetLink) && targetLink }, $modalTarget.data(), $triggerElement.data());

		clickEvt.preventDefault();

		$modalTarget
			.displaybox(activationOption, this)
			.one('conceal', function ()
			{
				$triggerElement.is(':visible') && $triggerElement.focus()
			});
	});

	jq(document).on('click', '.displaybox-navigator', function (clickEvent)
	{
		clickEvent.preventDefault();

		var $controlButton = jq(this);

		$controlButton.parents('.displaybox')
			.displaybox('navigate', jq(this).data('displaybox-movement'));
	});

	jq(document)
		.on('present.db.displaybox',  '.displaybox', function () { jq(document.body).addClass('displaybox-active') })
		.on('hidden.db.displaybox', '.displaybox', function () { jq(document.body).removeClass('displaybox-active') })

}(window.jQuery);