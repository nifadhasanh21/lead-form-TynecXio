// ========== EMAILJS CONFIGURATION (Replace with your own keys) ==========
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";      // e.g., "service_xxx"
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";    // e.g., "template_xxx"
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";      // e.g., "user_xxx"

// Initialize EmailJS
(function initEmailJS() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log("EmailJS initialized");
  } else {
    console.error("EmailJS library failed to load");
  }
})();

// DOM Elements
const form = document.getElementById('leadForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const statusDiv = document.getElementById('formStatus');

// Helper: Show status messages
function showStatus(message, isSuccess = false) {
  statusDiv.textContent = message;
  statusDiv.className = `form-status ${isSuccess ? 'success' : 'error'}`;
  statusDiv.classList.remove('hidden');
  
  // Auto hide after 5 seconds for success messages
  if (isSuccess) {
    setTimeout(() => {
      statusDiv.classList.add('hidden');
    }, 6000);
  } else {
    setTimeout(() => {
      if (statusDiv.classList.contains('error')) {
        statusDiv.classList.add('hidden');
      }
    }, 5000);
  }
}

// Clear previous field errors
function clearFieldErrors() {
  document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
}

// Show specific field error
function showFieldError(fieldId, message) {
  const errorElement = document.querySelector(`.error-msg[data-for="${fieldId}"]`);
  if (errorElement) errorElement.textContent = message;
}

// Validate form on client side
function validateForm(formData) {
  let isValid = true;
  clearFieldErrors();
  
  const fullname = formData.get('fullname')?.trim();
  if (!fullname || fullname.length < 2) {
    showFieldError('fullname', 'Please enter your full name (at least 2 characters)');
    isValid = false;
  }
  
  const email = formData.get('email')?.trim();
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    showFieldError('email', 'Please enter a valid email address (e.g., name@domain.com)');
    isValid = false;
  }
  
  const phone = formData.get('phone')?.trim();
  if (!phone || phone.length < 8) {
    showFieldError('phone', 'Please enter a valid phone number (min 8 digits)');
    isValid = false;
  }
  
  const profession = formData.get('profession')?.trim();
  if (!profession || profession.length < 2) {
    showFieldError('profession', 'Please let us know your profession / current role');
    isValid = false;
  }
  
  const websiteType = formData.get('websiteType');
  if (!websiteType || websiteType === "") {
    showFieldError('websiteType', 'Please select the type of website you need');
    isValid = false;
  }
  
  return isValid;
}

// Set loading state
function setLoading(isLoading) {
  if (isLoading) {
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
  } else {
    submitBtn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  }
}

// Handle form submission
async function handleSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(form);
  
  // validation
  if (!validateForm(formData)) {
    showStatus('Please fill all required fields correctly.', false);
    return;
  }
  
  // Prepare EmailJS template parameters
  const templateParams = {
    full_name: formData.get('fullname'),
    email_address: formData.get('email'),
    phone_number: formData.get('phone'),
    user_profession: formData.get('profession'),
    website_type: formData.get('websiteType'),
    user_message: formData.get('message') || '(No additional message provided)',
    // Add a timestamp for better tracking
    submission_date: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })
  };
  
  setLoading(true);
  
  try {
    // Check if emailjs is available
    if (typeof emailjs === 'undefined') {
      throw new Error('EmailJS service not loaded. Please check your internet connection.');
    }
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    
    console.log('EmailJS success:', response);
    
    // Success flow
    showStatus('✓ Thank you! Your request has been submitted. We will contact you soon.', true);
    form.reset();          // Clear all fields
    clearFieldErrors();    // remove old errors
    statusDiv.classList.remove('hidden');
    
    // Optional: reset select placeholder state
    const websiteSelect = document.getElementById('websiteType');
    if (websiteSelect) websiteSelect.value = "";
    
  } catch (error) {
    console.error('EmailJS error:', error);
    let errorMsg = '⚠️ Submission failed. Please check your EmailJS credentials or try again.';
    if (error.text) errorMsg = `⚠️ ${error.text}`;
    showStatus(errorMsg, false);
  } finally {
    setLoading(false);
  }
}

// Attach event listener
if (form) {
  form.addEventListener('submit', handleSubmit);
}

// Additional: remove inline error when typing on fields
document.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input', function() {
    const errorDiv = this.closest('.input-group')?.querySelector('.error-msg');
    if (errorDiv) errorDiv.textContent = '';
  });
  field.addEventListener('change', function() {
    const errorDiv = this.closest('.input-group')?.querySelector('.error-msg');
    if (errorDiv) errorDiv.textContent = '';
  });
});
