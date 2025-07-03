// Google Translate Widget Helper
function loadTranslateWidget() {
    // Create the Google Translate Element script
    const translateScript = document.createElement('script');
    translateScript.type = 'text/javascript';
    translateScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(translateScript);

    // Create container for the translate element
    const translateContainer = document.createElement('div');
    translateContainer.id = 'google_translate_element';
    translateContainer.style.position = 'absolute';
    translateContainer.style.top = '10px';
    translateContainer.style.right = '10px';
    translateContainer.style.zIndex = '1000';
    
    // Insert the translate container as the first element in body
    document.body.insertBefore(translateContainer, document.body.firstChild);
    
    // Add CSS styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Google Translate Widget Styling */
        #google_translate_element {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1000;
        }
        
        /* Hide Google Translate attribution */
        .goog-logo-link, .goog-te-gadget span {
            display: none !important;
        }
        
        .goog-te-gadget {
            color: transparent !important;
            font-size: 0px !important;
        }
        
        .goog-te-combo {
            padding: 5px;
            border-radius: 4px;
            border: 1px solid #ddd;
            font-size: 12px;
            background-color: white;
            color: #333;
            cursor: pointer;
        }
        
        /* Compact mode for mobile */
        @media (max-width: 480px) {
            #google_translate_element {
                top: 5px;
                right: 5px;
            }
            
            .goog-te-combo {
                font-size: 10px;
                padding: 3px;
            }
        }
    `;
    document.head.appendChild(styleElement);
}

// Initialize Google Translate function
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}

// Load the widget when the DOM is ready
document.addEventListener('DOMContentLoaded', loadTranslateWidget);

// In case the script is loaded after DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTranslateWidget);
} else {
    loadTranslateWidget();
}
