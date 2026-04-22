(function() {
  'use strict';

  function renderFileSize(byteCount) {
    const sizeDesignators = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (!byteCount || byteCount === 0) {
      return '0 bytes';
    }

    let currentDesignatorIndex = 0;
    let adjustedByteValue = byteCount;

    for (; adjustedByteValue >= 1024 && currentDesignatorIndex < sizeDesignators.length - 1; currentDesignatorIndex++) {
      adjustedByteValue /= 1024;
    }
    
    return Math.round(adjustedByteValue) + ' ' + sizeDesignators[currentDesignatorIndex];
  }

  document.querySelectorAll('form').forEach(function(currentFormElement) {
    currentFormElement.addEventListener('click', function(processingEvent) {
      const clickedElement = processingEvent.target.closest('button[type="submit"]');
      if (!clickedElement) {
        return;
      }

      processingEvent.preventDefault();

      const currentProcessingForm = clickedElement.form;
      currentProcessingForm.classList.add('processing-active');

      const uniqueSubmissionIdentifier = 'submissionFrame_' + Date.now();

      const hiddenSubmissionFrame = document.createElement('iframe');
      hiddenSubmissionFrame.style.cssText = 'position:absolute; top:-9999px; left:-9999px; border:none; width:0; height:0;';
      hiddenSubmissionFrame.name = uniqueSubmissionIdentifier;
      document.body.appendChild(hiddenSubmissionFrame);

      const originalFormTarget = currentProcessingForm.target;
      const originalFormAction = currentProcessingForm.action;
      const originalFormEnctype = currentProcessingForm.enctype;
      const originalFormMethod = currentProcessingForm.method;

      currentProcessingForm.target = uniqueSubmissionIdentifier;
      currentProcessingForm.action = currentProcessingForm.getAttribute('action') || '';
      currentProcessingForm.enctype = 'multipart/form-data';
      currentProcessingForm.method = 'POST';

      const temporaryConcealedInputs = [];
      currentProcessingForm.querySelectorAll('textarea').forEach(textAreaElement => {
        const concealedInput = document.createElement('input');
        concealedInput.type = 'hidden';
        concealedInput.name = textAreaElement.name;
        concealedInput.value = textAreaElement.value;
        currentProcessingForm.appendChild(concealedInput);
        temporaryConcealedInputs.push(concealedInput);
      });

      const finalizeSubmission = () => {
        currentProcessingForm.classList.remove('processing-active');

        currentProcessingForm.target = originalFormTarget;
        currentProcessingForm.action = originalFormAction;
        currentProcessingForm.enctype = originalFormEnctype;
        currentProcessingForm.method = originalFormMethod;

        temporaryConcealedInputs.forEach(input => input.remove());
        hiddenSubmissionFrame.remove();
      };

      hiddenSubmissionFrame.addEventListener('load', () => {
        let serverPayload = null;
        try {
          const frameDocument = hiddenSubmissionFrame.contentDocument || hiddenSubmissionFrame.contentWindow.document;
          const rawServerResponse = frameDocument.body.textContent || frameDocument.body.innerText;
          serverPayload = JSON.parse(rawServerResponse);
        } catch (parsingError) {
          console.error('Data parsing failure from server response:', parsingError);
          finalizeSubmission();
          return;
        }

        console.log(serverPayload);

        if (serverPayload && Array.isArray(serverPayload.files)) {
          const displayContainer = document.getElementById('filelist');
          serverPayload.files.forEach(uploadItem => {
            const listEntry = document.createElement('li');
            listEntry.classList.add('list-group-item');

            const mainHeading = document.createElement('h4');
            mainHeading.classList.add('list-group-item-heading');
            mainHeading.textContent = uploadItem.originalFilename;

            const detailParagraph = document.createElement('p');
            detailParagraph.classList.add('list-group-item-text');

            const sizeDisplay = document.createElement('span');
            sizeDisplay.classList.add('size');
            sizeDisplay.textContent = renderFileSize(uploadItem.size);

            const typeDisplay = document.createElement('span');
            typeDisplay.classList.add('mime');
            typeDisplay.textContent = uploadItem.headers['content-type'];

            detailParagraph.appendChild(sizeDisplay);
            detailParagraph.appendChild(document.createTextNode(', '));
            detailParagraph.appendChild(typeDisplay);

            const quoteBlock = document.createElement('blockquote');
            quoteBlock.classList.add('list-group-item-text', 'comment');
            quoteBlock.textContent = serverPayload.comment || '';

            listEntry.appendChild(mainHeading);
            listEntry.appendChild(detailParagraph);
            listEntry.appendChild(quoteBlock);

            if (displayContainer) {
              displayContainer.appendChild(listEntry);
            }
          });
        }

        currentProcessingForm.querySelectorAll('input[type="file"]').forEach(fileInput => {
          fileInput.value = '';
        });

        finalizeSubmission();
      });

      currentProcessingForm.submit();
    });
  });

})();