/**
 * Robust Google Translate Integration
 * This script handles Google Translate initialization with multiple fallbacks
 * and error recovery mechanisms.
 */

// Configuration
const TRANSLATE_CONFIG = {
    pageLanguage: 'en',
    includedLanguages: 'hi,ta,te,ml,kn,mr,gu,pa,bn,or,as,ur',
    layout: 'SIMPLE', // Will be converted to google.translate.TranslateElement.InlineLayout.SIMPLE
    autoDisplay: false,
    gaTrack: false
};

// State variables
let translateAPILoaded = false;
let translateInitialized = false;
let translationAttempts = 0;
const MAX_ATTEMPTS = 5;
const scriptLoadTimeoutMs = 10000; // 10 seconds

// DOM elements
let translateElement = null;
let languageSelector = null;

// Initialize when DOM is fully loaded
/**
 * Function to initialize Google Translate
 * This function is called by the Google Translate API when it loads
 */
function googleTranslateElementInit() {
    console.log('Google Translate initialization function called');
    
    // Ensure we have a translate element
    translateElement = document.getElementById('google_translate_element');
    if (!translateElement) {
        console.log('Google Translate element not found, creating one');
        translateElement = document.createElement('div');
        translateElement.id = 'google_translate_element';
        translateElement.style.position = 'absolute';
        translateElement.style.top = '-9999px';
        translateElement.style.left = '-9999px';
        document.body.appendChild(translateElement);
    }
    
    try {
        // Make sure the API is loaded
        if (!isGoogleTranslateReady()) {
            console.error('Google Translate API not loaded properly');
            return;
        }
        
        // Convert layout string to enum value
        let layoutValue = google.translate.TranslateElement.InlineLayout.SIMPLE;
        if (TRANSLATE_CONFIG.layout === 'HORIZONTAL') {
            layoutValue = google.translate.TranslateElement.InlineLayout.HORIZONTAL;
        } else if (TRANSLATE_CONFIG.layout === 'VERTICAL') {
            layoutValue = google.translate.TranslateElement.InlineLayout.VERTICAL;
        }
        
        // Initialize the Google Translate Element
        new google.translate.TranslateElement({
            pageLanguage: TRANSLATE_CONFIG.pageLanguage,
            includedLanguages: TRANSLATE_CONFIG.includedLanguages,
            layout: layoutValue,
            autoDisplay: TRANSLATE_CONFIG.autoDisplay,
            gaTrack: TRANSLATE_CONFIG.gaTrack
        }, 'google_translate_element');
        
        translateAPILoaded = true;
        translateInitialized = true;
        console.log('Google Translate initialized successfully');
        
        // Setup MutationObserver to clean up Google's UI clutter
        setupTranslateObserver();
        
        // Restore saved language if any
        setTimeout(function() {
            restoreSavedLanguage();
        }, 1000);
    } catch (error) {
        console.error('Failed to initialize Google Translate:', error);
        translateInitialized = false;
    }
}

/**
 * Initialize the translation system when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing translator');
    
    // Show the language selector immediately (don't wait for Google)
    showTranslateBar();
    
    // Setup custom language selector
    setupLanguageSelector();
    
    // Try to load Google Translate API
    initializeTranslation();
    
    // Check if we need to apply a saved language (non-English)
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && savedLanguage !== 'en') {
        // Set the cookie directly to ensure Google Translate picks it up on page load
        document.cookie = `googtrans=/auto/${savedLanguage}; path=/`;
        document.cookie = `googtrans=/auto/${savedLanguage}; path=/; domain=.${window.location.hostname}`;
        document.cookie = `googtrans=/auto/${savedLanguage}; path=/; domain=${window.location.hostname}`;
        console.log(`Applied saved language cookies for: ${savedLanguage}`);
    }
});

/**
 * Initialize translation - starting point for the whole system
 */
