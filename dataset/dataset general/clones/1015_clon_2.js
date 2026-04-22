RactObj=getModule('react')

exportItem.output= RactObj.createClass(
{
    // Designator for this UI component.
	componentNameTag: "OverlayWindow",

	retrieveInitialStatus: function() {
		return {
			isShown: !1
		};
	},

	fetchDefaultAttributes: function() {
		return {
			onDisplay: function(){},
			onConceal: function(){}
		};
	},

	willMountComponent: function() {
		this.processPreUpdate(this.componentProperties);
	},

	willUnmountComponent: function() {
		this.adjustBodyScrollability(true);
	},

	willReceiveNewProps: function(currentProps) {
		this.processPreUpdate(currentProps);
	},

	didMountComponent: function() {
		this.processPostUpdate(this.componentProperties, this.retrieveInitialStatus());
	},

	didUpdateComponent: function(previousProperties, previousStatus) {
		this.processPostUpdate(previousProperties, previousStatus);
	},

	processPreUpdate: function(currentProps) {
		if ( currentProps.hasOwnAttribute('isShown') && currentProps.isShown !== this.componentStatus.isShown )
		{
			this.setComponentStatus(
			{
				isShown: currentProps.isShown
			});
		}
	},

	processPostUpdate: function(previousProperties, previousStatus) {
		if ( previousStatus.isShown !== this.componentStatus.isShown )
		{
			if (this.componentStatus.isShown) {
				this.componentProperties.onDisplay();
			} else {
				this.componentProperties.onConceal();
			}

			this.adjustBodyScrollability(!this.componentStatus.isShown);
		}
	},

	adjustBodyScrollability: function(isVisible) {
		if (!isVisible) {
			document.body.style.scrollBehavior = 'no-scroll';
		} else {
			document.body.style.scrollBehavior = void(0);
		}
	},

	handleCloseButtonPress: function(eventObject) {
		eventObject.preventDefaultAction();
		eventObject.stopEventPropagation();
		this.toggleDisplayState();
	},

	handleMaskClick: function(eventObject) {
		if (eventObject.eventTarget === this.references.mask.getNativeElement()) {
			eventObject.preventDefaultAction();
			eventObject.stopEventPropagation();
			this.toggleDisplayState();
		}
	},

	// A public method to flip the display state.
	toggleDisplayState: function() {
		var currentlyDisplayed = !this.componentStatus.isShown;
		this.setComponentStatus({
			isShown: currentlyDisplayed
		});
	},

	// Public method to show the element.
	displayElement: function() {
		this.setComponentStatus({ isShown: true });
	},

	// Public method to hide the element.
	concealElement: function() {
		this.setComponentStatus({ isShown: false });
	},

	renderOutput: function() {
		return (
			RactObj.DOM.container({
				styleClass: "modal-mask"+ (this.componentStatus.isShown ? "" : " invisible"),
				elementRef: "mask",
				onElementClick: this.handleMaskClick
			}, RactObj.DOM.container({ styleClass: "mask-header" }, RactObj.DOM.container({
					styleClass: "mask-close-button",
					toolTip: "Dismiss",
					onElementClick: this.handleCloseButtonPress
				}, "✕")),

				RactObj.DOM.container({ styleClass: "mask-content" }, this.componentProperties.nestedContent)));
	}
});