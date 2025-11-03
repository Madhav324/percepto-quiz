# Mirror.html - Complete Functionality Analysis

## FLOW FROM START TO END

### 1. PAGE LOAD
✓ Firebase initialized
✓ Face-api.js loaded
✓ Auth state observer set up
✓ Camera request starts

### 2. CAMERA INITIALIZATION
✓ getUserMedia() requests camera
✓ Video element gets stream
✓ Mirror effect applied (scaleX: -1)
✓ Canvas overlay created for tracking visuals

### 3. EYE TRACKING INITIALIZATION
✓ Face detection models loaded from CDN
✓ Detection loop starts at 20 FPS (50ms intervals)
✓ Variables initialized:
  - eyeballMovementCount = 0
  - eyeFixationDuration = 0
  - followingScore = 0
  - eyeballVectorHistory = []
  - eyeballNoiseThreshold = 1.0

### 4. USER STARTS ASSESSMENT
**When "Start" button clicked:**
✓ startTime = Date.now()
✓ pausedTime = 0
✓ finalValues reset to 0
✓ Light stimulus animation starts
✓ isRunning = true
✓ Button states update
✓ Display shows blue (live) values

### 5. DETECTION LOOP (Every 50ms)
**Each frame:**

A. Face Detection
   ✓ Detect face with landmarks
   ✓ Get left and right eye landmarks
   ✓ Calculate eye centers
   ✓ Calculate iris positions

B. Eye Status Check
   ✓ Calculate leftMagnitude and rightMagnitude
   ✓ eyesOpen = (leftIris && rightIris && leftMagnitude > 0.5 && rightMagnitude > 0.5)
   
C. Vector Processing
   **If eyesOpen = true:**
   ✓ Add raw vector to history
   ✓ Apply smoothing
   ✓ Calculate avgEyeballVector from history
   
   **If eyesOpen = false:**
   ✓ Clear eyeballVectorHistory = []
   ✓ Set avgEyeballVector = {0, 0}
   ✓ This prevents stale data issue

D. Movement Calculation
   ✓ eyeballMovement = eyesOpen ? sqrt(...) : 0
   ✓ Only calculates if eyes trackable

E. Light Following Detection
   ✓ Get light position
   ✓ Calculate eye-to-light vector
   ✓ Dot product for alignment
   ✓ Update followingHistory sliding window
   ✓ Calculate weighted followingScore
   ✓ isFollowingLight = eyesOpen && followingScore > 0.7

F. Movement Classification (ONLY if eyesOpen)
   **If !eyesOpen:**
   - Reset eyeFixationCount = 0
   - Skip all tracking
   
   **Else if eyeballMovement > threshold * 1.5:**
   - Increment eyeballMovementCount
   - Reset eyeFixationCount = 0
   
   **Else if faceMovement >= threshold:**
   - Increment eyeMovementCount
   - Reset eyeFixationCount = 0
   
   **Else:**
   - Increment eyeFixationCount
   - If eyeFixationCount >= 5:
     * eyeFixationDuration += 1/frameRate
     * Cap at 300s

G. Update Last Positions
   **If eyesOpen:**
   ✓ lastEyeballVector = avgEyeballVector
   
   **If !eyesOpen:**
   ✓ lastEyeballVector = {0, 0}
   ✓ Prevents stale comparisons

H. Update Display
   ✓ Show current metrics
   ✓ Blue color (live)

### 6. USER STOPS ASSESSMENT
**When "Stop" button clicked:**
✓ stopAnimation()
✓ isRunning = false
✓ assessmentDuration calculated (excluding paused time)

**CAPTURE FINAL VALUES:**
✓ finalFixationDuration = eyeFixationDuration
✓ finalFollowingScore = followingScore
✓ finalPursuitQuality calculated from followingScore

✓ updateAssessmentDisplays(true)
✓ Display turns GREEN (final)

