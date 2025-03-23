// Firebase Authentication Helper
const auth = firebase.auth();
const database = firebase.database();

// Check authentication state
function checkAuth() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    // Get user profile
                    const profileRef = database.ref(`userProfiles/${user.uid}`);
                    const profileSnap = await profileRef.once('value');
                    const userProfile = profileSnap.val();

                    // Check if user is a doctor
                    const doctorRef = database.ref(`doctorProfiles/${user.uid}`);
                    const doctorSnap = await doctorRef.once('value');
                    const isDoctor = doctorSnap.exists();

                    // Check if this is a patient session
                    const currentPatientId = localStorage.getItem('currentPatientId');
                    const isPatientQuiz = localStorage.getItem('isPatientQuiz') === 'true';

                    resolve({
                        user,
                        profile: userProfile,
                        isDoctor,
                        currentPatientId,
                        isPatientQuiz
                    });
                } catch (error) {
                    console.error('Error checking auth:', error);
                    reject(error);
                }
            } else {
                // Not logged in, redirect to login
                window.location.href = 'login.html';
            }
        });
    });
}

// Error display
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// Loading indicator
function showLoading(show, message = 'Loading...') {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.textContent = message;
        loadingDiv.style.display = show ? 'block' : 'none';
    }
}

// Common logout function
async function logout() {
    const isPatientQuiz = localStorage.getItem('isPatientQuiz') === 'true';
    
    // Clear all session data
    localStorage.removeItem('currentPatientId');
    localStorage.removeItem('isPatientQuiz');
    localStorage.removeItem('isPatientProfile');
    
    if (isPatientQuiz) {
        window.location.href = 'patients.html';
    } else {
        try {
            await auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            showError('Failed to logout. Please try again.');
        }
    }
}
