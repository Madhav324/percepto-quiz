// Initialization for Google Translate
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'hi,ta,te,ml,kn,mr,gu,pa,bn,or,as,ur',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
}

// Function to change the language manually
function translateLanguage(lang) {
    const selectElement = document.querySelector('.goog-te-combo');
    if (selectElement) {
        selectElement.value = lang;
        // Trigger change event
        const event = new Event('change');
        selectElement.dispatchEvent(event);
    }
}

// Initialize language selector
document.addEventListener('DOMContentLoaded', function() {
    // Check if the language selector already exists
    if (!document.getElementById('language-selector')) {
        return;
    }

    const languageSelector = document.getElementById('language-selector');
    
    // Add event listener to language selector
    languageSelector.addEventListener('change', function() {
        translateLanguage(this.value);
    });

    // Set initial language from localStorage if available
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && savedLanguage !== 'en') {
        // Wait for Google Translate to load
        const checkGoogleTranslate = setInterval(function() {
            if (document.querySelector('.goog-te-combo')) {
                clearInterval(checkGoogleTranslate);
                translateLanguage(savedLanguage);
                languageSelector.value = savedLanguage;
            }
        }, 100);
    }
});

// Save selected language to localStorage
function saveLanguagePreference(lang) {
    localStorage.setItem('preferredLanguage', lang);
}

// Add listener to Google Translate dropdown
function addGoogleTranslateListener() {
    const observer = new MutationObserver(function(mutations) {
        if (document.querySelector('.goog-te-combo')) {
            const googleCombo = document.querySelector('.goog-te-combo');
            googleCombo.addEventListener('change', function() {
                saveLanguagePreference(this.value);
                // Also update our visible selector
                const languageSelector = document.getElementById('language-selector');
                if (languageSelector) {
                    languageSelector.value = this.value;
                }
            });
            observer.disconnect();
        }
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

// Initialize the Google Translate listener
document.addEventListener('DOMContentLoaded', addGoogleTranslateListener);
