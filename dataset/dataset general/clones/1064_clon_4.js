'use strict';
function obtainVisualResource(resourcePath) {
  const visualComponent = window.document.createElement('img');
  visualComponent.setAttribute('src', resourcePath);
  return visualComponent;
}

const mediaObject = obtainVisualResource('/images/dummy-7051c65f.jpg');