// Initialization for Google Translate
function googleTranslateElementInit() {
    // Check if element exists before initializing
    if (!document.getElementById('google_translate_element')) {
        console.error('Google Translate element not found on page');
        return;
    }
    
    try {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'hi,ta,te,ml,kn,mr,gu,pa,bn,or,as,ur',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
        console.log('Google Translate initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Google Translate:', error);
    }
}

// Function to change the language manually
function translateLanguage(lang) {
    // Wait for Google Translate to load if not immediately available
    const maxAttempts = 10;
    let attempts = 0;
    
    const checkAndTranslate = function() {
        const selectElement = document.querySelector('.goog-te-combo');
        if (selectElement) {
            // Set the value and trigger change
            selectElement.value = lang;
            selectElement.dispatchEvent(new Event('change'));
            
            // Save to localStorage for persistence
            localStorage.setItem('preferredLanguage', lang);
            console.log('Language changed to: ' + lang);
            
            // Update custom language selector if it exists
            const customSelector = document.getElementById('language-selector');
            if (customSelector && customSelector.value !== lang) {
                customSelector.value = lang;
            }
            
            return true;
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkAndTranslate, 300); // Try again in 300ms
            return false;
        } else {
            console.error('Google Translate selector not found after multiple attempts');
            return false;
        }
    };
    
    return checkAndTranslate();
}

// Initialize language selector and Google Translate
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing translate components');
    
    // Check if the language selector exists
    const languageSelector = document.getElementById('language-selector');
    if (!languageSelector) {
        console.log('Custom language selector not found on page');
        return;
    }
    
    // Ensure Google Translate element exists
    if (!document.getElementById('google_translate_element')) {
        console.error('Google Translate element not found, creating one');
        const gtElement = document.createElement('div');
        gtElement.id = 'google_translate_element';
        gtElement.style.display = 'none';
        document.body.appendChild(gtElement);
    }
    
    // Add event listener to language selector
    languageSelector.addEventListener('change', function() {
        console.log('Language selector changed to:', this.value);
        translateLanguage(this.value);
    });

    // Function to restore saved language preference
    function restoreSavedLanguage() {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
            console.log('Restoring saved language:', savedLanguage);
            languageSelector.value = savedLanguage;
            
            // Wait for Google Translate to fully initialize
            let attempts = 0;
            const maxAttempts = 20;
            
            const translateCheck = setInterval(function() {
                if (document.querySelector('.goog-te-combo') || attempts >= maxAttempts) {
                    clearInterval(translateCheck);
                    
                    if (document.querySelector('.goog-te-combo')) {
                        console.log('Google Translate loaded, applying language');
                        translateLanguage(savedLanguage);
                    } else {
                        console.warn('Google Translate failed to load in expected time');
                    }
                }
                attempts++;
            }, 250);
        }
    }
    
    // Check if Google API script is loaded
    if (window.google && window.google.translate) {
        console.log('Google Translate already loaded');
        restoreSavedLanguage();
    } else {
        // Wait for the script to load
        console.log('Waiting for Google Translate to load');
        window.addEventListener('load', restoreSavedLanguage);
    }
});

// Save selected language to localStorage
function saveLanguagePreference(lang) {
    localStorage.setItem('preferredLanguage', lang);
}

// Function to make Google Translate UI more compact
function cleanupTranslateUI() {
    // We use a mutation observer to watch for Google Translate elements being inserted
    const observer = new MutationObserver(function(mutations) {
        // Look for the Google translate banner frame
        const bannerFrame = document.querySelector('.goog-te-banner-frame');
        if (bannerFrame) {
            // Make it more compact
            bannerFrame.style.height = 'auto';
            bannerFrame.style.top = '0';
            bannerFrame.style.boxShadow = 'none';
        }
        
        // Hide the Google Translate attribution
        const attributionDiv = document.querySelector('.goog-te-gadget');
        if (attributionDiv) {
            const childElements = attributionDiv.querySelectorAll('span, a, div');
            childElements.forEach(el => {
                if (el.classList.contains('goog-te-combo')) return; // Keep the actual dropdown
                el.style.display = 'none';
            });
        }
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true
    });
    
    // Cleanup after 10 seconds to save resources
    setTimeout(() => {
        observer.disconnect();
        console.log('Translate UI cleanup observer disconnected');
    }, 10000);
}

// Add listener to Google Translate dropdown
function addGoogleTranslateListener() {
    let isConnected = false;
    
    const observer = new MutationObserver(function(mutations) {
        if (document.querySelector('.goog-te-combo') && !isConnected) {
            isConnected = true;
            const googleCombo = document.querySelector('.goog-te-combo');
            
            // Style the dropdown to be more compact
            googleCombo.style.fontSize = '0.8rem';
            googleCombo.style.padding = '2px';
            googleCombo.style.margin = '0';
            
            // Add change listener
            googleCombo.addEventListener('change', function() {
                saveLanguagePreference(this.value);
                // Also update our visible selector
                const languageSelector = document.getElementById('language-selector');
                if (languageSelector) {
                    languageSelector.value = this.value;
                }
                console.log('Google selector changed to:', this.value);
            });
            
            // Run UI cleanup
            cleanupTranslateUI();
            
            // Disconnect observer after finding and hooking the dropdown
            observer.disconnect();
            console.log('Successfully connected to Google Translate dropdown');
        }
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
    
    // Safety timeout - disconnect after 10 seconds if not found
    setTimeout(() => {
        if (!isConnected) {
            observer.disconnect();
            console.warn('Google Translate dropdown not found after timeout');
        }
    }, 10000);
}

// Initialize the Google Translate listener
document.addEventListener('DOMContentLoaded', function() {
    addGoogleTranslateListener();
    
    // Fix mobile display of language selector
    const handleResize = function() {
        const translateBar = document.getElementById('translate-bar');
        if (translateBar) {
            // On very small screens, make it even more compact
            if (window.innerWidth < 480) {
                translateBar.style.padding = '1px 4px';
                const label = translateBar.querySelector('span');
                if (label) label.style.display = 'none'; // Hide the "Language:" label on very small screens
            } else {
                translateBar.style.padding = '';
                const label = translateBar.querySelector('span');
                if (label) label.style.display = '';
            }
        }
    };
    
    // Initial call and add resize listener
    handleResize();
    window.addEventListener('resize', handleResize);
});
