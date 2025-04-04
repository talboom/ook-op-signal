function makeElementDraggable(element) {
    let isDragging = false;
    let isResizing = false;
    let currentHandle = null;
    let startX = 0, startY = 0, offsetX = 0, offsetY = 0;
    let startWidth = 0, startHeight = 0, startLeft = 0, startTop = 0;

    // Initialize event listeners
    element.addEventListener('mousedown', handleStart);
    element.addEventListener('touchstart', handleStart, { passive: false });
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
        if (e.target.closest('.resize-handle')) return; // Ignore resize handles
        e.preventDefault();
        isDragging = true;
        startX = getClientX(e);
        startY = getClientY(e);
        element.addEventListener('mousemove', drag);
        element.addEventListener('touchmove', drag, { passive: false });
    }

    function handleEnd() {
        isDragging = false;
        isResizing = false;
        currentHandle = null;
        element.removeEventListener('mousemove', drag);
        element.removeEventListener('touchmove', drag);
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

    function getClientX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function getClientY(e) {
        return e.touches ? e.touches[0].clientY : e.clientY;
    }
}
