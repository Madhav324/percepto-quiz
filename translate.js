// Initialization for Google Translate
function googleTranslateElementInit() {
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
        
        // Wait a bit for Google Translate to fully initialize
        setTimeout(function() {
            // Restore saved language after initialization
            restoreSavedLanguage();
        }, 1000);
    } catch (error) {
        console.error('Failed to initialize Google Translate:', error);
    }
}

// Function to change the language manually
function translateLanguage(lang) {
    console.log('Attempting to translate to language:', lang);
    
    // Directly use the Google Translate Widget API if available
    if (typeof google !== 'undefined' && google.translate) {
        try {
            // Try to use Google's doGoogleLanguageTranslator function if available
            if (typeof doGoogleLanguageTranslator === 'function') {
                console.log('Using doGoogleLanguageTranslator function');
                doGoogleLanguageTranslator(lang);
                localStorage.setItem('preferredLanguage', lang);
                
                // Update our custom selector
                const customSelector = document.getElementById('language-selector');
                if (customSelector) customSelector.value = lang;
                
                return true;
            }
        } catch (e) {
            console.log('Direct Google API call failed:', e);
            // Continue with fallback method
        }
    }
    
    // Fallback method - wait for Google Translate to load if not immediately available
    const maxAttempts = 30; // Increase max attempts further
    let attempts = 0;
    
    const checkAndTranslate = function() {
        // Try multiple selector approaches for different Google Translate versions
        const selectElement = document.querySelector('.goog-te-combo') || 
                             document.querySelector('.VIpgJd-ZVi9od-xl07Ob-lTBxed') ||
                             document.querySelector('[aria-label="Language Translate Widget"]') ||
                             document.querySelector('select.goog-te-menu-value');
        
        if (selectElement) {
            console.log('Found Google Translate element:', selectElement);
            
            try {
                // Set the value
                selectElement.value = lang;
                
                // Create and dispatch multiple event types for better compatibility
                selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                selectElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                
                // Also try to trigger actual selection
                const options = selectElement.options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].value === lang) {
                        options[i].selected = true;
                        break;
                    }
                }
                
                // Try clicking the element using a more direct method
                selectElement.click();
                
                // Try to force a form submission if inside a form
                const form = selectElement.closest('form');
                if (form) {
                    console.log('Found form, submitting it');
                    form.submit();
                }
                
                // Use jQuery if available for more event triggering options
                if (window.jQuery) {
                    console.log('Using jQuery for additional event triggering');
                    try {
                        jQuery(selectElement).trigger('change').trigger('click');
                    } catch (err) {
                        console.log('jQuery method failed:', err);
                    }
                }
                
                // Save to localStorage for persistence
                localStorage.setItem('preferredLanguage', lang);
                console.log('Language changed to:', lang);
                
                // Update custom language selector if it exists
                const customSelector = document.getElementById('language-selector');
                if (customSelector && customSelector.value !== lang) {
                    customSelector.value = lang;
                }
                
                // Last resort: Reload the page with the langpair parameter
                if (attempts > 15) {
                    console.log('Using page reload as last resort');
                    // Add a small delay before reload
                    setTimeout(function() {
                        window.location.search = '?langpair=' + lang;
                    }, 500);
                }
                
                return true;
            } catch (error) {
                console.error('Error changing language:', error);
                return false;
            }
        } else if (attempts < maxAttempts) {
            attempts++;
            console.log(`Google Translate selector not found yet, attempt ${attempts}/${maxAttempts}`);
            setTimeout(checkAndTranslate, 500); // Try again in 500ms (increased wait time)
            return false;
        } else {
            console.error('Google Translate selector not found after multiple attempts');
            // Last resort - direct link approach
            console.log('Trying to use direct translation URL approach');
            const translateUrl = 'https://translate.google.com/translate?sl=auto&tl=' + lang + '&u=' + encodeURIComponent(window.location.href);
            window.open(translateUrl, '_blank');
            return false;
        }
    };
    
    return checkAndTranslate();
}

// Direct access to Google's translation API to switch languages
window.doGoogleLanguageTranslator = function(lang) {
    if (typeof google === 'undefined' || typeof google.translate === 'undefined') {
        console.error('Google Translate API not available');
        return false;
    }

    try {
        // Force reload of the Google Translate element with new language
        const gtElement = document.getElementById('google_translate_element');
        if (gtElement) {
            // Clear and reinitialize with desired language
            gtElement.innerHTML = '';
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'hi,ta,te,ml,kn,mr,gu,pa,bn,or,as,ur',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
                multilanguagePage: true
            }, 'google_translate_element');
            
            // Wait a moment for initialization
            setTimeout(function() {
                // Try to find and manipulate the dropdown
                const selectElement = document.querySelector('.goog-te-combo');
                if (selectElement) {
                    selectElement.value = lang;
                    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                    return true;
                }
            }, 300);
        }
    } catch (e) {
        console.error('Error in doGoogleLanguageTranslator:', e);
    }
    return false;
};

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
            
            if (languageSelector) {
                languageSelector.value = savedLanguage;
            }
            
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