function initializeTranslation() {
    // First check if Google objects are already available
    if (isGoogleTranslateReady()) {
        console.log('Google Translate API already available');
        translateAPILoaded = true;
        googleTranslateElementInit();
    } else {
        // Start checking for Google Translate
        checkGoogleTranslateLoaded();
        
        // Also set a timeout to try loading the script manually if needed
        setTimeout(function() {
            if (!translateAPILoaded) {
                console.log('Google Translate not loaded after initial wait, trying manual load');
                loadGoogleTranslateScript();
            }
        }, 3000);
    }
}

/**
 * Show the language selector bar regardless of Google Translate status
 */
function showTranslateBar() {
    const translateBar = document.getElementById('translate-bar');
    if (translateBar) {
        translateBar.style.opacity = '1';
        console.log('Language selector bar made visible');
    } else {
        console.warn('Language selector bar not found');
    }
}

/**
 * Setup the custom language selector dropdown
 */
function setupLanguageSelector() {
    languageSelector = document.getElementById('language-selector');
    if (!languageSelector) {
        console.warn('Language selector not found');
        return;
    }
    
    console.log('Setting up language selector');
    
    // Restore saved language selection
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
        languageSelector.value = savedLanguage;
        console.log(`Restored saved language: ${savedLanguage}`);
    }
    
    // Listen for language changes
    languageSelector.addEventListener('change', function() {
        const selectedLang = this.value;
        console.log(`Language changed to: ${selectedLang}`);
        
        // Save selection to localStorage
        localStorage.setItem('selectedLanguage', selectedLang);
        
        if (selectedLang === 'en') {
            // For English, use the existing approach which clears cookies and reloads
            applyLanguage(selectedLang);
        } else {
            // For non-English languages, set Google Translate cookie directly and reload
            // This ensures a clean translation state on each language change
            document.cookie = `googtrans=/auto/${selectedLang}; path=/`;
            document.cookie = `googtrans=/auto/${selectedLang}; path=/; domain=.${window.location.hostname}`;
            document.cookie = `googtrans=/auto/${selectedLang}; path=/; domain=${window.location.hostname}`;
            
            console.log(`Set cookies and reloading for language: ${selectedLang}`);
            location.reload();
        }
    });
}

/**
 * Force translation using direct document manipulation and cookies
 * @param {string} lang - Language code to translate to
 */
function forceTranslation(lang) {
    if (!lang) return false;
    
    console.log(`Forcing translation to ${lang} using direct methods`);
    
    if (lang === 'en') {
        // For English, clear all Google Translate cookies and reload
        console.log('Forcing English language - clearing all translation cookies');
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.' + location.hostname + '; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=' + location.hostname + '; path=/;';
        
        // Remove translation attributes
        document.documentElement.removeAttribute('translate');
        document.documentElement.setAttribute('lang', 'en');
        
        // Force a page reload to reset Google Translate state
        location.reload();
        return true;
    }
    
    // For other languages:
    // Set HTML lang attribute
    document.documentElement.setAttribute('lang', lang);
    
    // Try setting Google-specific attributes
    document.documentElement.setAttribute('translate', 'yes');
    
    // Set Google Translate cookies that the widget looks for
    document.cookie = `googtrans=/auto/${lang}; path=/`;
    document.cookie = `googtrans=/auto/${lang}; path=/; domain=.${window.location.hostname}`;
    document.cookie = `googtrans=/auto/${lang}; path=/; domain=${window.location.hostname}`;
    
    // Force reload Google's translation frame if present
    const frames = document.querySelectorAll('iframe');
    frames.forEach(frame => {
        try {
            if (frame.src.includes('translate')) {
                console.log('Found a Google Translate frame, updating it');
                const currentSrc = frame.src;
                
                // Force reload the frame with language parameter
                if (currentSrc.includes('tl=')) {
                    frame.src = currentSrc.replace(/tl=\w+/, `tl=${lang}`);
                } else {
                    const separator = currentSrc.includes('?') ? '&' : '?';
                    frame.src = `${currentSrc}${separator}tl=${lang}`;
                }
            }
        } catch (e) {
            // Ignore cross-origin errors
        }
    });
    
    // Try to manually trigger translation by creating and using a temp element
    const tempElement = document.createElement('div');
    tempElement.id = 'google-translate-trigger';
    tempElement.style.position = 'absolute';
    tempElement.style.top = '-9999px';
    tempElement.style.left = '-9999px';
    tempElement.className = `notranslate lang-${lang}`;
    tempElement.setAttribute('translate', 'yes');
    document.body.appendChild(tempElement);
    
    // Give the DOM time to update, then force Google Translate
    setTimeout(() => {
        // Try accessing the Google Translation directly
        if (window.google && window.google.translate) {
            try {
                console.log('Directly accessing Google Translate API');
                
                // Method 1: Try using the Translation Controller if available
                if (window.google.translate.TranslationController) {
                    const controller = window.google.translate.TranslationController.getInstance();
                    if (controller) {
                        controller.setLanguagePair('en', lang);
                        controller.translatePage();
                        console.log('Used TranslationController to translate page');
                    }
                }
                
                // Method 2: Try manually calling the translate function
                const translateFunc = window.google.translate.translate || 
                                     window.google.translate.translatePage ||
                                     window.google.translate.Element?.prototype?.translate;
                
                if (typeof translateFunc === 'function') {
                    translateFunc('en', lang);
                    console.log('Called translate function directly');
                }
            } catch (e) {
                console.error('Error accessing Google Translate API directly', e);
            }
        }
        
        // Remove our temporary element
        document.body.removeChild(tempElement);
    }, 500);
    
    return true;
}

