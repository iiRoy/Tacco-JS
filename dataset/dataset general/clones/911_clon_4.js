((globalContextObject) => {

  // --- Component for Horizontal Scrolling Container ---
  class HorizontalMotionPanel extends HTMLElement {
    constructor() {
      super();
      const internalShade = this.attachShadow({ mode: 'open' });
      internalShade.innerHTML = `
        <style>
          :host {
            display: block;
            overflow-x: auto;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
            box-sizing: border-box;
            padding: 5px 0; /* Example padding */
          }
          ::slotted(*) {
            display: inline-block;
            vertical-align: top;
            margin-right: 10px; /* Spacing between slotted items */
          }
          ::slotted(:last-child) {
            margin-right: 0;
          }
        </style>
        <slot name="content-slot"></slot>
      `;
      this.scrollTracker = 0;
      this.motionHandler = this.onPanelMotion.bind(this);
    }

    connectedCallback() {
      this.shadowRoot.host.addEventListener('scroll', this.motionHandler);
      this.dispatchInitialState();
    }

    disconnectedCallback() {
      this.shadowRoot.host.removeEventListener('scroll', this.motionHandler);
    }

    onPanelMotion(eventObject) {
      const currentHorizontalOffset = eventObject.target.scrollLeft;
      if (this.scrollTracker !== currentHorizontalOffset) {
        this.scrollTracker = currentHorizontalOffset;
        this.setAttribute('track-offset', currentHorizontalOffset.toFixed(0));
        this.dispatchEvent(new CustomEvent('panel-scrolled', {
          detail: { position: currentHorizontalOffset },
          bubbles: true,
          composed: true
        }));
      }
    }

    dispatchInitialState() {
      // Simulate initial state dispatch if needed, or just ensure initial attributes are set.
      this.setAttribute('track-offset', this.scrollTracker.toFixed(0));
    }
  }

  globalContextObject.customElements.define('x-fluid-panel', HorizontalMotionPanel);


  // --- Component for Individual Display Item ---
  class VisualContentBlock extends HTMLElement {
    static get observedAttributes() {
      return ['label-text', 'graphic-uri', 'item-position'];
    }

    constructor() {
      super();
      const internalShade = this.attachShadow({ mode: 'open' });
      internalShade.innerHTML = `
        <style>
          :host {
            display: inline-block;
            box-sizing: border-box;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin: 0; /* Margin handled by parent slotting */
            padding: 12px;
            text-align: center;
            vertical-align: top;
            cursor: pointer;
            background-color: #fff;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            min-width: 150px; /* Different default width */
            height: 200px; /* Different default height */
            overflow: hidden;
            position: relative;
          }
          :host(:hover) {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .graphic-display {
            max-width: 100%;
            max-height: 70%; /* Image takes up less space */
            display: block;
            margin: 0 auto 8px auto;
            object-fit: contain;
          }
          .descriptor-area {
            font-size: 0.85em;
            color: #555;
            white-space: normal;
            line-height: 1.3;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          .dynamic-style-layer {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
          }
        </style>
        <div class="dynamic-style-layer"></div>
        <img class="graphic-display" alt="content graphic" part="item-graphic">
        <div class="descriptor-area" part="item-descriptor"></div>
        <slot name="additional-content"></slot>
      `;
      this.imageElementRef = internalShade.querySelector('.graphic-display');
      this.labelElementRef = internalShade.querySelector('.descriptor-area');
      this.dynamicStyleLayer = internalShade.querySelector('.dynamic-style-layer');
    }

    connectedCallback() {
      this.refreshVisuals();
      this.applyPositionalEffects();
    }

    attributeChangedCallback(attributeName, previousValue, newValue) {
      if (previousValue !== newValue) {
        if (attributeName === 'label-text' || attributeName === 'graphic-uri') {
          this.refreshVisuals();
        } else if (attributeName === 'item-position') {
          this.applyPositionalEffects();
        }
      }
    }

    refreshVisuals() {
      this.imageElementRef.src = this.getAttribute('graphic-uri') || '';
      this.labelElementRef.textContent = this.getAttribute('label-text') || '';
    }

    applyPositionalEffects() {
      const positionValue = parseInt(this.getAttribute('item-position'), 10);
      if (!isNaN(positionValue)) {
        // A more complex strategy than just adding a class:
        // Adjust background color, border, and apply a CSS variable for animations
        const baseHue = (positionValue * 45) % 360; // Vary hue based on position
        const saturation = 70 + (positionValue % 3) * 5; // Slight saturation variation
        const lightness = 95 - (positionValue % 2) * 2; // Slight lightness variation

        this.style.setProperty('--item-hue', baseHue);
        this.style.setProperty('--item-animation-delay', `${positionValue * 0.05}s`);
        this.style.backgroundColor = `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
        this.style.borderColor = `hsl(${baseHue}, ${saturation}%, ${lightness - 15}%)`;

        // Inject a specific animation style for this element's layer
        let specificStyle = this.shadowRoot.getElementById('pos-effect-style');
        if (!specificStyle) {
          specificStyle = document.createElement('style');
          specificStyle.id = 'pos-effect-style';
          this.shadowRoot.appendChild(specificStyle);
        }
        specificStyle.textContent = `
          .dynamic-style-layer {
            animation: fadeInScaleUp var(--item-animation-duration, 0.4s) ease-out var(--item-animation-delay, 0s) forwards;
            opacity: 0;
            transform: scale(0.9);
          }
          @keyframes fadeInScaleUp {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `;
      }
    }
  }

  globalContextObject.customElements.define('x-display-block', VisualContentBlock);

})(window);