// Analytics tracking for Ook op Signal website
(function() {
    'use strict';

    // Track different types of events
    function trackEvent(eventType = 'page_visits') {
        fetch('analytics.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event: eventType
            })
        })
        .catch(error => {
            console.warn('Analytics request failed:', error);
        });
    }

    // Track page visit on load
    function trackPageView() {
        trackEvent('page_visits');
    }

    // Track upload button clicks
    function trackUploadClick() {
        trackEvent('upload_clicks');
    }

    // Track download button clicks
    function trackDownloadClick() {
        trackEvent('download_clicks');
    }

    // Initialize when DOM is ready
    function initializeAnalytics() {
        // Track page view
        trackPageView();

        // Add event listeners for upload buttons
        const initialUploadButton = document.getElementById('initialUploadButton');
        const uploadButton = document.getElementById('uploadButton');

        if (initialUploadButton) {
            initialUploadButton.addEventListener('click', trackUploadClick);
        }
        if (uploadButton) {
            uploadButton.addEventListener('click', trackUploadClick);
        }

        // Add event listener for download button
        const downloadButton = document.getElementById('downloadButton');
        if (downloadButton) {
            downloadButton.addEventListener('click', trackDownloadClick);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAnalytics);
    } else {
        initializeAnalytics();
    }
})();