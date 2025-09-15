const initialform = document.getElementById('initialUploadForm');


initialform.addEventListener('submit', function(event) {
    event.preventDefault();
    if (initialform.checkValidity()) {
        // Use a trusted event for submission
        const fileInput = document.getElementById('initialImageInput');
        const file = fileInput.files[0];

        if (file) {
            handleFileUpload(file);
        }
    }
});

document.getElementById('initialImageInput').addEventListener('change', function() {
    // Manually trigger initialform submission
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    initialform.dispatchEvent(submitEvent);
});

const form = document.getElementById('uploadForm');

form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (form.checkValidity()) {
        // Use a trusted event for submission
        const fileInput = document.getElementById('imageInput');
        const file = fileInput.files[0];

        if (file) {
            handleFileUpload(file);
        }
    }
});

document.getElementById('imageInput').addEventListener('change', function() {
    // Manually trigger form submission
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
});

function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Fix CORS error
        img.src = e.target.result;
        img.onload = function() {
            renderImageToCanvas(img);
        };
    };
    reader.readAsDataURL(file);
}

function renderImageToCanvas(img) {
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = '';
    imageEditor.style.display = 'block';
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const imgWidth = img.width;
    const imgHeight = img.height;

    canvas.width = imgWidth;
    canvas.height = imgHeight;

    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
    updateImagePreview(imagePreview, canvas);
    setTimeout(() => {
        setupSpotlight(imagePreview, imgWidth/imgHeight);
        setupThumbnails();
    }, 200);
}
function updateImagePreview(imagePreview, canvas) {
    imagePreview.innerHTML = `
        <div id="imageContainer" style="maxwidth:"${canvas.width}px">
            <img src="${canvas.toDataURL()}" alt="Uploaded Image" style="max-width: 100%;">
            <div id="spotlight">
                <div class="resize-handle nw" data-handle="nw"></div>
                <div class="resize-handle ne" data-handle="ne"></div>
                <div class="resize-handle sw" data-handle="sw"></div>
                <div class="resize-handle se" data-handle="se"></div>
                <div class="signal-box" id="signalBox"></div>
            </div>
        </div>`;
}

function setupSpotlight(imagePreview, ratio) {
    requestAnimationFrame(() => {
        const spotlight = document.getElementById('spotlight');
        const imageSize = Math.max(imagePreview.clientHeight, imagePreview.clientWidth);
        const spotlightSize = ratio > 1 ? imageSize / ratio * .95 : imageSize * ratio * .95;

        spotlight.style.width = `${spotlightSize}px`;
        spotlight.style.height = `${spotlightSize}px`;

        centerSpotlight(spotlight, imagePreview);
        makeElementDraggable(spotlight);


        const buttons = document.getElementById('buttons');
        const uploadButton = document.getElementById('uploadButton');
        buttons.style.display = 'flex';
        uploadButton.addEventListener('change', function() {
            // Manually trigger form submission
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);
        });

        initialform.removeEventListener('submit', function(event) {});
    });
}

function centerSpotlight(spotlight, imagePreview) {
        const leftPosition = (imagePreview.clientWidth - spotlight.offsetWidth) / 2;
        const topPosition = (imagePreview.clientHeight - spotlight.offsetHeight) / 2;

        spotlight.style.left = `${leftPosition}px`;
        spotlight.style.top = `${topPosition}px`;
}

function setupThumbnails() {
    const currentOverlay = {
        en: 'images/ookopsignal.png',
        nl: 'images/ookopsignal.png',
        de: 'images/auchaufsignal.png',
        sv: 'images/ocksapasignal.png',
        fr: 'images/aussisursignal.png',
        es: 'images/tambienensignal.png',
        it: 'images/anchesusignal.png'
    }[lang];
    document.getElementById('signalBox').style.backgroundImage = `url(${currentOverlay})`;
    document.querySelectorAll('#thumbnails .thumbnail').forEach(t => t.classList.remove('active'));
    document.querySelector('#thumbnails .thumbnail-' + lang).classList.add('active');
}