### 7. USER SAVES ASSESSMENT
**When "Save" button clicked:**

A. Validation
   ✓ Check user logged in
   ✓ Check assessment was run

B. Auto-stop if still running
   ✓ If isRunning, call stopAssessment()

C. Use Final Values
   ✓ savedFixationDuration = Math.round(finalFixationDuration)
   ✓ Convert finalFollowingScore to pursuitCount (0-5)

D. Build Data Object
   ✓ All values from final captured state
   ✓ Includes: fixation, pursuit, following score, movement counts

E. Determine Firebase Path
   ✓ Check for doctor/patient context
   ✓ Save to appropriate path

F. Save and Reset
   ✓ database.ref(path).set(assessmentData)
   ✓ Clear notes
   ✓ Reset variables

---

## CRITICAL GUARANTEES

### Eyes Closed Handling
✅ eyeballVectorHistory cleared immediately
✅ avgEyeballVector set to {0, 0}
✅ eyeballMovement = 0
✅ isFollowingLight = false (requires eyesOpen)
✅ All tracking logic skipped
✅ Fixation stops accumulating
✅ lastEyeballVector reset to {0, 0}

**Result: NO stale data, NO false tracking**

### Final Value Capture
✅ Captured on stop, not on save
✅ Represents ENTIRE assessment period
✅ Never changes after stop
✅ Display shows green to indicate final

### Data Integrity
✅ All saved values from final captured state
✅ No live values used during save
✅ Pursuit count derived from following score
✅ Fixation from cumulative tracking

---

## KNOWN ISSUES FIXED

1. ✅ Stale data when eyes closed - FIXED (clear history)
2. ✅ Following light when eyes closed - FIXED (eyesOpen check)
3. ✅ Fixation accumulating when eyes closed - FIXED (skip tracking)
4. ✅ Infinity values - FIXED (frameRate check, safety cap)
5. ✅ Display updating after stop - FIXED (isFinal parameter)
6. ✅ Manual override fields - REMOVED (irrelevant)

---

## POTENTIAL REMAINING ISSUES TO CHECK

### 1. Assessment Duration Calculation
- Uses: (Date.now() - startTime - pausedTime) / 1000
- Issue: If called in updateAssessmentDisplays during running, assessmentDuration might be 0
- **CHECK:** Line 1821 uses assessmentDuration > 3 but might not be calculated yet during live updates

### 2. First Tap Time
- Tracked but where is it triggered?
- Event listeners on pattern/speed/frameStyle
- **VERIFY:** Is firstTapTime working correctly?

### 3. Gaze Movement Count
- Uses threshold * 1.5
- eyeballNoiseThreshold starts at 1.0
- Auto-calibrates to max(0.15, maxEyeballMovement * 0.2)
- **CHECK:** Is calibration working as expected?

### 4. Display Element IDs
- autoFollowingValue - **NOT IN HTML** (removed with manual fields)
- autoMovementValue - IS IN HTML
- autoPursuitValue - IS IN HTML
- autoFixationValue - IS IN HTML

### 5. Live Pursuit Quality Display
Line 1821: `if (isFinal || (isRunning && assessmentDuration > 3))`
- During live updates, assessmentDuration not calculated yet
- **ISSUE:** Pursuit quality might always show '--' during running

---

## RECOMMENDATIONS

### Fix 1: Calculate Live Assessment Duration
In updateAssessmentDisplays(), for live updates:
```javascript
const timeElapsed = isRunning ? (Date.now() - startTime - pausedTime) / 1000 : assessmentDuration;
if (isFinal || (isRunning && timeElapsed > 3)) {
    // Calculate pursuit quality
}
```

### Fix 2: Remove autoFollowingDisplay Reference
Line 1810 references autoFollowingDisplay which doesn't exist in HTML anymore.

### Fix 3: Verify All Event Listeners
Check that firstTapTime is properly recorded for all interactions.
