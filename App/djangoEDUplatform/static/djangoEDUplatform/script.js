// Global variables
let currentUser = null;
let courses = [];
let teachers = [];
let enrollments = [];

// Initialize data
function initializeData() {
    // Sample courses data
    courses = [
        {
            id: 1,
            title: "JavaScript Fundamentals",
            description: "Learn the basics of JavaScript programming",
            category: "programming",
            requiredPlan: "free",
            contentType: "video",
            contentUrl: "https://example.com/js-basics.mp4",
            teacherId: 1,
            enrolledStudents: 150
        },
        {
            id: 2,
            title: "Advanced React Development",
            description: "Master React with hooks, context, and advanced patterns",
            category: "programming",
            requiredPlan: "standard",
            contentType: "pdf",
            contentUrl: "/placeholder.pdf",
            teacherId: 1,
            enrolledStudents: 89
        },
        {
            id: 3,
            title: "UI/UX Design Principles",
            description: "Learn modern design principles and user experience",
            category: "design",
            requiredPlan: "premium",
            contentType: "video",
            contentUrl: "https://example.com/design-course.mp4",
            teacherId: 2,
            enrolledStudents: 67
        },
        {
            id: 4,
            title: "Digital Marketing Strategy",
            description: "Complete guide to digital marketing and social media",
            category: "marketing",
            requiredPlan: "standard",
            contentType: "pdf",
            contentUrl: "/placeholder.pdf",
            teacherId: 2,
            enrolledStudents: 123
        }
    ];

    // Sample teachers data
    teachers = [
        {
            id: 1,
            name: "John Smith",
            email: "john@example.com",
            totalEarnings: 435.50,
            courses: [1, 2]
        },
        {
            id: 2,
            name: "Sarah Johnson",
            email: "sarah@example.com",
            totalEarnings: 285.75,
            courses: [3, 4]
        }
    ];

    // Load from localStorage if available
    const savedCourses = localStorage.getItem('eduplatform_courses');
    const savedTeachers = localStorage.getItem('eduplatform_teachers');
    const savedUser = localStorage.getItem('eduplatform_user');

    if (savedCourses) courses = JSON.parse(savedCourses);
    if (savedTeachers) teachers = JSON.parse(savedTeachers);
    if (savedUser) currentUser = JSON.parse(savedUser);
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('eduplatform_courses', JSON.stringify(courses));
    localStorage.setItem('eduplatform_teachers', JSON.stringify(teachers));
    if (currentUser) {
        localStorage.setItem('eduplatform_user', JSON.stringify(currentUser));
    }
}

// Student Dashboard Functions
function initializeStudentDashboard() {
    initializeData();
    
    // Set default user if none exists
    if (!currentUser) {
        currentUser = {
            type: 'student',
            name: 'Demo Student',
            email: 'student@example.com',
            plan: 'free'
        };
        saveData();
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
        openVideoModal(course.contentUrl);
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
    
    let contentUrl = '';
    if (contentType === 'pdf') {
        const pdfFile = document.getElementById('pdfFile').files[0];
        if (pdfFile) {
            contentUrl = URL.createObjectURL(pdfFile);
        }
    } else if (contentType === 'video') {
        contentUrl = document.getElementById('videoUrl').value;
    }

    const newCourse = {
        id: courses.length + 1,
        title,
        description,
        category,
        requiredPlan,
        contentType,
        contentUrl,
        teacherId: currentUser.id,
        enrolledStudents: 0
    };

    courses.push(newCourse);
    
    // Update teacher's courses
    const teacher = teachers.find(t => t.id === currentUser.id);
    if (teacher) {
        teacher.courses.push(newCourse.id);
    }

    saveData();
    loadTeacherCourses();
    updateTeacherUI();
    
    // Reset form
    uploadForm.reset();
    toggleContentInput();
    
    alert('Course uploaded successfully!');
}

function toggleContentInput() {
    const contentType = document.getElementById('contentType').value;
    const pdfUpload = document.getElementById('pdfUpload');
    const videoLink = document.getElementById('videoLink');

    pdfUpload.style.display = contentType === 'pdf' ? 'block' : 'none';
    videoLink.style.display = contentType === 'video' ? 'block' : 'none';
}

// Tab functionality
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
    event.target.classList.add('active');
}

// Payment Page Functions
function initializePaymentPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPlan = urlParams.get('plan');
    
    if (selectedPlan) {
        selectPlan(selectedPlan);
    }

    setupPaymentForm();
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
        paymentButton.textContent = 'Create Free Account';
    } else {
        cardSection.style.display = 'block';
        paymentButton.textContent = 'Complete Payment';
    }
}

function setupPaymentForm() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePayment);
    }

    // Format card number input
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }

    // Format expiry date input
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
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
    
    const selectedPlan = document.querySelector('input[name="plan"]:checked').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;

    // Simulate payment processing
    setTimeout(() => {
        // Create user account
        currentUser = {
            type: 'student',
            name: `${firstName} ${lastName}`,
            email: email,
            plan: selectedPlan
        };

        saveData();
        showSuccessModal();
    }, 2000);

    // Show loading state
    const paymentButton = document.getElementById('paymentButton');
    paymentButton.textContent = 'Processing...';
    paymentButton.disabled = true;
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';
}

// Utility Functions
function logout() {
    localStorage.removeItem('eduplatform_user');
    currentUser = null;
    window.location.href = 'index.html';
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

// Initialize based on current page
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'student.html':
            initializeStudentDashboard();
            break;
        case 'teacher.html':
            initializeTeacherDashboard();
            break;
        case 'payment.html':
            initializePaymentPage();
            break;
        default:
            initializeData();
    }
});





// Login Page Functions
function initializeLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Check if user is already logged in
    const currentUser = JSON.parse(localStorage.getItem('eduplatform_user'));
    if (currentUser) {
        redirectLoggedInUser(currentUser);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorElement = document.getElementById('loginError');
    
    // Reset error message
    errorElement.textContent = '';
    
    // Simple validation
    if (!email || !password) {
        errorElement.textContent = 'Please enter both email and password.';
        return;
    }
    
}

function redirectLoggedInUser(user) {
    if (user.type === 'student') {
        window.location.href = 'student.html';
    } else if (user.type === 'teacher') {
        window.location.href = 'teacher.html';
    } else {
        window.location.href = 'index.html';
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const userType = document.querySelector('input[name="userType"]:checked').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAgree = document.getElementById('termsAgree').checked;
    const errorElement = document.getElementById('signupError');
    
    // Reset error message
    errorElement.textContent = '';
    
    // Validation
    if (!firstName || !lastName || !email || !password) {
        errorElement.textContent = 'Please fill in all required fields.';
        return;
    }
    
    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match.';
        return;
    }
    
    if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters long.';
        return;
    }
    
    if (!termsAgree) {
        errorElement.textContent = 'You must agree to the Terms of Service and Privacy Policy.';
        return;
    }
    
    

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
}



// //mail
// document.getElementById("contact-form").addEventListener('submit',async function (e) {
//     e.preventDefault();

//     const formData=new FormData(this);
//     const data =Object.fromEntries(formData.entries());

//     const res
// })