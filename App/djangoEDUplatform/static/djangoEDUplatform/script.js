// Global variables
let currentUser = null;
let courses = [];
let teachers = [];
let enrollments = [];


// Student Dashboard Functions
function initializeStudentDashboard() {
    // If coursesData is available from the server, use it
    if (typeof coursesData !== 'undefined') {
        courses = coursesData;
    } else {
        // Fallback to sample data if server data is not available
        initializeData();
    }
    
    // Set user data
    if (typeof userPlan !== 'undefined') {
        if (!currentUser) {
            currentUser = {
                type: 'student',
                name: document.getElementById('studentName').textContent.replace('Welcome, ', '').replace('!', ''),
                plan: userPlan
            };
        } else {
            currentUser.plan = userPlan;
        }
    } else if (!currentUser) {
        // Fallback if no server data
        currentUser = {
            type: 'student',
            name: 'Demo Student',
            email: 'student@example.com',
            plan: 'free'
        };
    }
    
    updateStudentUI();
    loadCourses();
    setupFilters();
}

function updateStudentUI() {
    if (!currentUser) return;

    document.getElementById('studentName').textContent = `Welcome, ${currentUser.name}!`;
    document.getElementById('currentPlan').textContent = `${currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1)} Plan`;
    document.getElementById('planType').textContent = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1);
    
    const accessLevels = {
        free: 'Basic',
        standard: 'Standard',
        premium: 'Premium'
    };
    document.getElementById('accessLevel').textContent = accessLevels[currentUser.plan];
}

function loadCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    if (!coursesGrid) return;

    coursesGrid.innerHTML = '';

    courses.forEach(course => {
        const canAccess = canAccessCourse(course.requiredPlan, currentUser.plan);
        const courseCard = createCourseCard(course, canAccess);
        coursesGrid.appendChild(courseCard);
    });
}

function canAccessCourse(requiredPlan, userPlan) {
    const planLevels = { free: 0, standard: 1, premium: 2 };
    return planLevels[userPlan] >= planLevels[requiredPlan];
}

function createCourseCard(course, canAccess) {
    const card = document.createElement('div');
    card.className = `course-card ${!canAccess ? 'locked' : ''}`;
    
    card.innerHTML = `
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <div class="course-meta">
            <span class="course-level ${course.requiredPlan}">${course.requiredPlan}</span>
            <span>${course.contentType.toUpperCase()}</span>
        </div>
        ${!canAccess ? '<p style="color: #ef4444; font-weight: 600; margin-top: 10px;">Upgrade required</p>' : ''}
    `;

    if (canAccess) {
        card.addEventListener('click', () => openCourse(course));
    }

    return card;
}

function openCourse(course) {
    if (course.contentType === 'pdf') {
        openPdfModal(course.contentUrl);
    } else if (course.contentType === 'video') {
        // For video URLs stored in text files, we need to fetch the content
        if (course.contentUrl.endsWith('.txt')) {
            fetch(course.contentUrl)
                .then(response => response.text())
                .then(videoUrl => {
                    openVideoModal(videoUrl.trim());
                })
                .catch(error => {
                    console.error('Error fetching video URL:', error);
                    alert('Error loading video. Please try again later.');
                });
        } else {
            openVideoModal(course.contentUrl);
        }
    }
}

function openPdfModal(pdfUrl) {
    const modal = document.getElementById('pdfModal');
    const viewer = document.getElementById('pdfViewer');
    viewer.src = pdfUrl;
    modal.style.display = 'block';
}

function closePdfModal() {
    const modal = document.getElementById('pdfModal');
    const viewer = document.getElementById('pdfViewer');
    viewer.src = '';
    modal.style.display = 'none';
}

function openVideoModal(videoUrl) {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');
    player.src = videoUrl;
    modal.style.display = 'block';
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');
    player.pause();
    player.src = '';
    modal.style.display = 'none';
}

function setupFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const levelFilter = document.getElementById('levelFilter');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterCourses);
    }
    if (levelFilter) {
        levelFilter.addEventListener('change', filterCourses);
    }
}

function filterCourses() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;

    let filteredCourses = courses;

    if (categoryFilter !== 'all') {
        filteredCourses = filteredCourses.filter(course => course.category === categoryFilter);
    }

    if (levelFilter !== 'all') {
        filteredCourses = filteredCourses.filter(course => course.requiredPlan === levelFilter);
    }

    const coursesGrid = document.getElementById('coursesGrid');
    coursesGrid.innerHTML = '';

    filteredCourses.forEach(course => {
        const canAccess = canAccessCourse(course.requiredPlan, currentUser.plan);
        const courseCard = createCourseCard(course, canAccess);
        coursesGrid.appendChild(courseCard);
    });
}

