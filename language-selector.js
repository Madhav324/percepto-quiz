/**
 * Language Selector with Google Translate Integration
 * Reusable component for adding multi-language support
 */

// Check if Firebase auth operation is in progress
window.isFirebaseAuthInProgress = false;

// Function to toggle language dropdown
window.toggleLanguageDropdown = function() {
    // Don't open dropdown if Firebase auth is in progress
    if (window.isFirebaseAuthInProgress) {
        console.log('Firebase auth in progress, cannot open language dropdown');
        return;
    }
    
    const dropdown = document.getElementById('languageDropdown');
    dropdown.classList.toggle('show');
};

// Function to change language
window.changeLanguage = function(langCode, displayText) {
    // Don't change language if Firebase auth is in progress
    if (window.isFirebaseAuthInProgress) {
        console.log('Firebase auth in progress, cannot change language');
        return;
    }
    
    // Update display
    document.getElementById('currentLanguage').textContent = displayText;
    document.getElementById('languageDropdown').classList.remove('show');
    
    // Save language preference
    localStorage.setItem('selectedLanguage', langCode);
    localStorage.setItem('selectedLanguageDisplay', displayText);
    
    // Trigger Google Translate
    if (langCode === 'en') {
        // Reset to original language
        if (window.google && window.google.translate) {
            window.location.reload();
        }
    } else {
        // Translate to selected language with a longer delay to prevent popup conflicts
        setTimeout(() => {
            if (!window.isFirebaseAuthInProgress) {
                const selectElement = document.querySelector('.goog-te-combo');
                if (selectElement) {
                    selectElement.value = langCode;
                    selectElement.dispatchEvent(new Event('change'));
                }
            }
        }, 2000); // Increased delay to ensure no conflicts
    }
};

// Initialize Google Translate
function googleTranslateElementInit() {
    // Initialize Google Translate with delayed activation to prevent Firebase popup conflicts
    window.googleTranslateInitializer = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,es,fr,de,it,pt,ru,ja,ko,zh,hi,ar,bn,ur,ta,te,ml,kn,gu,pa,mr,ne,si',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
    };
    
    // Delay initialization to avoid conflicts with Firebase popups
    setTimeout(window.googleTranslateInitializer, 1000);
};

// Load saved language preference
window.addEventListener('load', function() {
    const savedLang = localStorage.getItem('selectedLanguage');
    const savedDisplay = localStorage.getItem('selectedLanguageDisplay');
    
    if (savedLang && savedDisplay) {
        const currentLangElement = document.getElementById('currentLanguage');
        if (currentLangElement) {
            currentLangElement.textContent = savedDisplay;
        }
        
        // Apply translation after a delay and only if no Firebase auth in progress
        if (savedLang !== 'en') {
            setTimeout(() => {
                if (!window.isFirebaseAuthInProgress) {
                    const selectElement = document.querySelector('.goog-te-combo');
                    if (selectElement) {
                        selectElement.value = savedLang;
                        selectElement.dispatchEvent(new Event('change'));
                    }
                }
            }, 2000); // Increased delay to prevent conflicts
        }
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    const languageSelector = document.querySelector('.custom-language-selector');
    const dropdown = document.getElementById('languageDropdown');
    
    if (languageSelector && dropdown && !languageSelector.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Add language selector to page
window.addLanguageSelector = () => {
    const languageSelectorHTML = `
        <!-- Language Selector -->
        <div class="language-selector">
            <div class="custom-language-selector">
                <div class="language-btn" onclick="toggleLanguageDropdown()">
                    <span id="currentLanguage">🌐 EN</span>
                    <span>▼</span>
                </div>
                <div class="language-dropdown" id="languageDropdown">
                    <div class="language-option" onclick="changeLanguage('en', '🌐 EN')">🇺🇸 English</div>
                    <div class="language-option" onclick="changeLanguage('es', '🇪🇸 ES')">🇪🇸 Español</div>
                    <div class="language-option" onclick="changeLanguage('fr', '🇫🇷 FR')">🇫🇷 Français</div>
                    <div class="language-option" onclick="changeLanguage('de', '🇩🇪 DE')">🇩🇪 Deutsch</div>
                    <div class="language-option" onclick="changeLanguage('it', '🇮🇹 IT')">🇮🇹 Italiano</div>
                    <div class="language-option" onclick="changeLanguage('pt', '🇵🇹 PT')">🇵🇹 Português</div>
                    <div class="language-option" onclick="changeLanguage('ru', '🇷🇺 RU')">🇷🇺 Русский</div>
                    <div class="language-option" onclick="changeLanguage('ja', '🇯🇵 JA')">🇯🇵 日本語</div>
                    <div class="language-option" onclick="changeLanguage('ko', '🇰🇷 KO')">🇰🇷 한국어</div>
                    <div class="language-option" onclick="changeLanguage('zh', '🇨🇳 ZH')">🇨🇳 中文</div>
                    <div class="language-option" onclick="changeLanguage('hi', '🇮🇳 HI')">🇮🇳 हिंदी</div>
                    <div class="language-option" onclick="changeLanguage('ar', '🇸🇦 AR')">🇸🇦 العربية</div>
                    <div class="language-option" onclick="changeLanguage('bn', '🇧🇩 BN')">🇧🇩 বাংলা</div>
                    <div class="language-option" onclick="changeLanguage('ur', '🇵🇰 UR')">🇵🇰 اردو</div>
                    <div class="language-option" onclick="changeLanguage('ta', '🇮🇳 TA')">🇮🇳 தமிழ்</div>
                    <div class="language-option" onclick="changeLanguage('te', '🇮🇳 TE')">🇮🇳 తెలుగు</div>
                    <div class="language-option" onclick="changeLanguage('ml', '🇮🇳 ML')">🇮🇳 മലയാളം</div>
                    <div class="language-option" onclick="changeLanguage('kn', '🇮🇳 KN')">🇮🇳 ಕನ್ನಡ</div>
                    <div class="language-option" onclick="changeLanguage('gu', '🇮🇳 GU')">🇮🇳 ગુજરાતી</div>
                    <div class="language-option" onclick="changeLanguage('pa', '🇮🇳 PA')">🇮🇳 ਪੰਜਾਬੀ</div>
                    <div class="language-option" onclick="changeLanguage('mr', '🇮🇳 MR')">🇮🇳 मराठी</div>
                    <div class="language-option" onclick="changeLanguage('ne', '🇳🇵 NE')">🇳🇵 नेपाली</div>
                    <div class="language-option" onclick="changeLanguage('si', '🇱🇰 SI')">🇱🇰 සිංහල</div>
                </div>
            </div>
            <!-- Hidden Google Translate Element -->
            <div id="google_translate_element" style="display: none;"></div>
        </div>
    `;
    
    // Insert at the beginning of the body
    document.body.insertAdjacentHTML('afterbegin', languageSelectorHTML);
};
