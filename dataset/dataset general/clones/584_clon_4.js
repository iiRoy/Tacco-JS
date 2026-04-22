(function(DomInterface) {

  const effectKey = Symbol('visualLayerEffect');
  const instanceRegistry = new WeakMap();

  let filterIdCounter = 0;
  const generateUniqueFilterId = () => `visual-filter-${++filterIdCounter}`;

  const instanceOperations = {

    setup: function(targetElement, userConfig) {
      const mergedConfig = Object.assign({
        destinationContainerClass: 'visual-layer-upper',
        sourceContentClass: 'visual-layer-content',
        visualDuplicateClass: 'visual-layer-duplicate',
        blurIntensity: 30
      }, userConfig);

      if (instanceRegistry.has(targetElement)) {
        return;
      }

      const effectState = {
        configuration: mergedConfig,
        filterId: generateUniqueFilterId(),
        duplicateElement: null,
        scrollHandler: null
      };
      instanceRegistry.set(targetElement, effectState);

      instanceOperations.injectFilter(effectState.filterId, mergedConfig.blurIntensity);
      instanceOperations.createVisualDuplicate(targetElement);
      instanceOperations.activateScrollHandler(targetElement);
    },

    createVisualDuplicate: function(targetElement) {
      const effectState = instanceRegistry.get(targetElement);
      if (!effectState) return;

      const { configuration, filterId } = effectState;

      const sourceContent = document.querySelector(`.${configuration.sourceContentClass}`);
      const destinationContainer = document.querySelector(`.${configuration.destinationContainerClass}`);

      if (!sourceContent || !destinationContainer) {
        console.warn('Visual Layer Effect: Source content or destination container not found.', { sourceContentClass: configuration.sourceContentClass, destinationContainerClass: configuration.destinationContainerClass });
        return;
      }

      const clonedContent = sourceContent.cloneNode(true);

      const duplicateWrapper = document.createElement('div');
      duplicateWrapper.classList.add(configuration.visualDuplicateClass);
      duplicateWrapper.appendChild(clonedContent);

      destinationContainer.appendChild(duplicateWrapper);

      duplicateWrapper.style.setProperty('-webkit-filter', `blur(${configuration.blurIntensity}px)`);
      duplicateWrapper.style.setProperty('filter', `url(#${filterId})`);

      effectState.duplicateElement = duplicateWrapper;

      const injectedSvg = document.getElementById(filterId).closest('svg');
      if (injectedSvg) {
        injectedSvg.style.setProperty('position', 'absolute');
        injectedSvg.style.setProperty('top', '0');
        injectedSvg.style.setProperty('left', '0');
        injectedSvg.style.setProperty('width', '0');
        injectedSvg.style.setProperty('height', '0');
        injectedSvg.style.setProperty('overflow', 'hidden');
      }
    },

    adjustVisualPosition: function(targetElement) {
      const effectState = instanceRegistry.get(targetElement);
      if (!effectState || !effectState.duplicateElement) return;

      const currentScrollTop = window.scrollY || window.pageYOffset;
      const transformValue = `translate3d(0, ${-currentScrollTop}px, 0)`;

      effectState.duplicateElement.style.setProperty('-webkit-transform', transformValue);
      effectState.duplicateElement.style.setProperty('-moz-transform', transformValue);
      effectState.duplicateElement.style.setProperty('transform', transformValue);
    },

    deactivate: function(targetElement) {
      const effectState = instanceRegistry.get(targetElement);
      if (!effectState) return;

      window.removeEventListener('scroll', effectState.scrollHandler);

      if (effectState.duplicateElement && effectState.duplicateElement.parentNode) {
        effectState.duplicateElement.parentNode.removeChild(effectState.duplicateElement);
      }

      const filterElement = document.getElementById(effectState.filterId);
      if (filterElement && filterElement.parentNode) {
        const svgContainer = filterElement.closest('svg');
        filterElement.parentNode.removeChild(filterElement);
        if (svgContainer && !svgContainer.children.length) {
            svgContainer.parentNode.removeChild(svgContainer);
        }
      }

      instanceRegistry.delete(targetElement);
    },

    injectFilter: function(filterId, blurIntensity) {
      if (document.getElementById(filterId)) {
        return;
      }

      let svgContainer = document.querySelector('svg.visual-layer-svg-definition');
      if (!svgContainer) {
        svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgContainer.classList.add('visual-layer-svg-definition');
        svgContainer.style.position = 'absolute';
        svgContainer.style.width = '0';
        svgContainer.style.height = '0';
        svgContainer.style.overflow = 'hidden';
        document.body.appendChild(svgContainer);
      }

      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', filterId);
      const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      feGaussianBlur.setAttribute('stdDeviation', blurIntensity.toString());

      filter.appendChild(feGaussianBlur);
      svgContainer.appendChild(filter);
    },

    activateScrollHandler: function(targetElement) {
      const effectState = instanceRegistry.get(targetElement);
      if (!effectState) return;

      const boundScrollHandler = () => instanceOperations.adjustVisualPosition(targetElement);
      effectState.scrollHandler = boundScrollHandler;

      window.addEventListener('scroll', boundScrollHandler);
    }
  };

  DomInterface.createVisualLayerEffect = function(selector, config) {
    const targetElements = document.querySelectorAll(selector);

    const instances = [];
    targetElements.forEach(element => {
      instanceOperations.setup(element, config);

      instances.push({
        element: element,
        updatePosition: () => instanceOperations.adjustVisualPosition(element),
        removeEffect: () => instanceOperations.deactivate(element)
      });
    });

    return instances.length === 1 ? instances[0] : instances;
  };

})(window.DomUtility = window.DomUtility || {});