const componentRegistry = new WeakMap();

const standardSettings = {
  suggestionCssClass: "domain-suggestion-visual",
  availableDomains: [
    "yahoo.com", "hotmail.com", "gmail.com", "me.com", "aol.com", "mac.com",
    "live.com", "comcast.net", "googlemail.com", "msn.com", "hotmail.co.uk",
    "yahoo.co.uk", "facebook.com", "verizon.net", "sbcglobal.net", "att.net",
    "gmx.com", "outlook.com", "icloud.com"
  ]
};

class DomainHintGenerator {
  constructor(targetField, componentOptions = {}) {
    if (!(targetField instanceof HTMLInputElement)) {
      throw new Error("Target element must be an HTML input field.");
    }

    this.inputField = targetField;
    this.configuredSettings = Object.assign({}, standardSettings, componentOptions);
    this.domainOptions = this.configuredSettings.availableDomains;

    this.currentTextValue = "";
    this.activeHintText = "";
    this.fieldLeftEdgeOffset = 0;

    this.initializeUIElements();
  }

  initializeUIElements() {
    const fieldComputedStyle = window.getComputedStyle(this.inputField);
    const getNumericalStyle = (prop) => parseFloat(fieldComputedStyle[prop]) || 0;

    // Calculate total left offset (padding + border + margin) for positioning
    this.fieldLeftEdgeOffset = getNumericalStyle('paddingLeft') + getNumericalStyle('borderLeftWidth') + getNumericalStyle('marginLeft');

    // Create a wrapper container for the input and its auxiliary elements
    this.outerContainer = document.createElement("div");
    this.outerContainer.className = "dhs-input-wrapper";
    Object.assign(this.outerContainer.style, {
      display: fieldComputedStyle.display,
      position: "relative",
      fontSize: fieldComputedStyle.fontSize
    });

    this.inputField.parentNode.insertBefore(this.outerContainer, this.inputField);
    this.outerContainer.appendChild(this.inputField);

    // Create a hidden span to accurately measure the current input text width
    this.widthMeasuringSpan = document.createElement("span");
    this.widthMeasuringSpan.className = "dhs-width-tester";
    Object.assign(this.widthMeasuringSpan.style, {
      visibility: "hidden",
      position: "absolute",
      display: "inline-block",
      fontFamily: fieldComputedStyle.fontFamily,
      fontWeight: fieldComputedStyle.fontWeight,
      letterSpacing: fieldComputedStyle.letterSpacing,
      whiteSpace: "pre" // Crucial for accurate text width measurement
    });
    this.outerContainer.appendChild(this.widthMeasuringSpan);

    // Create the suggestion overlay element
    const fieldHeight = this.inputField.offsetHeight;
    const fieldClientHeight = this.inputField.clientHeight;
    const verticalPaddingAndBorder = (fieldHeight - fieldClientHeight) / 2;

    this.hintDisplayOverlay = document.createElement("span");
    this.hintDisplayOverlay.className = this.configuredSettings.suggestionCssClass;
    Object.assign(this.hintDisplayOverlay.style, {
      display: "block",
      boxSizing: "content-box",
      lineHeight: fieldComputedStyle.lineHeight,
      paddingTop: verticalPaddingAndBorder + "px",
      paddingBottom: verticalPaddingAndBorder + "px",
      fontFamily: fieldComputedStyle.fontFamily,
      fontWeight: fieldComputedStyle.fontWeight,
      letterSpacing: fieldComputedStyle.letterSpacing,
      position: "absolute",
      top: "0",
      left: "0"
    });
    this.outerContainer.appendChild(this.hintDisplayOverlay);

    // Attach event listeners
    this.inputField.addEventListener("keyup", this.updateHintDisplay.bind(this));
    this.inputField.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "Tab") {
        this.completeInputWithHint();
      }
    });
    this.hintDisplayOverlay.addEventListener("mousedown", this.completeInputWithHint.bind(this));
    this.hintDisplayOverlay.addEventListener("touchstart", this.completeInputWithHint.bind(this));
  }

  // Generates the completion part of the email domain
  deriveCompletionFragment(fullInputString) {
    const sections = fullInputString.split("@");
    if (sections.length < 2) {
      return "";
    }

    const domainPrefix = sections.pop();
    if (!domainPrefix.length) {
      return "";
    }

    const matchingDomain = this.domainOptions.find(domain =>
      domain.startsWith(domainPrefix)
    );

    return matchingDomain ? matchingDomain.substring(domainPrefix.length) : "";
  }

  // Applies the current hint to the input field
  completeInputWithHint() {
    if (!this.activeHintText) {
      return false;
    }
    this.inputField.value = this.currentTextValue + this.activeHintText;
    this.hintDisplayOverlay.textContent = "";
    this.widthMeasuringSpan.textContent = "";
    this.activeHintText = ""; // Clear internal hint state
    this.currentTextValue = this.inputField.value; // Update stored value
  }

  // Updates and displays the suggestion overlay based on current input
  updateHintDisplay() {
    this.currentTextValue = this.inputField.value;
    this.activeHintText = this.deriveCompletionFragment(this.currentTextValue);

    this.hintDisplayOverlay.textContent = this.activeHintText;
    this.widthMeasuringSpan.textContent = this.currentTextValue;

    const currentTextRenderedWidth = this.widthMeasuringSpan.offsetWidth;

    if (this.inputField.offsetWidth > currentTextRenderedWidth) {
      this.hintDisplayOverlay.style.left = (this.fieldLeftEdgeOffset + currentTextRenderedWidth) + "px";
    }
  }
}

// Global factory function to instantiate the widget
function setupEmailDomainCompletion(selectorOrElement, configuration = {}) {
  let elementsToProcess;
  if (typeof selectorOrElement === 'string') {
    elementsToProcess = document.querySelectorAll(selectorOrElement);
  } else if (selectorOrElement instanceof HTMLElement) {
    elementsToProcess = [selectorOrElement];
  } else {
    console.error("Invalid target for setupEmailDomainCompletion: must be a CSS selector string or an HTMLElement.");
    return;
  }

  elementsToProcess.forEach(element => {
    if (!componentRegistry.has(element)) {
      const instance = new DomainHintGenerator(element, configuration);
      componentRegistry.set(element, instance);
    }
  });
}

window.setupEmailDomainCompletion = setupEmailDomainCompletion;