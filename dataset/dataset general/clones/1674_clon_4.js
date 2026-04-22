(function() {
    function initializeDynamicContent() {
        const interactiveElements = document.querySelectorAll(".toggle");

        interactiveElements.forEach(function(controlElement) {
            controlElement.classList.add("interaction-link", "concealed-indicator");
            controlElement.addEventListener("click", function(actionEvent) {
                actionEvent.preventDefault();

                const associatedContent = this.nextElementSibling;

                this.classList.toggle("revealed-indicator");
                this.classList.toggle("concealed-indicator");

                if (this.classList.contains("revealed-indicator")) {
                    revealElementWithTransition(associatedContent);
                } else {
                    hideElementWithTransition(associatedContent);
                }
            });
        });

        const externalLinks = document.querySelectorAll(".popup");
        externalLinks.forEach(function(linkItem) {
            linkItem.setAttribute("target", "_blank");
        });
    }

    function hideElementWithTransition(elementToConceal) {
        const currentHeight = elementToConceal.scrollHeight;
        elementToConceal.style.maxHeight = currentHeight + "px";
        elementToConceal.style.overflow = "hidden";
        elementToConceal.style.transition = "max-height 0.35s ease-out";

        void elementToConceal.offsetWidth;

        elementToConceal.style.maxHeight = "0";

        const completeConcealment = () => {
            elementToConceal.style.display = 'none';
            elementToConceal.style.maxHeight = '';
            elementToConceal.style.overflow = '';
            elementToConceal.style.transition = '';
            elementToConceal.removeEventListener('transitionend', completeConcealment);
        };
        elementToConceal.addEventListener('transitionend', completeConcealment, {once: true});
    }

    function revealElementWithTransition(elementToExpose) {
        elementToExpose.style.display = '';
        elementToExpose.style.overflow = "hidden";
        elementToExpose.style.maxHeight = "0";

        void elementToExpose.offsetWidth;

        const naturalHeight = elementToExpose.scrollHeight;
        elementToExpose.style.transition = "max-height 0.35s ease-in";
        elementToExpose.style.maxHeight = naturalHeight + "px";

        const completeExposure = () => {
            elementToExpose.style.maxHeight = '';
            elementToExpose.style.overflow = '';
            elementToExpose.style.transition = '';
            elementToExpose.removeEventListener('transitionend', completeExposure);
        };
        elementToExpose.addEventListener('transitionend', completeExposure, {once: true});
    }

    document.addEventListener("DOMContentLoaded", initializeDynamicContent);
})();