// Teacher Dashboard Functions
function initializeTeacherDashboard() {
    initializeData();
    
    // Set default teacher if none exists
    if (!currentUser) {
        currentUser = {
            type: 'teacher',
            name: 'Demo Teacher',
            email: 'teacher@example.com',
            id: 1
        };
        saveData();
    }

    updateTeacherUI();
    loadTeacherCourses();
    setupCourseUpload();
}

function updateTeacherUI() {
    if (!currentUser) return;

    const teacher = teachers.find(t => t.id === currentUser.id) || teachers[0];
    
    document.getElementById('teacherName').textContent = `Welcome, ${teacher.name}!`;
    document.getElementById('totalEarnings').textContent = teacher.totalEarnings.toFixed(2);
    document.getElementById('totalStudents').textContent = calculateTotalStudents(teacher.id);
    document.getElementById('totalCourses').textContent = teacher.courses.length;
    
    // Update earnings tab
    const monthlyEarnings = teacher.totalEarnings * 0.3; // Simulate monthly earnings
    document.getElementById('monthlyEarnings').textContent = monthlyEarnings.toFixed(2);
    document.getElementById('earningsStudentCount').textContent = calculateTotalStudents(teacher.id);
}

function calculateTotalStudents(teacherId) {
    const teacherCourses = courses.filter(course => course.teacherId === teacherId);
    return teacherCourses.reduce((total, course) => total + course.enrolledStudents, 0);
}

