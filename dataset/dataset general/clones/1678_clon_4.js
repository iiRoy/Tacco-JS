(function(globalScope) {
  const AuxiliaryDOM = {
    formElement: (parent, tag, innerText = '') => {
      const component = document.createElement(tag);
      component.innerHTML = innerText;
      parent.appendChild(component);
      return component;
    },
    fashionElement: (element, styles) => {
      Object.assign(element.style, styles);
    },
    bestowClasses: (element, ...labels) => {
      element.classList.add(...labels);
    },
    removeClasses: (element, ...labels) => {
      element.classList.remove(...labels);
    }
  };

  const DisplayProtocols = new Map([
    ['floating', {
      positioning: 'fixed',
      defaultLook: 'facade-dark',
      adjustLayout: (targetElement) => {
        AuxiliaryDOM.fashionElement(targetElement, {
          top: null, left: null, height: null, width: null
        });
      }
    }],
    ['panel', {
      positioning: 'absolute',
      defaultLook: 'facade-light',
      adjustLayout: (targetElement) => {
        AuxiliaryDOM.fashionElement(targetElement, { height: 'auto' });
      }
    }]
  ]);

  class ViewTransitioner {
    constructor(sourceElement, contentHTML, options = {}) {
      this.initiator = sourceElement;
      this.visualContent = contentHTML;

      const { displayType = 'panel', appearanceClass, durationMilliseconds = 400 } = options;
      this.transitionDuration = durationMilliseconds;

      const protocol = DisplayProtocols.get(displayType);
      if (!protocol) {
        throw new Error(`Invalid display type specified: ${displayType}`);
      }

      this.currentProtocol = protocol;
      this.visualAppearance = appearanceClass || protocol.defaultLook;

      this.presenter = AuxiliaryDOM.formElement(document.body, 'div', this.visualContent);

      this.terminateDisplay = this.terminateDisplay.bind(this);
      this.presenter.addEventListener('vanish', this.terminateDisplay);
      this.presenter.disappear = this.terminateDisplay;
    }

    unveil() {
      AuxiliaryDOM.fashionElement(this.presenter, {
        position: this.currentProtocol.positioning,
        top: `${this.initiator.offsetTop}px`,
        left: `${this.initiator.offsetLeft}px`,
        minHeight: `${this.initiator.offsetHeight}px`,
        width: `${this.initiator.offsetWidth}px`,
        zIndex: 9999
      });

      AuxiliaryDOM.bestowClasses(this.initiator, 'transition-origin');
      AuxiliaryDOM.bestowClasses(this.presenter, 'animated-layer', this.visualAppearance);

      const applyLayoutAdjustment = () => this.currentProtocol.adjustLayout(this.presenter);
      if (this.currentProtocol.positioning === 'absolute') {
        applyLayoutAdjustment();
      } else {
        setTimeout(applyLayoutAdjustment, 0);
      }

      setTimeout(() => {
        AuxiliaryDOM.bestowClasses(this.presenter, 'active-movement', 'shown');
        AuxiliaryDOM.bestowClasses(this.initiator, 'shown');
      }, 0);

      return this.presenter;
    }

    terminateDisplay() {
      AuxiliaryDOM.fashionElement(this.presenter, {
        position: this.currentProtocol.positioning,
        top: `${this.initiator.offsetTop}px`,
        left: `${this.initiator.offsetLeft}px`,
        minHeight: `${this.initiator.offsetHeight}px`,
        width: `${this.initiator.offsetWidth}px`,
      });

      AuxiliaryDOM.removeClasses(this.presenter, 'shown');
      AuxiliaryDOM.removeClasses(this.initiator, 'shown');

      setTimeout(() => {
        AuxiliaryDOM.removeClasses(this.presenter, this.visualAppearance);
        this.presenter.remove();
        AuxiliaryDOM.removeClasses(this.initiator, 'transition-origin');
      }, this.transitionDuration);
    }
  }

  globalScope.ViewComposer = (elementSource, displayContent, configuration) => new ViewTransitioner(elementSource, displayContent, configuration).unveil();

})(typeof window !== 'undefined' ? window : globalThis);