/**
 * Apply the selected language using multiple methods for better reliability
 */
function applyLanguage(lang) {
    if (!lang) return false;
    
    console.log(`Attempting to apply language: ${lang}`);
    
    // Store selected language in localStorage
    localStorage.setItem('selectedLanguage', lang);
    
    // If language is English, reset cookies and reload without Google Translate
    if (lang === 'en') {
        console.log('Switching to English - removing translation cookies');
        // Remove Google Translate cookies
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.' + location.hostname + '; path=/;';
        
        // Reload the page to show original English content
        location.reload();
        return true;
    }
    
    // Make sure the Google API is loaded
    if (typeof google === 'undefined' || typeof google.translate === 'undefined') {
        console.log('Google Translate API not loaded, attempting to load it');
        loadGoogleTranslateScript();
        setTimeout(() => applyLanguage(lang), 1000); // Try again after a delay
        return false;
    }
    
    let success = false;
    
    // Method 1: Using the Google Translate dropdown if available
    const googleCombo = document.querySelector('.goog-te-combo');
    if (googleCombo) {
        try {
            console.log('Method 1: Using Google Translate dropdown');
            googleCombo.value = lang;
            
            // Create and dispatch events that better simulate user interaction
            const changeEvent = new Event('change', { bubbles: true });
            const clickEvent = new MouseEvent('click', { bubbles: true });
            
            googleCombo.dispatchEvent(clickEvent);
            googleCombo.dispatchEvent(changeEvent);
            
            // Also try the select event
            const selectEvent = document.createEvent('UIEvents');
            selectEvent.initUIEvent('select', true, true, window, 1);
            googleCombo.dispatchEvent(selectEvent);
            
            console.log('Events dispatched to Google dropdown');
            success = true;
        } catch (e) {
            console.warn('Error using Google dropdown:', e);
        }
    }
    
    // Method 2: Using the newer Google Translate dropdown
    if (!success) {
        const newCombo = document.querySelector('.VIpgJd-ZVi9od-xl07Ob-lTBxed');
        if (newCombo) {
            try {
                console.log('Method 2: Using newer Google Translate dropdown');
                newCombo.value = lang;
                newCombo.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Dispatch multiple event types to ensure it triggers
                ['input', 'keydown', 'keyup', 'select', 'click'].forEach(eventType => {
                    newCombo.dispatchEvent(new Event(eventType, { bubbles: true }));
                });
                
                // Directly set innerText of select to force visual update
                if (newCombo.options && newCombo.options[newCombo.selectedIndex]) {
                    newCombo.options[newCombo.selectedIndex].selected = true;
                }
                
                success = true;
                console.log('Successfully applied language: ' + lang);
                
                // Force a small delay and double-check if Google Translate is working
                setTimeout(() => {
                    // Check if we see any translated elements
                    const translatedElements = document.querySelectorAll('.translated-ltr, .translated-rtl');
                    if (translatedElements.length === 0) {
                        console.warn('No translated elements detected. Trying additional methods...');
                        // Directly invoke Google's translate function if available
                        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
                            try {
                                document.documentElement.setAttribute('lang', lang);
                                console.log('Directly calling Google TranslateElement methods');
                            } catch (e) {
                                console.error('Failed to directly call TranslateElement', e);
                            }
                        }
                    } else {
                        console.log(`Found ${translatedElements.length} translated elements`);
                    }
                }, 500);
            } catch (e) {
                console.error('Error applying language with newer dropdown', e);
            }
        }
    }
    
    // Method 3: Using the TranslateElement API directly
    if (!success && window.google && google.translate) {
        try {
            console.log('Method 3: Using TranslateElement API directly');
            if (google.translate.TranslateElement) {
                // Try multiple API approaches
                if (typeof google.translate.TranslateElement.getInstance === 'function') {
                    const instance = google.translate.TranslateElement.getInstance();
                    if (instance) {
                        // Some versions have a setLanguage method
                        if (typeof instance.setLanguage === 'function') {
                            console.log('Using instance.setLanguage method');
                            instance.setLanguage(lang);
                            success = true;
                        } 
                        // Others have a translate method
                        else if (typeof instance.translate === 'function') {
                            console.log('Using instance.translate method');
                            instance.translate(lang);
                            success = true;
                        }
                    }
                }
                
                // If the above methods didn't work, try re-initializing
                if (!success) {
                    console.log('Re-initializing Google Translate with target language');
                    try {
                        // Remove existing Google elements
                        const existingElements = document.querySelectorAll('.goog-te-combo, .VIpgJd-ZVi9od-xl07Ob-lTBxed, .skiptranslate');
                        existingElements.forEach(el => {
                            if (el && el.parentNode) {
                                el.parentNode.removeChild(el);
                            }
                        });
                        
                        // Force recreate the translate element
                        if (translateElement) {
                            translateElement.innerHTML = '';
                        } else {
                            translateElement = document.getElementById('google_translate_element');
                            if (!translateElement) {
                                translateElement = document.createElement('div');
                                translateElement.id = 'google_translate_element';
                                document.body.appendChild(translateElement);
                            }
                        }
                        
                        // Initialize with the desired language
                        new google.translate.TranslateElement({
                            pageLanguage: 'en',
                            includedLanguages: lang,
                            autoDisplay: true,
                            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                            multilanguagePage: true,
                            gaTrack: false
                        }, 'google_translate_element');
                        
                        success = true;
                        console.log(`Reinitialized Google Translate with language: ${lang}`);
                        
                        // Additional force for iframe approach
                        setTimeout(clickLanguageLinkInIframe, 1000, lang);
                    } catch (e) {
                        console.error('Error reinitializing Google Translate:', e);
                    }
                }
            } else {
                // No Google Translate instance found, create a new one with default languages
                console.log('No existing Google Translate instance, creating a new one');
                try {
                    new google.translate.TranslateElement({
                        pageLanguage: 'en',
                        includedLanguages: 'hi,ta,te,ml,kn,mr,gu,pa,bn,or,as,ur',
                        autoDisplay: true,
                        gaTrack: false,
                        gaId: '',
                        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                    }, 'google_translate_element');
                    
                    console.log('Created new TranslateElement instance');
                    success = true;
                } catch (e) {
                    console.error('Error creating new TranslateElement:', e);
                }
            }
        } catch (e) {
            console.warn('Error using TranslateElement API:', e);
        }
    }
    
    // Method 4: Check for and click language links in Google Translate iframes
    if (!success) {
        console.log('Method 4: Looking for language links in Google Translate iframes');
        success = clickLanguageLinkInIframe(lang);
        if (success) {
            console.log('Successfully clicked language link in iframe');
        }
    }
    
    // Method 5: Force translation using direct document manipulation
    if (!success || true) { // Always use this method for reliability
        console.log('Method 5: Using direct force translation as final method');
        setTimeout(() => forceTranslation(lang), 500);
    }
    
    // Method 6: Force reinitialization if other methods failed
    if (!success && isGoogleTranslateReady() && !translateInitialized) {
        console.log('Method 6: Reinitializing Google Translate element');
        try {
            googleTranslateElementInit();
            
            // Try again after reinitialization
            setTimeout(function() {
                applyLanguage(lang);
            }, 1000);
            
            // Consider this a success since we're retrying
            success = true;
        } catch (e) {
            console.warn('Error reinitializing Google Translate:', e);
        }
    }
    
    // Final outcome
    if (!success) {
        console.warn('Could not apply language with any method');
        
        // If all else fails, try reloading the script
        if (!translateAPILoaded) {
            console.log('Google Translate not loaded, attempting to load script');
            loadGoogleTranslateScript();
            
            // After loading, try applying again after a delay
            setTimeout(function() {
                applyLanguage(lang);
            }, 2000);
        }
    } else {
        console.log(`Successfully applied language: ${lang}`);
    }
    
    return success;
}

