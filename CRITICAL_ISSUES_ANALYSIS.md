# CRITICAL ISSUES - Honest Analysis

## THE FUNDAMENTAL PROBLEM

**This tool claims to do medical-grade CVI assessment using consumer-grade face detection.**

That's like trying to perform surgery with kitchen knives. It might work sometimes, but it's not precise, accurate, or reliable enough for clinical use.

---

## CRITICAL ISSUES

### 1. **FACE-API.JS IS NOT A GAZE TRACKER**

**What it's designed for:**
- Face detection
- Facial landmark detection
- Face recognition
- Emotion detection

**What it's NOT designed for:**
- Precise gaze tracking
- Eye movement analysis
- Medical assessments

**The Problem:**
```javascript
const eyesOpen = leftMagnitude > 0.5 && rightMagnitude > 0.5;
```
**Where did 0.5 come from?** 
- Random guess
- No scientific basis
- No calibration
- No validation

**Reality**: The "iris position" from face-api.js is an **ESTIMATE**, not actual pupil tracking.

---

### 2. **NO ACTUAL MIRROR FIXATION DETECTION**

**What we claim:** "Time looking at reflection"

**What we actually measure:** "Time with stable gaze... somewhere"

**The problem:**
- We don't know if they're looking at the camera
- We don't know if they're looking at themselves
- We don't know if they're looking at the background
- We don't know if they're looking at ANYTHING

**Current logic:**
```javascript
if (stable gaze) {
    fixationDuration += increment;
}
```

**This just means:** "Not moving eyes much"

**It does NOT mean:** "Looking at their reflection"

---

### 3. **MOVEMENT DETECTION IS ARBITRARY**

**Current thresholds:**
```javascript
eyeballNoiseThreshold = 1.0;  // Why 1.0? Random.
if (eyeballMovement > threshold * 1.5) // Why 1.5x? Random.
```

**Auto-calibration:**
```javascript
eyeballNoiseThreshold = Math.max(0.15, maxEyeballMovement * 0.2);
```
**Why 0.2 (20%)?** Random. No clinical basis.

**The problem:**
- Different lighting = different magnitudes
- Different distances = different magnitudes
- Different face sizes = different magnitudes
- Different cameras = different magnitudes

**Result**: Same person, different conditions = completely different counts

---

### 4. **FOLLOWING LIGHT DETECTION IS FLAWED**

**Current approach:**
```javascript
// Calculate dot product between eye vector and light vector
const dotProduct = ...
followingDetected = dotProduct > 0.65;
```

**Problems:**

A. **Reaction Time Not Considered**
- Light moves → Person reacts → 200-500ms delay
- We're checking alignment in the SAME frame
- False negatives for normal reaction times

B. **No Distance Consideration**
- Light far away = small eye movement
- Light close = large eye movement
- Same following behavior, different vectors

C. **Head Movement vs Eye Movement**
- Person might follow with head, not eyes
- We're measuring eye vectors relative to face
- Can't distinguish head tracking from gaze tracking

D. **Peripheral Vision**
- Person can track without direct gaze
- Peripheral awareness doesn't show in vector alignment
- False negatives for legitimate tracking

---

### 5. **NO VALIDATION OR GROUND TRUTH**

**Questions we can't answer:**
- Is our fixation duration accurate? (No reference)
- Is our movement count correct? (No reference)
- Is our following detection valid? (No reference)
- Do our metrics correlate with actual CVI indicators? (Unknown)

**We're measuring things, but we don't know if the measurements mean anything.**

---

### 6. **CLINICAL MEANINGLESSNESS**

**What CVI clinicians actually need:**

A. **Fixation**: Does the child recognize themselves?
- We can't detect this

B. **Visual Attention**: Do they sustain attention on faces?
- We can't detect this

C. **Pursuit Quality**: Smooth pursuit vs saccadic pursuit
- We can't distinguish this

D. **Field Preferences**: Do they prefer certain visual fields?
- We don't measure this

**What we're giving them:**
- "Cumulative fixation: 12.3s" - But fixating on WHAT?
- "Gaze movements: 45" - So what? Is that good or bad?
- "Pursuit quality: Good" - Based on what standard?

