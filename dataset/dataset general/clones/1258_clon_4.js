class StarRatingWidget {
  constructor(elementToTransform) {
    this.associatedInput = elementToTransform;
    this.elementContainer = document.createElement('div');
    this.starElements = [];
    this.clearButtonElement = null;

    this.setupConfiguration();
    this.constructDOM();
    this.bindEventHandlers();
    this.refreshDisplay(this.currentSelectedValue);
  }

  setupConfiguration() {
    this.ratingMaximum = parseInt(this.associatedInput.dataset.max || '5', 10);
    this.ratingMinimum = parseInt(this.associatedInput.dataset.min || '0', 10);
    this.iconFamily = this.associatedInput.dataset.iconLib || 'glyphicon';
    this.activeVisualClass = this.associatedInput.dataset.activeIcon || 'glyphicon-star';
    this.inactiveVisualClass = this.associatedInput.dataset.inactiveIcon || 'glyphicon-star-empty';
    this.allowClear = this.associatedInput.dataset.clearable || null;
    this.clearIconClass = this.associatedInput.dataset.clearableIcon || 'glyphicon-remove';
    this.emptyValueMark = this.associatedInput.dataset.emptyValue || '';

    let initialValueCandidate = parseFloat(this.associatedInput.value || '0');
    if (isNaN(initialValueCandidate) || initialValueCandidate < this.ratingMinimum || initialValueCandidate > this.ratingMaximum) {
      initialValueCandidate = this.emptyValueMark;
    }
    this.currentSelectedValue = initialValueCandidate;

    this.associatedInput.dataset.max = this.ratingMaximum;
    this.associatedInput.dataset.min = this.ratingMinimum;
    this.associatedInput.dataset.iconLib = this.iconFamily;
    this.associatedInput.dataset.activeIcon = this.activeVisualClass;
    this.associatedInput.dataset.inactiveIcon = this.inactiveVisualClass;
    this.associatedInput.dataset.emptyValue = this.emptyValueMark;
  }

  constructDOM() {
    this.elementContainer.classList.add('rating-input-component');

    this.starElements = Array.from({ length: this.ratingMaximum - this.ratingMinimum + 1 }, (_, i) => {
      const starNumericalValue = this.ratingMinimum + i;
      const starIconElement = document.createElement('i');
      starIconElement.classList.add(this.iconFamily);
      starIconElement.dataset.starValue = starNumericalValue;
      this.elementContainer.appendChild(starIconElement);
      return starIconElement;
    });

    if (this.allowClear) {
      this.clearButtonElement = document.createElement('a');
      this.clearButtonElement.classList.add('rating-reset-control');
      this.clearButtonElement.style.display = 'none';
      this.clearButtonElement.href = 'javascript:void(0)';
      const clearIconSpan = document.createElement('span');
      clearIconSpan.classList.add(this.iconFamily, this.clearIconClass);
      this.clearButtonElement.appendChild(clearIconSpan);
      this.clearButtonElement.appendChild(document.createTextNode(` ${this.allowClear}`));
      this.elementContainer.appendChild(this.clearButtonElement);
    }

    const clonedOriginalInput = this.associatedInput.cloneNode(true);
    clonedOriginalInput.classList.add('hidden-rating-control');
    clonedOriginalInput.style.display = 'none';
    this.elementContainer.appendChild(clonedOriginalInput);
    this.associatedInput = clonedOriginalInput;

    const originalParentNode = elementToTransform.parentNode;
    if (originalParentNode) {
      originalParentNode.replaceChild(this.elementContainer, elementToTransform);
    }

    this.associatedInput.value = this.currentSelectedValue;
  }

  bindEventHandlers() {
    this.elementContainer.addEventListener('mouseover', this.handleWidgetInteraction.bind(this));
    this.elementContainer.addEventListener('mouseout', this.handleWidgetInteraction.bind(this));
    this.elementContainer.addEventListener('click', this.handleWidgetInteraction.bind(this));
  }

  handleWidgetInteraction(event) {
    const targetElement = event.target.closest('[data-star-value], .rating-reset-control');

    if (!targetElement) {
      return;
    }

    if (targetElement.dataset.starValue) {
      const starValue = parseInt(targetElement.dataset.starValue, 10);
      if (event.type === 'mouseover') {
        this.refreshDisplay(starValue, true);
      } else if (event.type === 'mouseout') {
        this.refreshDisplay(this.currentSelectedValue);
      } else if (event.type === 'click') {
        event.preventDefault();
        this.modifyControlValue(starValue);
      }
    } else if (targetElement.classList.contains('rating-reset-control')) {
      if (event.type === 'click') {
        event.preventDefault();
        this.modifyControlValue(this.emptyValueMark);
      }
    }
  }

  modifyControlValue(newValue) {
    this.currentSelectedValue = newValue;
    this.associatedInput.value = newValue;
    this.associatedInput.dispatchEvent(new Event('change', { bubbles: true }));
    this.refreshDisplay(newValue);
  }

  refreshDisplay(valueToDisplay, isTemporaryHighlight = false) {
    const effectiveValue = isNaN(parseFloat(valueToDisplay)) ? this.emptyValueMark : parseFloat(valueToDisplay);

    this.starElements.forEach(star => {
      const starNumericalValue = parseInt(star.dataset.starValue, 10);
      if (starNumericalValue <= effectiveValue && effectiveValue !== this.emptyValueMark) {
        star.classList.remove(this.inactiveVisualClass);
        star.classList.add(this.activeVisualClass);
      } else {
        star.classList.remove(this.activeVisualClass);
        star.classList.add(this.inactiveVisualClass);
      }
    });

    if (this.clearButtonElement) {
      if (effectiveValue === this.emptyValueMark) {
        this.clearButtonElement.style.display = 'none';
      } else {
        this.clearButtonElement.style.display = 'inline-block';
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const targetInputsForConversion = document.querySelectorAll('input.rating[type="number"]');
  targetInputsForConversion.forEach(inputElement => {
    if (!inputElement.classList.contains('processed-rating-input')) {
      new StarRatingWidget(inputElement);
      inputElement.classList.add('processed-rating-input');
    }
  });
});