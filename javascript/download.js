document.getElementById('downloadButton').addEventListener('click', function() {
    const originalCanvas = document.getElementById('canvas');
    const image = document.querySelector('#imagePreview img');
    const spotlight = document.getElementById('spotlight');

    if (image && spotlight) {
        processDownload(originalCanvas, image, spotlight);
    }
});

let currentOverlay = 'images/ookopsignal.png'; // Default overlay

document.querySelectorAll('.thumbnail').forEach(thumbnail => {
    thumbnail.addEventListener('click', function () {
        // Remove active class from all thumbnails
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        // Add active class to the clicked thumbnail
        this.classList.add('active');
        // Update the current overlay
        currentOverlay = this.dataset.overlay;
        document.getElementById('signalBox').style.backgroundImage = `url(${currentOverlay})`;
    });
});

function processDownload(originalCanvas, image, spotlight) {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Fix CORS error
    img.src = image.src;

    img.onload = function() {(originalCanvas, image, spotlight);
        const croppedCanvas = createCroppedCanvas(originalCanvas, image, spotlight);
        addOverlayAndDownload(croppedCanvas);
    };
}

function createCroppedCanvas(originalCanvas, image, spotlight) {
    const maxDimension = 800;
    const imageRect = image.getBoundingClientRect();
    
    const scaleX = originalCanvas.width / imageRect.width;
    const scaleY = originalCanvas.height / imageRect.height;

    // Get spotlight position relative to image
    const spotRect = spotlight.getBoundingClientRect();

    const scaledX = (spotRect.left - imageRect.left) * scaleX;
    const scaledY = (spotRect.top - imageRect.top) * scaleY;
    const scaledWidth = spotRect.width * scaleX;
    const scaledHeight = spotRect.height * scaleY;
    
    // Calculate the scaling factors to fit within 800x800 while maintaining aspect ratio
    const outputWidth = Math.min(scaledWidth, maxDimension);
    const outputHeight = Math.min(scaledHeight, maxDimension);

    // Create a new canvas for the cropped and resized image
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = outputWidth;
    croppedCanvas.height = outputHeight;
    const ctx = croppedCanvas.getContext('2d');

    // Draw the cropped area from the original canvas, scaled to the new dimensions
    ctx.drawImage(
        originalCanvas,
        scaledX, scaledY, scaledWidth, scaledHeight,
        0, 0, outputWidth, outputHeight
    );

    return croppedCanvas;
}

function addOverlayAndDownload(croppedCanvas) {
    const overlayImg = new Image();
    overlayImg.crossOrigin = 'anonymous'; // Fix CORS error for overlay
    overlayImg.src = currentOverlay; // Use the selected overlay

    if (navigator.userAgent.includes('FBAN')) {
        document.getElementById('downloadNote').style.display = 'block';
    }

    overlayImg.onload = function() {
        const ctx = croppedCanvas.getContext('2d');
        const overlayHeight = croppedCanvas.height;
        const overlayWidth = croppedCanvas.width;

        ctx.drawImage(
            overlayImg,
            0, 0, overlayWidth, overlayHeight
        );

        // Download the image
        const link = document.createElement('a');
        const imageData = croppedCanvas.toDataURL('image/png', 1.0);
        link.href = imageData;
        link.download = 'wa_to_signal_profile_pic.png';
        link.click();
    };
}
