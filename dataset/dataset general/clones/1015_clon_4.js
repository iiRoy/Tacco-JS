React = require('react');

const OverlayContainer = React.forwardRef((properties, ref) => {
    const {
        onOpen = () => {},
        onClose = () => {},
        isControlledOpen,
        childrenElements,
        elementIdentifier = "ModalComponent"
    } = properties;

    const [isModalOpen, setModalOpen] = React.useState(false);
    const backdropElementRef = React.useRef(null);

    const adjustBodyScrollBehavior = (shouldHide) => {
        if (shouldHide) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = null;
        }
    };

    React.useEffect(() => {
        if (typeof isControlledOpen === 'boolean' && isControlledOpen !== isModalOpen) {
            setModalOpen(isControlledOpen);
        }
    }, [isControlledOpen, isModalOpen]);

    React.useEffect(() => {
        if (isModalOpen) {
            onOpen();
            adjustBodyScrollBehavior(true);
        } else {
            onClose();
            adjustBodyScrollBehavior(false);
        }

        return () => {
            adjustBodyScrollBehavior(false);
        };
    }, [isModalOpen, onOpen, onClose]);

    const flipInternalVisibility = () => setModalOpen(currentVisibility => !currentVisibility);

    const handleDismissAction = (eventSignal) => {
        eventSignal.preventDefault();
        eventSignal.stopPropagation();
        flipInternalVisibility();
    };

    const handleBackdropAction = (eventSignal) => {
        if (eventSignal.target === backdropElementRef.current) {
            eventSignal.preventDefault();
            eventSignal.stopPropagation();
            flipInternalVisibility();
        }
    };

    React.useImperativeHandle(ref, () => ({
        unveil: () => setModalOpen(true),
        conceal: () => setModalOpen(false),
        flipVisibility: () => setModalOpen(currentVisibility => !currentVisibility)
    }));

    return (
        <div
            className={"modal-backdrop-container" + (isModalOpen ? "" : " concealed")}
            ref={backdropElementRef}
            onClick={handleBackdropAction}
            data-visual-component-name={elementIdentifier}
        >
            <div className="modal-top-section">
                <div
                    className="modal-dismiss-control"
                    title="Dismiss"
                    onClick={handleDismissAction}
                >
                    &times;
                </div>
            </div>
            <div className="modal-content-area">
                {childrenElements}
            </div>
        </div>
    );
});

module.exports = OverlayContainer;