/**
 * Check if Google Translate API is loaded and ready
 */
function isGoogleTranslateReady() {
    return typeof google !== 'undefined' && 
           typeof google.translate !== 'undefined' && 
           typeof google.translate.TranslateElement !== 'undefined';
}

/**
 * Function to check if Google Translate is loaded
 */
function checkGoogleTranslateLoaded() {
    console.log('Checking if Google Translate is loaded');
    
    if (isGoogleTranslateReady()) {
        console.log('Google Translate API detected');
        translateAPILoaded = true;
        
        if (!translateInitialized) {
            console.log('Google Translate not initialized yet, initializing now');
            googleTranslateElementInit();
        }
        
        return true;
    } else {
        console.log('Google Translate not yet loaded');
        
        // Continue checking if we haven't reached max attempts
        if (translationAttempts < MAX_ATTEMPTS) {
            setTimeout(function() {
                checkGoogleTranslateLoaded();
            }, 1000);
        } else {
            console.warn(`Max attempts (${MAX_ATTEMPTS}) reached for checking Google Translate`);
        }
        
        return false;
    }
}

/**
 * Load the Google Translate script with error handling and timeout
 */
function loadGoogleTranslateScript() {
    translationAttempts++;
    
    if (translationAttempts > MAX_ATTEMPTS) {
        console.error(`Failed to load Google Translate after ${MAX_ATTEMPTS} attempts`);
        return;
    }
    
    console.log(`Loading Google Translate script (attempt ${translationAttempts}/${MAX_ATTEMPTS})`);
    
    // Remove any existing script to avoid conflicts
    const existingScript = document.querySelector('script[src*="translate_a/element.js"]');
    if (existingScript) {
        existingScript.parentNode.removeChild(existingScript);
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    
    // Handle script load error
    script.onerror = function() {
        console.error('Failed to load Google Translate script');
        
        // Wait and try again with exponential backoff
        setTimeout(function() {
            loadGoogleTranslateScript();
        }, 1000 * Math.pow(2, translationAttempts));
    };
    
    // Add the script to the page
    document.body.appendChild(script);
    
    console.log('Google Translate script loading attempted');
}

/**
 * Setup an observer to clean up Google's UI elements and handle translation changes
 */
function setupTranslateObserver() {
    console.log('Setting up MutationObserver for Google Translate');
    
    const observer = new MutationObserver(function(mutations) {
        // Clean up Google's UI elements
        cleanUpGoogleUI();
        
        // Check for Google combo boxes (standard and newer versions)
        const googleCombo = document.querySelector('.goog-te-combo') || 
                           document.querySelector('.VIpgJd-ZVi9od-xl07Ob-lTBxed');
        
        // If a combo element exists but hasn't been monitored yet, add event listeners
        if (googleCombo && !googleCombo.dataset.monitored) {
            googleCombo.dataset.monitored = 'true';
            console.log('Found Google combo selector, setting up sync');
            
            // Sync Google's selector with our custom one
            googleCombo.addEventListener('change', function() {
                const googleSelectedLang = this.value;
                if (languageSelector && languageSelector.value !== googleSelectedLang) {
                    console.log(`Google changed language to: ${googleSelectedLang}, updating our selector`);
                    languageSelector.value = googleSelectedLang;
                    localStorage.setItem('selectedLanguage', googleSelectedLang);
                }
            });
            
            // Check if we have a saved language to apply
            const savedLanguage = localStorage.getItem('selectedLanguage');
            if (savedLanguage && savedLanguage !== 'en' && googleCombo.value !== savedLanguage) {
                console.log(`Applying saved language ${savedLanguage} to newly detected Google combo`);
                setTimeout(function() {
                    // Update Google's combo and trigger change event
                    googleCombo.value = savedLanguage;
                    googleCombo.dispatchEvent(new Event('change', { bubbles: true }));
                }, 500);
            }
        }
        
        // Check for and handle Google's translation frames
        checkForTranslationFrames();
    });
    
    // Start observing the entire document for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
}

/**
 * Clean up Google Translate UI elements
 */
function cleanUpGoogleUI() {
    // Hide Google's top banner if it exists
    const banners = document.querySelectorAll('.goog-te-banner-frame, .skiptranslate');
    banners.forEach(function(banner) {
        if (banner) banner.style.display = 'none';
    });
    
    // Hide Google logo/icon
    const icons = document.querySelectorAll('.goog-te-gadget-icon, .VIpgJd-ZVi9od-l4eHX-SIsrTd');
    icons.forEach(function(icon) {
        if (icon) icon.style.display = 'none';
    });
    
    // Clean up Google's selector container to only show the dropdown
    const gadgets = document.querySelectorAll('.goog-te-gadget, .VIpgJd-ZVi9od-l4eHX');
    gadgets.forEach(function(gadget) {
        if (!gadget) return;
        
        // Keep only the dropdown, hide all other children
        const children = gadget.childNodes;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.tagName === 'SELECT' || child.classList?.contains('VIpgJd-ZVi9od-xl07Ob-lTBxed')) {
                // Keep the dropdown visible
            } else {
                // Hide everything else
                child.style.display = 'none';
            }
        }
    });
}

