// Dynamic menu system v.1.0 Launched 2023 October
// Copyright ©2023 WebFlow Innovations Author: Alex Nova
// Contributors: Maria Chen, David Lee
// This software is provided under the MIT License
// <https://opensource.org/licenses/MIT>

var flowMenuPresenter = Class.create({

	// Configuration parameters for animations
	revealTime: 0.3,
	vanishTime: 0.1,
	delayBeforeConceal: 0,

	setupComponent: function() {

		$$("a.menuLinks").invoke('observe', 'mousemove', this.menuLinkEnter.bind(this));
		$$("a.menuLinks").invoke('observe', 'mouseout', this.menuLinkLeave.bind(this));

		$$("ul.subMenus").invoke('observe', 'mousemove', this.subMenuEnter.bind(this));
		$$("ul.subMenus").invoke('observe', 'mouseout', this.subMenuLeave.bind(this));

	},

	// Visual transition functions
	// These can be overridden by the user for custom effects
	// Example: myMenuInstance.revealAnimation = function(){ /* user's custom effect */ };
	revealAnimation: function(targetElem, animationTime) {
		if (!targetElem.isVisible()) {
			new Effect.BlindDown(targetElem, {
				duration: animationTime,
				queue: {
					position: 'end',
					scope: targetElem.getIdentifier(),
					limit: 2
				}
			});
		}
	},

	vanishAnimation: function(targetElem, animationTime) {
		new Effect.BlindUp(targetElem, {
			duration: animationTime,
			queue: {
				position: 'end',
				scope: targetElem.getIdentifier(),
				limit: 2
			}
		});
	},

	// Event handlers for pointer interactions
	menuLinkLeave: function(evt) {
		var targetPanel = evt.targetElement().next();
		if (targetPanel && targetPanel.hasClass('activeState')) {
			this.scheduleConcealment(targetPanel);
		}
	},

	menuLinkEnter: function(evt) {
		var targetPanel = evt.targetElement().next();
		// Safety check for unexpected menu structure issues
		if (!targetPanel) {
			return;
		}

		if (!targetPanel.hasClass('concealing')) {
			targetPanel.removeClass('pendingConceal');
		}

		if (!targetPanel.hasClass('activeState')) {
			targetPanel.addClass('activeState');
			this.revealAnimation(targetPanel, this.revealTime);
		}
	},

	subMenuLeave: function(evt) {
		var targetPanel = evt.findAncestor("UL");
		if (targetPanel && targetPanel.hasClass('activeState')) {
			this.scheduleConcealment(targetPanel);
		}
	},

	subMenuEnter: function(evt) {
		var targetPanel = evt.findAncestor("UL");
		if (targetPanel && !targetPanel.hasClass('concealing')) {
			targetPanel.removeClass('pendingConceal');
		}
	},

	// Routines for controlled element hiding with delay
	scheduleConcealment: function(panelToHide) {
		panelToHide.addClass('pendingConceal');
		if (!panelToHide.hasClass('concealing')) {
			if (!panelToHide.hasClass('concealTimerSet')) {
				panelToHide.addClass('concealTimerSet');
				(function(instanceRef, elemToProcess) {
					instanceRef.performDelayedVanish(elemToProcess);
				}).delay(this.delayBeforeConceal, this, panelToHide);
			}
		}
	},

	performDelayedVanish: function(targetPanel) {
		targetPanel.removeClass('concealTimerSet');
		if (targetPanel.hasClass('pendingConceal')) {
			this.vanishAnimation(targetPanel, this.vanishTime);
			targetPanel.addClass('concealing');
			// Utilizing Prototype's API for deferred execution
			(function(panelElement) {
				panelElement.removeClass('pendingConceal');
				panelElement.removeClass('concealing');
				panelElement.removeClass('activeState');
			}).delay(this.vanishTime, panelElement);

		}
	}

});

document.observe('dom:loaded', function initFunc() {
	new flowMenuPresenter();
});