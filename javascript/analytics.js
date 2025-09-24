// Analytics tracking for Ook op Signal website
(function() {
    'use strict';

    // Track page visit on load
    function trackPageView() {
        fetch('analytics.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .catch(error => {
            console.warn('Analytics request failed:', error);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageView);
    } else {
        trackPageView();
    }
})();