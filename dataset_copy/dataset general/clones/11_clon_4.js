const visualEffectsAdapter = {
  hideWithAnimation: (element) => {
    if (!element) return;
    element.style.maxHeight = element.scrollHeight + 'px';
    window.requestAnimationFrame(() => {
      element.style.transition = 'max-height 0.5s ease-out, opacity 0.5s ease-out';
      element.style.overflow = 'hidden';
      element.style.maxHeight = '0';
      element.style.opacity = '0';
      const animationEndHook = () => {
        element.style.display = 'none';
        element.removeEventListener('transitionend', animationEndHook);
      };
      element.addEventListener('transitionend', animationEndHook);
    });
  },
  showWithAnimation: (element, displayMode = 'block') => {
    if (!element) return;
    element.style.display = displayMode;
    element.style.maxHeight = '0';
    element.style.opacity = '0';
    element.style.overflow = 'hidden';
    window.requestAnimationFrame(() => {
      element.style.transition = 'max-height 0.5s ease-in, opacity 0.5s ease-in';
      element.style.maxHeight = element.scrollHeight + 'px';
      element.style.opacity = '1';
      const animationEndHook = () => {
        element.style.overflow = 'visible';
        element.style.maxHeight = '';
        element.removeEventListener('transitionend', animationEndHook);
      };
      element.addEventListener('transitionend', animationEndHook);
    });
  },
  conceal: (element) => { if (element) element.style.display = 'none'; },
  unconceal: (element, displayMode = 'block') => { if (element) element.style.display = displayMode; }
};

