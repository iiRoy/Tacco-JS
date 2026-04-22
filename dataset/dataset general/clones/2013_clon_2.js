/*  Modal Window for Prototype, version 1.0.1
 *  Authored by R. Gaal - http://wakoopa.com
 *
 *  Based upon Facebox by C. Wanstrath - http://famspam.com/facebox
 *  Initially ported to Prototype by P. Burrows - http://blog.philburrows.com
 *
 *  Permitted under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  For assistance, refer to the Google Groups mailing list:
 *  http://groups.google.com/group/facebox/
 *
 *  Prerequisites:   prototype & script.aculo.us + required image and CSS files
 *  Instructions:    Add 'rel="modalWindow"' to a link to activate the modal
 *
 *--------------------------------------------------------------------------*/


var ModalWindow = Class.create({
	setup	: function(additional_config){
		this.preferences = {
			loadingGraphicPath	: '/modal/wait.gif',
			closeButtonGraphic	: '/modal/closebtn.gif',
			graphicExtensions		: new RegExp('\.' + ['png', 'jpg', 'jpeg', 'gif'].join('|') + '$', 'i'),
			isInitialized				: true,	
			modalLayoutHTML	: '\
	  <div id="popupContainer" style="display:none;"> \
	    <div class="overlayBox"> \
	      <table id="containerTable"> \
	        <tbody> \
	          <tr> \
	            <td class="cornerTopLeft"/><td class="borderHorizontal"/><td class="cornerTopRight"/> \
	          </tr> \
	          <tr> \
	            <td class="borderHorizontal"/> \
	            <td class="contentArea"> \
	              <div class="mainContent"> \
	              </div> \
	              <div class="bottomBar"> \
	                <a href="#" class="closeLink"> \
	                  <img src="/modal/closebtn.gif" title="dismiss" class="closeIcon" /> \
	                </a> \
	              </div> \
	            </td> \
	            <td class="borderHorizontal"/> \
	          </tr> \
	          <tr> \
	            <td class="cornerBottomLeft"/><td class="borderHorizontal"/><td class="cornerBottomRight"/> \
	          </tr> \
	        </tbody> \
	      </table> \
	    </div> \
	  </div>'
		};
		if (additional_config) Object.extend(this.preferences, additional_config);
		$(document.body).insert({bottom: this.preferences.modalLayoutHTML});
		
		this.preloadedAssets = [ new Image(), new Image() ];
		this.preloadedAssets[0].src = this.preferences.closeButtonGraphic;
		this.preloadedAssets[1].src = this.preferences.loadingGraphicPath;
		
		var contextSelf = this;
		$$('#popupContainer .borderHorizontal:first, #popupContainer .cornerBottomLeft, #popupContainer .cornerBottomRight, #popupContainer .cornerTopLeft, #popupContainer .cornerTopRight').each(function(elementItem){
			contextSelf.preloadedAssets.push(new Image());
			contextSelf.preloadedAssets.slice(-1)[0].src = elementItem.getStyle('background-image').replace(/url\((.+)\)/, '$1');
		});
		
		this.modalElement = $('popupContainer');
        this.keyboardWatcher = this.handleKeyboardEvents.bindAsEventListener(this);
		
		this.monitorInteractionEvents();
		var currentInstance = this;
		Event.observe($$('#popupContainer .closeLink').first(), 'click', function(eventObj){
			Event.stop(eventObj);
			currentInstance.hidePanel()
		});
		Event.observe($$('#popupContainer .closeIcon').first(), 'click', function(eventObj){
			Event.stop(eventObj);
			currentInstance.hidePanel()
		});
	},
	
    handleKeyboardEvents : function(keyEvent){
        // Close if escape is pressed or if there's a click outside of the modal box
        if (keyEvent.keyCode == 27 || !Event.element(keyEvent).descendantOf(this.modalElement)) this.hidePanel();
    },
	
	monitorInteractionEvents	: function(eventObject){
		var instanceRef = this;
		$$('a[rel=modalWindow]').each(function(linkItem, indexVal){
			Event.observe(linkItem, 'click', function(clickEvent){
				Event.stop(clickEvent);
				instanceRef.processClick(linkItem, clickEvent);
			});
		});
	},
	
	showSpinner	: function() {
		if ($$('#popupContainer .loadingIndicator').length == 1) return true;
		
		var mainContentContainer = $$('#popupContainer .mainContent').first();
		mainContentContainer.childElements().each(function(childElem, idx){
			childElem.remove();
		});
		mainContentContainer.insert({bottom: '<div class="loadingIndicator"><img src="'+this.preferences.loadingGraphicPath+'"/></div>'});
		
		var viewportScrollOffsets = document.viewport.getScrollOffsets();
		this.modalElement.setStyle({
			'top': viewportScrollOffsets.top + (document.viewport.getHeight() / 10) + 'px',
			'left': document.viewport.getWidth() / 2 - (this.modalElement.getWidth() / 2) + 'px'
		});
		
        Event.observe(document, 'keypress', this.keyboardWatcher);
        Event.observe(document, 'click', this.keyboardWatcher);
	},
	
	displayContent	: function(displayData, customClass){
		this.showSpinner();
		var spinnerElement = $$('#popupContainer .loadingIndicator').first();
		if(spinnerElement) spinnerElement.remove();
		
		var contentDisplayArea = $$('#popupContainer .mainContent').first();
		if (customClass) contentDisplayArea.addClassName(customClass);
		contentDisplayArea.insert({bottom: displayData});
		
        $$('#popupContainer .contentArea').first().childElements().each(function(visibleElement, loopIndex){
            visibleElement.show();
        });
    		
		if(!this.modalElement.visible()) new Effect.Appear(this.modalElement, {duration: 0.3});
		this.modalElement.setStyle({
			'left': document.viewport.getWidth() / 2 - (this.modalElement.getWidth() / 2) + 'px'
		});
		
        Event.observe(document, 'keypress', this.keyboardWatcher);
        Event.observe(document, 'click', this.keyboardWatcher);
	},
	
	hidePanel		: function(){
		 new Effect.Fade('popupContainer', {duration: 0.3});
	},
	
	processClick	: function(clickedElement, clickEvent){
	  this.showSpinner();
		Event.stop(clickEvent);
		
		// support for rel="modalWindow[.inline_section]" syntax, to add a specific class
		var customClass = clickedElement.rel.match(/modalWindow\[\.(\w+)\]/);
		if (customClass) customClass = customClass[1];
		
		new Effect.Appear(this.modalElement, {duration: 0.3});
		
		if (clickedElement.href.match(/#/)){
			var currentURL	= window.location.href.split('#')[0];
			var targetID	= clickedElement.href.replace(currentURL+'#','');
			// var contentSource			= $$(targetID).first();
			var sourceElement			= $(targetID);
			// create a new element so as to not remove the original on close()
			var contentCopy = new Element(sourceElement.tagName);
			contentCopy.innerHTML = sourceElement.innerHTML;
			this.displayContent(contentCopy, customClass);
		} else if (clickedElement.href.match(this.preferences.graphicExtensions)) {
			var newGraphic = new Image();
			var currentContext = this;
			newGraphic.onload = function() {
				currentContext.displayContent('<div class="graphicDisplay"><img src="' + newGraphic.src + '" /></div>', customClass)
			}
			newGraphic.src = clickedElement.href;
		} else {
			var currentContext  = this;
			var requestURL = clickedElement.href;
			new Ajax.Request(requestURL, {
				method		: 'get',
				onFailure	: function(ajaxResponse){
					currentContext.displayContent(ajaxResponse.responseText, customClass);
				},
				onSuccess	: function(ajaxResponse){
					currentContext.displayContent(ajaxResponse.responseText, customClass);
				}
			});
			
		}
	}
});

var popupInstance;
document.observe('dom:loaded', function(){
	popupInstance = new ModalWindow();
});