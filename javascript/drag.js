function makeElementDraggable(element) {
    let isDragging = false;
    let isResizing = false;
    let isPinching = false;
    let currentHandle = null;
    let startX = 0, startY = 0, offsetX = 0, offsetY = 0;
    let startWidth = 0, startHeight = 0, startLeft = 0, startTop = 0;
    let initialPinchDistance = 0;
    let initialPinchMidX = 0;
    let initialPinchMidY = 0;

    // Initialize event listeners
    element.addEventListener('mousedown', handleStart);
    element.addEventListener('touchstart', handleStart, { passive: false });
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('mouseup', handleEnd);
    // element.addEventListener('mouseleave', handleEnd);
    element.addEventListener('touchend', handleEnd);

    const handles = element.querySelectorAll('.resize-handle');
    handles.forEach(handle => {
        handle.addEventListener('mousedown', startResizing);
        handle.addEventListener('touchstart', startResizing, { passive: false });
        document.addEventListener('mouseup', handleEnd);
    });

    function handleStart(e) {
        if (e.button === 0 || e.touches.length === 1) { // Left mouse button or single touch
            if (e.target.closest('.resize-handle')) return; // Ignore resize handles
            e.preventDefault();
            isDragging = true;
            startX = getClientX(e);
            startY = getClientY(e);
            element.addEventListener('mousemove', drag);
            element.addEventListener('touchmove', drag, { passive: false });
        }
    }

    function handleTouchStart(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            isPinching = true;
            ({ distance: initialPinchDistance, midX: initialPinchMidX, midY: initialPinchMidY } = getPinchDelta(e));
            startWidth = element.offsetWidth;
            startHeight = element.offsetHeight;
            startLeft = element.offsetLeft;
            startTop = element.offsetTop;
            element.addEventListener('touchmove', handlePinch, { passive: false });
        }
    }

    function handleEnd() {
        isDragging = false;
        isResizing = false;
        isPinching = false;
        currentHandle = null;
        element.removeEventListener('mousemove', drag);
        element.removeEventListener('touchmove', drag);
        element.removeEventListener('touchmove', handlePinch);
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('touchmove', resize);
    }

    function drag(e) {
        if (!isDragging || isResizing) return;
        e.preventDefault();
        const previewRect = document.getElementById('imagePreview').getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        offsetX = startX - getClientX(e);
        offsetY = startY - getClientY(e);
        startX = getClientX(e);
        startY = getClientY(e);

        let left = element.offsetLeft - offsetX;
        let top = element.offsetTop - offsetY;

        // Contain within the preview area
        if (left < 0) left = 0;
        if (left + elementRect.width > previewRect.width) left = previewRect.width - elementRect.width;
        if (top < 0) top = 0;
        if (top + elementRect.height > previewRect.height) top = previewRect.height - elementRect.height;

        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
    }

    function startResizing(e) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        currentHandle = e.target.dataset.handle;
        startX = getClientX(e);
        startY = getClientY(e);
        startWidth = element.offsetWidth;
        startHeight = element.offsetHeight;
        startLeft = element.offsetLeft;
        startTop = element.offsetTop;

        document.addEventListener('mousemove', resize);
        document.addEventListener('touchmove', resize, { passive: false });
    }

    function resize(e) {
        if (!isResizing) return;
        e.preventDefault();

        const dx = getClientX(e) - startX;
        const dy = getClientY(e) - startY;
        const previewRect = document.getElementById('imagePreview').getBoundingClientRect();

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;

        switch (currentHandle) {
            case 'nw':
                const deltaNW = Math.min(dx, dy);
                newWidth = startWidth - deltaNW;
                newHeight = startHeight - deltaNW;
                newLeft = startLeft + deltaNW;
                newTop = startTop + deltaNW;
                break;
            case 'ne':
                const deltaNE = Math.min(-dx, dy);
                newWidth = startWidth - deltaNE;
                newHeight = startHeight - deltaNE;
                newTop = startTop + deltaNE;
                break;
            case 'sw':
                const deltaSW = Math.abs(dx) > Math.abs(dy) ? -dx : dy;
                newWidth = startWidth + deltaSW;
                newHeight = startHeight + deltaSW;
                newLeft = startLeft - deltaSW;
                break;
            case 'se':
                const deltaSE = Math.min(dx, dy);
                newWidth = startWidth + deltaSE;
                newHeight = startHeight + deltaSE;
                break;
        }

        // Ensure minimum size and containment
        const minSize = 100;
        if (newWidth >= minSize && newHeight >= minSize &&
            newLeft >= 0 && newTop >= 0 &&
            newLeft + newWidth <= previewRect.width &&
            newTop + newHeight <= previewRect.height) {
            element.style.width = `${newWidth}px`;
            element.style.height = `${newHeight}px`;
            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;
        }
    }

    function handlePinch(e) {
        if (!isPinching || e.touches.length !== 2) return;
        e.preventDefault();

        const { distance: currentDistance, midX: currentPinchMidX, midY: currentPinchMidY } = getPinchDelta(e);
        const scale = currentDistance / initialPinchDistance;
        const deltaX = currentPinchMidX - initialPinchMidX;
        const deltaY = currentPinchMidY - initialPinchMidY;

        const newWidth = startWidth * scale;
        const newHeight = startHeight * scale;
        
        // Calculate new position to zoom from center
        const deltaWidth = newWidth - startWidth;
        const deltaHeight = newHeight - startHeight;
        const newLeft = startLeft - (deltaWidth / 2) + deltaX;
        const newTop = startTop - (deltaHeight / 2) + deltaY;

        const previewRect = document.getElementById('imagePreview').getBoundingClientRect();
        const minSize = 100;

        // Apply changes if within bounds
        if (newWidth >= minSize && newHeight >= minSize &&
            newLeft >= 0 && newTop >= 0 &&
            newLeft + newWidth <= previewRect.width &&
            newTop + newHeight <= previewRect.height) {
            element.style.width = `${newWidth}px`;
            element.style.height = `${newHeight}px`;
            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;
        }
    }

    function getPinchDelta(e) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const midX = (touch1.clientX + touch2.clientX) / 2;
        const midY = (touch1.clientY + touch2.clientY) / 2;

        const distance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );

        return { midX, midY, distance };
    }

    function getClientX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function getClientY(e) {
        return e.touches ? e.touches[0].clientY : e.clientY;
    }
}
