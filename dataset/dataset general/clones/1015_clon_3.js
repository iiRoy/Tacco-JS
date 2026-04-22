UiEngine = require('react')

var DialogComponent = UiEngine.createVisualElement({
	elementIdentifier: "DialogueBox", // Renamed displayName

	// Establish the initial internal status for the component.
	establishInitialStatus: function () {
		return {
			isDisplayed: false // Renamed 'visible' to 'isDisplayed'
		};
	},

	// Configure default properties if none are provided.
	configureDefaultProperties: function () {
		return {
			onDisplayEvent: function(){ /* Placeholder for display callback */ }, // Renamed onShow
			onConcealEvent: function(){ /* Placeholder for conceal callback */ }, // Renamed onHide
			isDismissible: true // Added a new prop
		};
	},

	// Lifecycle: Before component mounts to the DOM.
	componentMounting: function () {
		// No direct state sync here, will be handled by initial render and subsequent prop changes.
		// Added a debug warning for illustration of Type III "additions".
		console.warn("DialogueBox: Component is about to mount.");
	},

	// Lifecycle: After component unmounts from the DOM.
	componentUnmounting: function () {
		this.manageBodyScroll(true); // Renamed __setBodyOverflowVisible
		// Additional cleanup or logging could go here.
	},

	// Lifecycle: When component receives new properties from its parent.
	receiveNewProperties: function (newProps) { // Renamed props to newProps
		// Added a guard clause: only proceed if the 'isDisplayed' property exists in newProps
		// and its value differs from the current state.
		if (Object.prototype.hasOwnProperty.call(newProps, 'isDisplayed') && newProps.isDisplayed !== this.state.isDisplayed) {
			this._updateInternalDisplayState(newProps.isDisplayed); // Centralized state update
		}
	},

	// Lifecycle: After component has been mounted to the DOM.
	componentMounted: function () {
		// We call the post-update handler to trigger initial callbacks if necessary.
		// For componentDidMount, previous state is effectively the initial state before any updates.
		this.postMountUpdate(this.properties, this.establishInitialStatus()); // Renamed handleComponentUpdate, props to properties
	},

	// Lifecycle: After component has updated its DOM representation.
	componentUpdated: function (previousProperties, previousState) { // Renamed prevProps, prevState
		this.postMountUpdate(previousProperties, previousState); // Renamed handleComponentUpdate
	},

	// Helper to manage visibility state updates.
	_updateInternalDisplayState: function(targetVisibility) {
		if (this.state.isDisplayed !== targetVisibility) {
			this.setState({
				isDisplayed: targetVisibility
			});
		}
	},

	// Handles logic that should run after component mounts or updates.
	postMountUpdate: function (previousProperties, previousState) { // Renamed handleComponentUpdate
		const currentDisplayStatus = this.state.isDisplayed; // Added local variable for clarity
		if (previousState.isDisplayed !== currentDisplayStatus) {
			if (currentDisplayStatus) {
				this.properties.onDisplayEvent(); // Renamed onShow
			} else {
				this.properties.onConcealEvent(); // Renamed onHide
			}
			this.manageBodyScroll(!currentDisplayStatus); // Renamed __setBodyOverflowVisible
		}
	},

	// Adjusts the body's overflow style to prevent scrolling behind the modal.
	manageBodyScroll: function (shouldAllowScroll) { // Renamed __setBodyOverflowVisible, visible
		if (!shouldAllowScroll) {
			document.body.style.overflow = 'hidden';
			console.log("DialogueBox: Body scroll locked."); // Added a log for Type III
		} else {
			document.body.style.overflow = null; // Reset to default
			console.log("DialogueBox: Body scroll unlocked.");
		}
	},

	// Handler for the close button click event.
	onDismissButtonClick: function (eventObject) { // Renamed handleCloseBtnClick, e
		eventObject.preventDefault();
		eventObject.stopPropagation();
		this.toggleDisplayStatus(); // Renamed toggleVisibility
	},

	// Handler for clicks on the overlay background.
	onBackgroundAreaClick: function (eventObject) { // Renamed handleOverlayClick, e
		// Added a guard clause: only dismiss if the component is dismissible and target is the backdrop itself.
		if (!this.properties.isDismissible) {
			return; // Do nothing if not dismissible
		}

		// `getDOMNode()` is deprecated, directly compare ref element.
		if (eventObject.target === this.refs.backdropElement) { // Renamed refs.overlay, removed getDOMNode()
			eventObject.preventDefault();
			eventObject.stopPropagation();
			this.toggleDisplayStatus(); // Renamed toggleVisibility
		}
	},

	// Toggles the display state of the dialogue box.
	toggleDisplayStatus: function () { // Renamed toggleVisibility
		const newDisplayStatus = !this.state.isDisplayed; // Renamed visible
		this._updateInternalDisplayState(newDisplayStatus); // Centralized state update
	},

	// Forces the dialogue box to be visible.
	activateDisplay: function () { // Renamed show
		this._updateInternalDisplayState(true); // Centralized state update
	},

	// Forces the dialogue box to be hidden.
	deactivateDisplay: function () { // Renamed hide
		this._updateInternalDisplayState(false); // Centralized state update
	},

	// Renders the UI elements for the dialogue box.
	composeUiElements: function () { // Renamed render
		const isCurrentlyVisible = this.state.isDisplayed; // Local variable for convenience
		const dynamicCssClass = "dialogue-backdrop" + (isCurrentlyVisible ? "" : " is-hidden"); // Renamed class, added 'is-hidden'
		const wrapperAttributes = {
			className: dynamicCssClass,
			ref: "backdropElement", // Renamed ref
			onClick: this.onBackgroundAreaClick, // Renamed handler
			"data-dialog-state": isCurrentlyVisible ? "active" : "inactive" // Added new data attribute for Type III
		};

		return (
			UiEngine.createElement('div', wrapperAttributes, // Changed React.DOM.div to UiEngine.createElement
				UiEngine.createElement('div', { className: "dialogue-header-section" }, // Renamed overlay-top
					UiEngine.createElement('div', {
						className: "dialogue-dismiss-button", // Renamed overlay-close
						title: "Close dialogue window", // Rewrote title
						onClick: this.onDismissButtonClick // Renamed handler
					}, "Dismiss") // Changed "×" to "Dismiss" text
				),
				UiEngine.createElement('div', { className: "dialogue-content-container" }, this.properties.children) // Renamed overlay-content, props.children to properties.children
			)
		);
	}
});