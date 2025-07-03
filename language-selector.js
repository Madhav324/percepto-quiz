/**
 * Language Selector with Google Translate Integration
 * Reusable component for adding multi-language support
 */

// Language selector functions
window.toggleLanguageDropdown = () => {
    const dropdown = document.getElementById('languageDropdown');
    dropdown.classList.toggle('show');
};

window.changeLanguage = (langCode, displayText) => {
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
        // Translate to selected language
        setTimeout(() => {
            const selectElement = document.querySelector('.goog-te-combo');
            if (selectElement) {
                selectElement.value = langCode;
                selectElement.dispatchEvent(new Event('change'));
            }
        }, 500);
    }
};

// Initialize Google Translate
window.googleTranslateElementInit = () => {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,es,fr,de,it,pt,ru,ja,ko,zh,hi,ar,bn,ur,ta,te,ml,kn,gu,pa,mr,ne,si',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
};

// Load saved language preference
window.addEventListener('load', () => {
    const savedLang = localStorage.getItem('selectedLanguage');
    const savedDisplay = localStorage.getItem('selectedLanguageDisplay');
    
    if (savedLang && savedDisplay && savedLang !== 'en') {
        const currentLangElement = document.getElementById('currentLanguage');
        if (currentLangElement) {
            currentLangElement.textContent = savedDisplay;
        }
        // Apply translation after a short delay
        setTimeout(() => {
            const selectElement = document.querySelector('.goog-te-combo');
            if (selectElement) {
                selectElement.value = savedLang;
                selectElement.dispatchEvent(new Event('change'));
            }
        }, 1000);
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