/**
 * Click a language link inside a Google Translate iframe
 * @param {string} lang - Language code to find and click
 * @returns {boolean} - True if successful, false otherwise
 */
function clickLanguageLinkInIframe(lang) {
    if (!lang) return false;
    
    console.log(`Looking for language link in iframes for: ${lang}`);
    let success = false;
    
    try {
        // Look for all iframes that might be Google Translate related
        const frames = document.querySelectorAll('iframe');
        for (let i = 0; i < frames.length; i++) {
            try {
                const frame = frames[i];
                if (frame.src.indexOf('translate') !== -1 || 
                    frame.classList.contains('goog-te-menu-frame') ||
                    frame.classList.contains('VIpgJd-ZVi9od-xl07Ob-OEVmcd')) {
                    
                    // Try to access the frame content
                    const frameDoc = frame.contentDocument || frame.contentWindow?.document;
                    if (!frameDoc) continue;
                    
                    // Look for language links (they might have different formats)
                    let links = frameDoc.querySelectorAll(`a[onclick*="${lang}"], a[id*="${lang}"]`);
                    
                    // If no direct matches, get all links and check more thoroughly
                    if (links.length === 0) {
                        links = frameDoc.getElementsByTagName('a');
                        
                        for (let j = 0; j < links.length; j++) {
                            const link = links[j];
                            const id = link.getAttribute('id') || '';
                            const onclick = link.getAttribute('onclick') || '';
                            
                            if (id.indexOf(lang) !== -1 || onclick.indexOf(lang) !== -1) {
                                console.log(`Found language link for ${lang}, clicking...`);
                                link.click();
                                success = true;
                                break;
                            }
                        }
                    } else if (links.length > 0) {
                        console.log(`Found ${links.length} language links for ${lang}, clicking first one...`);
                        links[0].click();
                        success = true;
                    }
                }
                
                if (success) break;
            } catch (frameErr) {
                // Ignore cross-origin errors
            }
        }
    } catch (e) {
        console.warn('Error searching translate frames:', e);
    }
    
    return success;
}

