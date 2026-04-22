window.addEventListener('load', function() {

  const celestialBody = document.body;
  const cosmicCanvas = document.getElementById('universe');
  const stellarOrbits = document.getElementById('solar-system');

  const initiateDisplay = function() {
    celestialBody.classList.remove('view-2D', 'opening');
    celestialBody.classList.add('view-3D');

    setTimeout(function() {
      celestialBody.classList.remove('hide-UI');
      celestialBody.classList.add('set-speed');
    }, 2000);
  };

  const modifyCosmicPerspective = function(modeIdentifier) {
    cosmicCanvas.className = '';
    cosmicCanvas.classList.add(...modeIdentifier.split(' '));
  };

  document.addEventListener('click', function(eventDetail) {
    const interactionTarget = eventDetail.target;

    const actionMap = [
      { selector: '#toggle-data', task: () => {
          celestialBody.classList.toggle('data-open');
          celestialBody.classList.toggle('data-close');
          eventDetail.preventDefault();
        }},
      { selector: '#toggle-controls', task: () => {
          celestialBody.classList.toggle('controls-open');
          celestialBody.classList.toggle('controls-close');
          eventDetail.preventDefault();
        }},
      { selector: '.set-view', task: () => {
          celestialBody.classList.toggle('view-3D');
          celestialBody.classList.toggle('view-2D');
        }},
      { selector: '.set-zoom', task: () => {
          celestialBody.classList.toggle('zoom-large');
          celestialBody.classList.toggle('zoom-close');
        }},
      { selector: '.set-speed', task: () => {
          modifyCosmicPerspective('scale-stretched set-speed');
        }},
      { selector: '.set-size', task: () => {
          modifyCosmicPerspective('scale-s set-size');
        }},
      { selector: '.set-distance', task: () => {
          modifyCosmicPerspective('scale-d set-distance');
        }},
    ];

    for (const entry of actionMap) {
      if (interactionTarget.matches(entry.selector)) {
        entry.task();
        return;
      }
    }

    const dataLinkElement = interactionTarget.closest('#data a');
    if (dataLinkElement) {
      const currentClassAttribute = dataLinkElement.getAttribute('class');
      stellarOrbits.className = '';
      stellarOrbits.classList.add(...currentClassAttribute.split(' '));

      const enclosingContainer = dataLinkElement.parentNode;
      const allSiblingLinks = enclosingContainer.querySelectorAll('a');
      allSiblingLinks.forEach(item => item.classList.remove('active'));
      dataLinkElement.classList.add('active');
      eventDetail.preventDefault();
    }
  });

  initiateDisplay();

});