const fileAttachmentManager = (() => {
  let initialEditorCallback;
  let targetFieldIdentifier = '';
  let intervalHandle;

  // Handles removal of attached files
  const processAttachmentRemoval = () => {
    document.body.addEventListener('click', (event) => {
      const removalTrigger = event.target.closest('.asset_discard');
      if (!removalTrigger) return;
      event.preventDefault();

      visualEffectsAdapter.conceal(removalTrigger);
      const containingSection = removalTrigger.closest('.section');
      if (containingSection) {
        const valueInput = containingSection.querySelector('.text_display_field');
        if (valueInput) valueInput.value = '';
      }

      const previewContainer = removalTrigger.closest('.screenshot');
      if (previewContainer) {
        visualEffectsAdapter.hideWithAnimation(previewContainer);
        let currentSibling = previewContainer.nextElementSibling;
        while (currentSibling) {
          if (currentSibling.classList.contains('of-background-properties')) {
            visualEffectsAdapter.conceal(currentSibling);
            break;
          }
          currentSibling = currentSibling.nextElementSibling;
        }
      }
    });

    const firstItemDeleteLink = document.querySelector('#option-1 a.delete-inline');
    visualEffectsAdapter.conceal(firstItemDeleteLink);
  };

  // Transforms standard file inputs into custom ones
  const convertFileInputs = () => {
    document.querySelectorAll('input.file').forEach((originalElement) => {
      const containerDiv = document.createElement('div');
      containerDiv.className = 'input_wrapper';
      originalElement.parentNode.insertBefore(containerDiv, originalElement);
      containerDiv.appendChild(originalElement);

      originalElement.classList.add('file');
      originalElement.style.opacity = '0';

      const visualRepresentation = document.createElement('div');
      visualRepresentation.className = 'visual_input_area';

      const pathDisplay = document.createElement('input');
      pathDisplay.type = 'text';
      pathDisplay.className = 'text_display_field';
      pathDisplay.id = originalElement.id + '_visual_display';
      pathDisplay.value = originalElement.value;

      const browseButton = document.createElement('input');
      browseButton.type = 'button';
      browseButton.className = 'file_selector_btn';
      browseButton.value = 'Choose File';

      visualRepresentation.appendChild(pathDisplay);
      visualRepresentation.appendChild(browseButton);
      containerDiv.appendChild(visualRepresentation);

      const updateDisplayField = () => {
        pathDisplay.value = originalElement.value;
      };

      originalElement.addEventListener('change', updateDisplayField);
      originalElement.addEventListener('mouseout', updateDisplayField);
    });
  };

  // Manages interactions with the media uploader popup
  const manageMediaUploader = () => {
    document.querySelectorAll('input.resource_picker_btn').forEach(button => {
      button.removeAttribute('style');
    });

    document.body.addEventListener('click', (event) => {
      const pickerButton = event.target.closest('input.resource_picker_btn');
      if (!pickerButton) return;
      event.preventDefault();

      targetFieldIdentifier = pickerButton.previousElementSibling.id;
      const associatedPostId = pickerButton.getAttribute('rel');

      intervalHandle = setInterval(() => {
        const iframeDocument = document.getElementById('TB_iframeContent')?.contentWindow?.document;
        const submitButton = iframeDocument?.querySelector('.savesend .button');
        if (submitButton) {
          submitButton.value = 'Select This Item';
        }
      }, 2000);

      let dialogTitle = '';
      const parentSection = pickerButton.closest('.section');
      if (parentSection) {
        const headerElement = parentSection.querySelector('.heading');
        if (headerElement) dialogTitle = headerElement.textContent;
      }

      // `tb_show` is an external function, called directly
      tb_show(dialogTitle, 'media-upload.php?post_id=' + associatedPostId + '&TB_iframe=1');
    });

    initialEditorCallback = window.send_to_editor;
    window.send_to_editor = (contentMarkup) => {
      if (targetFieldIdentifier) {
        clearInterval(intervalHandle);

        let mediaURL = '';
        const temporaryDiv = document.createElement('div');
        temporaryDiv.innerHTML = contentMarkup;

        if (temporaryDiv.querySelector('img')) {
          mediaURL = temporaryDiv.querySelector('img').src;
        } else {
          const markupParts = contentMarkup.split("'");
          mediaURL = markupParts[1];

          let mediaDescriptor = markupParts[2];
          mediaDescriptor = mediaDescriptor.replace('>', '');
          mediaDescriptor = mediaDescriptor.replace('</a>', '');
        }

        const imageRegex = /(^.*\.jpg|jpeg|png|gif|ico*)/gi;
        const documentRegex = /(^.*\.pdf|doc|docx|ppt|pptx|odt*)/gi;
        const audioRegex = /(^.*\.mp3|m4a|ogg|wav*)/gi;
        const videoRegex = /(^.*\.mp4|m4v|mov|wmv|avi|mpg|ogv|3gp|3g2*)/gi;

        let outputContent = '';
        if (mediaURL.match(imageRegex)) {
          outputContent = `<img src="${mediaURL}" alt="" /><a href="#" class="asset_discard button">Remove Picture</a>`;
        } else {
          const fileViewerLink = `<a href="${mediaURL}" target="_blank" rel="external">View Document</a>`;
          outputContent = `<div class="no_image"><span class="file_link">${fileViewerLink}</span><a href="#" class="asset_discard button">Remove</a></div>`;
        }

        const targetInputElement = document.getElementById(targetFieldIdentifier);
        if (targetInputElement) {
          targetInputElement.value = mediaURL;

          let previewZone = null;
          let backgroundOptionsZone = null;
          let currentElement = targetInputElement.nextElementSibling;

          while (currentElement) {
            if (currentElement.classList.contains('screenshot')) {
              previewZone = currentElement;
            } else if (currentElement.classList.contains('of-background-properties')) {
              backgroundOptionsZone = currentElement;
            }
            if (previewZone && backgroundOptionsZone) break;
            currentElement = currentElement.nextElementSibling;
          }

          if (previewZone) {
            previewZone.innerHTML = outputContent;
            visualEffectsAdapter.showWithAnimation(previewZone);
          }
          if (backgroundOptionsZone) {
            visualEffectsAdapter.unconceal(backgroundOptionsZone);
          }
        }
        // `tb_remove` is an external function, called directly
        tb_remove();
      } else {
        initialEditorCallback(contentMarkup);
      }
      targetFieldIdentifier = '';
    };
  };

  // Public initialization method
  const launch = () => {
    processAttachmentRemoval();
    convertFileInputs();
    manageMediaUploader();
  };

  return {
    init: launch
  };
})();

// Ensure DOM is fully loaded before executing
document.addEventListener('DOMContentLoaded', () => {
  fileAttachmentManager.init();
});