/**
 * Check for and interact with Google Translate frames that may contain language options
 */
function checkForTranslationFrames() {
    // Look for all frames that might be related to Google Translate
    const frames = document.querySelectorAll('iframe');
    frames.forEach(function(frame) {
        try {
            // Check if this is a Google Translate related frame
            if (frame.src.indexOf('translate') !== -1 || 
                frame.classList.contains('goog-te-menu-frame') ||
                frame.classList.contains('VIpgJd-ZVi9od-xl07Ob-OEVmcd')) {
                
                // Ensure we can access its content
                const frameDoc = frame.contentDocument || frame.contentWindow?.document;
                if (!frameDoc) return;
                
                // Add event listeners to language links if they don't have them
                const links = frameDoc.querySelectorAll('a');
                links.forEach(function(link) {
                    if (!link.dataset.monitored) {
                        link.dataset.monitored = 'true';
                        
                        // Determine which language this link is for
                        const id = link.getAttribute('id') || '';
                        const onclick = link.getAttribute('onclick') || '';
                        const langMatch = id.match(/\:(\w+)/) || onclick.match(/\W(\w{2})\W/);
                        
                        if (langMatch && langMatch[1]) {
                            const lang = langMatch[1];
                            
                            // Listen for clicks on this language link
                            link.addEventListener('click', function() {
                                console.log(`Translation frame language link clicked: ${lang}`);
                                if (languageSelector && languageSelector.value !== lang) {
                                    languageSelector.value = lang;
                                    localStorage.setItem('selectedLanguage', lang);
                                }
                            });
                        }
                    }
                });
            }
        } catch (e) {
            // Ignore cross-origin frame access errors
        }
    });
}