function loadTeacherCourses() {
    const teacherCoursesContainer = document.getElementById('teacherCourses');
    if (!teacherCoursesContainer) return;

    const teacher = teachers.find(t => t.id === currentUser.id) || teachers[0];
    const teacherCourses = courses.filter(course => course.teacherId === teacher.id);

    teacherCoursesContainer.innerHTML = '';

    teacherCourses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-item';
        courseElement.innerHTML = `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <div>
                        <span class="course-level ${course.requiredPlan}">${course.requiredPlan}</span>
                        <span style="margin-left: 10px;">${course.enrolledStudents} students</span>
                    </div>
                    <div>
                        <span style="font-weight: 600;">Earnings: $${(course.enrolledStudents * getPlanPrice(course.requiredPlan) * 0.01).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
        teacherCoursesContainer.appendChild(courseElement);
    });
}

function getPlanPrice(plan) {
    const prices = { free: 0, standard: 29, premium: 59 };
    return prices[plan] || 0;
}

function setupCourseUpload() {
    const uploadForm = document.getElementById('courseUploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleCourseUpload);
    }
}

function handleCourseUpload(e) {
    e.preventDefault();
    
    const title = document.getElementById('courseTitle').value;
    const description = document.getElementById('courseDescription').value;
    const category = document.getElementById('courseCategory').value;
    const requiredPlan = document.getElementById('requiredPlan').value;
    const contentType = document.getElementById('contentType').value;
    
    // Validate form fields
    if (!title || !description || !category || !requiredPlan || !contentType) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Additional validation for content files
    if (contentType === 'pdf') {
        const pdfFile = document.getElementById('pdfFile').files[0];
        if (!pdfFile) {
            alert('Please upload a PDF file');
            return;
        }
    } else if (contentType === 'video') {
        const videoUrl = document.getElementById('videoUrl').value;
        if (!videoUrl) {
            alert('Please provide a video URL');
            return;
        }
    }
    
    // Get the form that contains the submit button
    const form = e.target;
    if (form) {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Uploading...';
            submitButton.disabled = true;
        }
        
        // Submit the form to process the upload
        form.submit();
    }
}

function toggleContentInput() {
    const contentType = document.getElementById('contentType').value;
    const pdfUpload = document.getElementById('pdfUpload');
    const videoLink = document.getElementById('videoLink');
    
    if (contentType === 'pdf') {
        pdfUpload.style.display = 'block';
        videoLink.style.display = 'none';
    } else if (contentType === 'video') {
        pdfUpload.style.display = 'none';
        videoLink.style.display = 'block';
    } else {
        pdfUpload.style.display = 'none';
        videoLink.style.display = 'none';
    }
}

// Initialize the form when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const contentTypeSelect = document.getElementById('contentType');
    if (contentTypeSelect) {
        toggleContentInput();
    }
    
    // Display success or error messages if they exist
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success) {
        alert(success);
    }
    
    if (error) {
        alert(error);
    }
}); // Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));

    // Show selected tab content
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    // Use querySelector instead of event.target since this might be called programmatically
    const activeButton = document.querySelector(`.tab-button[onclick="showTab('${tabName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Add this function to handle the "Upload Course" quick action button
function showUploadForm() {
    // Show the upload tab
    showTab('upload');
    
    // Find all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Remove active class from all buttons
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Add active class to the upload tab button
    const uploadTabButton = document.querySelector('.tab-button[onclick="showTab(\'upload\')"]');
    if (uploadTabButton) {
        uploadTabButton.classList.add('active');
    }
}

// Function to show earnings details
function showEarningsDetails() {
    showTab('earnings');
    
    // Find all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Remove active class from all buttons
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Add active class to the earnings tab button
    const earningsTabButton = document.querySelector('.tab-button[onclick="showTab(\'earnings\')"]');
    if (earningsTabButton) {
        earningsTabButton.classList.add('active');
    }
}

// Payment Page Functions
function initializePaymentPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPlan = urlParams.get('plan');
    
    if (selectedPlan) {
        selectPlan(selectedPlan);
    }

    setupPlanSelection();
}

function setupPlanSelection() {
    const planOptions = document.querySelectorAll('input[name="plan"]');
    planOptions.forEach(option => {
        option.addEventListener('change', function() {
            selectPlan(this.value);
        });
    });
}

function selectPlan(planType) {
    const planRadio = document.getElementById(planType);
    if (planRadio) {
        planRadio.checked = true;
    }

    const planNames = {
        free: 'Free Plan',
        standard: 'Standard Plan',
        premium: 'Premium Plan'
    };

    const planPrices = {
        free: 0,
        standard: 29,
        premium: 59
    };

    document.getElementById('selectedPlanName').textContent = planNames[planType];
    document.getElementById('selectedPlanPrice').textContent = `$${planPrices[planType]}.00`;
    document.getElementById('totalAmount').textContent = `$${planPrices[planType]}.00`;

    // Show/hide payment details based on plan
    const cardSection = document.getElementById('cardSection');
    const paymentButton = document.getElementById('paymentButton');
    
    if (planType === 'free') {
        cardSection.style.display = 'none';
        paymentButton.textContent = 'Continue to your free account';
    } else {
        cardSection.style.display = 'block';
        paymentButton.textContent = 'Complete Payment';
    }
}



function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

function handlePayment(e) {
    e.preventDefault();
    
    const selectedPlan = document.querySelector('input[name="plan"]:checked');
    if (!selectedPlan) {
        alert("Please select a payment plan.");
        return false;
    }
    
    // Get the form that contains the payment button
    const form = e.target.closest('form');
    if (form) {
        // Show loading state
        const paymentButton = document.getElementById('paymentButton');
        if (paymentButton) {
            paymentButton.textContent = 'Processing...';
            paymentButton.disabled = true;
        }
        
        // Submit the form to process the payment
        form.submit();
    }
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';
}


function closeCourseModal() {
    const modal = document.getElementById('courseModal');
    modal.style.display = 'none';
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});



    
    

function updatePasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthBar = document.getElementById('passwordStrength');
    const feedback = document.getElementById('passwordFeedback');
    
    // Calculate strength
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    else if (password.length >= 6) strength += 10;
    
    // Complexity checks
    if (password.match(/[a-z]+/)) strength += 15;
    if (password.match(/[A-Z]+/)) strength += 20;
    if (password.match(/[0-9]+/)) strength += 20;
    if (password.match(/[^a-zA-Z0-9]+/)) strength += 20;
    
    // Update UI
    strengthBar.style.width = `${strength}%`;
    
    if (strength < 30) {
        strengthBar.style.background = '#ef4444'; // Red
        feedback.textContent = 'Weak password';
        feedback.style.color = '#ef4444';
    } else if (strength < 60) {
        strengthBar.style.background = '#f59e0b'; // Amber
        feedback.textContent = 'Moderate password';
        feedback.style.color = '#f59e0b';
    } else {
        strengthBar.style.background = '#10b981'; // Green
        feedback.textContent = 'Strong password';
        feedback.style.color = '#10b981';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        // If the form already has the Esewa hidden fields, don't add event listener
        // that would prevent form submission
        if (!paymentForm.querySelector('input[name="signature"]')) {
            paymentForm.addEventListener('submit', function(e) {
                const selectedPlan = document.querySelector('input[name="plan_id"]:checked');
                if (!selectedPlan) {
                    alert("Please select a payment plan.");
                    e.preventDefault();
                }
            });
        }
    }
});