---

## WHY THIS HAPPENS IN PRACTICE

### **Scenario 1: False Positives**
1. Child looks away from screen
2. Stares at wall behind camera
3. Very stable gaze
4. System thinks: "Great fixation on mirror!"
5. **Wrong**

### **Scenario 2: False Negatives**
1. Child actively tracking light
2. Making small, precise eye movements
3. Below arbitrary threshold
4. System thinks: "No movement detected"
5. **Wrong**

### **Scenario 3: Environmental Dependence**
1. Good lighting: Clean detection, vectors work
2. Poor lighting: Noisy detection, vectors erratic
3. Same child, same behavior
4. Completely different metrics
5. **Unreliable**

### **Scenario 4: Distance Variance**
1. Child close to camera: Large vector magnitudes
2. Child far from camera: Small vector magnitudes
3. Same amount of eye movement
4. Different counts because thresholds are pixel-based
5. **Not normalized**

---

## WHAT WOULD ACTUALLY WORK

### **Option 1: Dedicated Eye Tracker (Hardware)**
- Tobii, SR Research, Pupil Labs
- Infrared cameras
- Corneal reflection tracking
- 60-1200 Hz sampling
- Sub-degree accuracy
- **Cost**: $1000-30,000

### **Option 2: WebGazer.js (Software)**
- Specifically designed for gaze tracking
- Calibration process
- Regression models
- Self-learning
- Screen coordinate prediction
- **Cost**: Free, but requires calibration

### **Option 3: Simplified Observation Tool**
- **Remove** automated gaze tracking
- **Keep** video recording with mirror
- **Add** clinician observation checklist
- **Focus** on qualitative observations
- **Honest** about what we can/can't measure

---

## REALISTIC IMPROVEMENTS

### **If we keep face-api.js approach:**

1. **Add Calibration Phase**
```javascript
// Ask user to look at 5 points
// Measure baseline magnitudes
// Normalize all measurements to baseline
```

2. **Add Confidence Scores**
```javascript
fixationDuration: 12.3s (confidence: 65%)
// Be honest about uncertainty
```

3. **Distance Normalization**
```javascript
// Measure face bounding box size
// Normalize all measurements by face size
// Makes it scale-independent
```

4. **Reaction Time Window**
```javascript
// For following detection
// Check alignment with 300ms lag
// Account for human reaction time
```

5. **Clear Limitations**
```
⚠️ This tool provides approximate metrics
⚠️ Not validated for clinical diagnosis
⚠️ For screening and monitoring only
⚠️ Results vary with lighting and distance
```

---

## HONEST RECOMMENDATIONS

### **Short Term (Keep Current Approach):**

1. **Add calibration** - Let users calibrate for their setup
2. **Add confidence metrics** - Show uncertainty
3. **Normalize by face size** - Make distance-independent
4. **Document limitations** - Be transparent
5. **Rename metrics** - "Estimated fixation" not "Fixation"

### **Medium Term (Improve Accuracy):**

1. **Integrate WebGazer.js** - Better gaze tracking
2. **Add calibration points** - User looks at dots
3. **Region of interest** - Detect if looking at mirror area
4. **Validation study** - Compare to manual observation

### **Long Term (Clinical Grade):**

1. **Hardware integration** - Support eye trackers
2. **Clinical validation** - Studies with CVI patients
3. **Standardization** - Protocols, norms, references
4. **FDA/medical approval** - Regulatory pathway

---

## THE BRUTAL TRUTH

**Current state:**
- We're measuring things
- We don't know if measurements are accurate
- We don't know if they're meaningful
- We're pretending they're clinical metrics

**What we should do:**
- Be honest about limitations
- Add "EXPERIMENTAL" label
- Focus on relative tracking (progress over time)
- Not absolute clinical assessment

**Bottom line:**
This tool is useful for:
✓ Tracking progress over time (relative changes)
✓ Engaging children with mirror activities
✓ Recording sessions for clinician review
✓ Rough screening indicators

This tool is NOT useful for:
✗ Diagnostic assessment
✗ Clinical decision-making
✗ Absolute measurement of visual function
✗ Comparing across different setups

**We need to be honest about that.**