/**
 * Restore the saved language preference
 */
function restoreSavedLanguage() {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && savedLanguage !== 'en') {
        console.log(`Restoring saved language: ${savedLanguage}`);
        
        if (languageSelector) {
            languageSelector.value = savedLanguage;
        }
        
        applyLanguage(savedLanguage);
    }
}

// Start a periodic check to ensure Google Translate is working
setTimeout(function verifyTranslateStatus() {
    if (!translateAPILoaded || !translateInitialized) {
        console.log('Verifying Google Translate status...');
        
        if (isGoogleTranslateReady()) {
            translateAPILoaded = true;
            console.log('Google Translate API detected during verification');
            
            if (!translateInitialized) {
                console.log('Initializing Google Translate during verification');
                googleTranslateElementInit();
            }
        }
        
        // Continue checking periodically if not initialized
        setTimeout(verifyTranslateStatus, 5000);
    }
}, 5000);

// Global function to check status (for debugging)
window.checkTranslateStatus = function() {
    const status = {
        apiLoaded: translateAPILoaded,
        initialized: translateInitialized,
        attempts: translationAttempts,
        googleReady: isGoogleTranslateReady(),
        uiElementsPresent: document.querySelector('.goog-te-combo') !== null
    };
    
    console.log('Translation Status:', status);
    return status;
}

// Add mobile-friendly adjustments
window.addEventListener('resize', function() {
    const translateBar = document.getElementById('translate-bar');
    if (!translateBar) return;
    
    if (window.innerWidth < 480) {
        // Extra small screens
        const label = translateBar.querySelector('span');
        if (label) label.style.display = 'none';
    } else {
        // Larger screens
        const label = translateBar.querySelector('span');
        if (label) label.style.display = '';
    }
});

// Mobile adjustments are handled directly in the resize event listener


