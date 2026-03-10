function generateList() {
    let width = parseFloat(document.getElementById("width").value);
    let height = parseFloat(document.getElementById("height").value);
    let depth = parseFloat(document.getElementById("depth").value);
    let shelfCount = parseInt(document.getElementById("shelfCount")?.value) || 3;

    if (!width || !height || !depth) {
        alert("Please enter all required dimensions (Width, Height, Depth)");
        return;
    }

    // Convert to millimeters for precision
    let widthMM = width * 10;
    let heightMM = height * 10;
    let depthMM = depth * 10;

    // Calculate material requirements with detailed breakdown
    let sidePanelArea = (heightMM * depthMM) / 1000000; // m²
    let topBottomArea = (widthMM * depthMM) / 1000000; // m²
    let backPanelArea = (widthMM * heightMM) / 1000000; // m²
    let shelfArea = ((widthMM - 40) * (depthMM - 20) * shelfCount) / 1000000; // m²

    let totalArea = (sidePanelArea * 2) + (topBottomArea * 2) + backPanelArea + shelfArea;

    // Hardware calculations
    let hingeCount = 4; // per door
    let drawerRunnerCount = shelfCount * 2; // if drawers
    let shelfSupportCount = shelfCount * 4;

    // Edge banding requirements (perimeter of all panels)
    let totalPerimeter = (2 * (heightMM + depthMM)) + (2 * (widthMM + depthMM)) + (widthMM + heightMM) + (shelfCount * 2 * ((widthMM - 40) + (depthMM - 20)));
    let edgeBandingLength = totalPerimeter / 1000; // meters

    let result = `
╔══════════════════════════════════════════════════════════════╗
║                    MATERIAL REQUIREMENTS                     ║
╠══════════════════════════════════════════════════════════════╣

📏 DIMENSIONS ENTERED:
   • Width: ${width}cm (${widthMM}mm)
   • Height: ${height}cm (${heightMM}mm)
   • Depth: ${depth}cm (${depthMM}mm)
   • Shelves: ${shelfCount}

📐 PANEL CUTTING LIST:
   ┌─────────────────────────────────────────────────────────┐
   │ SIDE PANELS:     2 pieces - ${height}cm × ${depth}cm     │
   │ TOP/BOTTOM:      2 pieces - ${width}cm × ${depth}cm      │
   │ BACK PANEL:      1 piece  - ${width}cm × ${height}cm     │
   │ SHELVES:         ${shelfCount} pieces - ${(width-4).toFixed(1)}cm × ${(depth-2).toFixed(1)}cm │
   └─────────────────────────────────────────────────────────┘

📊 MATERIAL CALCULATIONS:
   • Total Panel Area: ${totalArea.toFixed(2)} m²
   • Side Panels: ${(sidePanelArea * 2).toFixed(3)} m²
   • Top/Bottom: ${(topBottomArea * 2).toFixed(3)} m²
   • Back Panel: ${backPanelArea.toFixed(3)} m²
   • Shelves: ${shelfArea.toFixed(3)} m²

🔧 HARDWARE REQUIREMENTS:
   • Hinges: ${hingeCount} (2 per door × 2 doors)
   • Shelf Supports: ${shelfSupportCount} (4 per shelf × ${shelfCount} shelves)
   • Drawer Runners: ${drawerRunnerCount} (if drawers needed)

🎨 FINISHING MATERIALS:
   • Edge Banding: ${edgeBandingLength.toFixed(1)} meters
   • Wood Filler: ~${(totalArea * 50).toFixed(0)} grams
   • Sandpaper: 120, 180, 240 grit (one sheet each)

⚠️  IMPORTANT NOTES:
   • All measurements include 2cm clearance for shelves
   • Add 1.5cm to all dimensions for trimming
   • Consider door swing clearance (add 5-10cm)
   • Check local building codes for wall mounting
   • Allow 2-3mm tolerance for manufacturing

💡 DESIGN TIPS:
   • Maximum shelf span: ${(width-4).toFixed(1)}cm (consider reinforcement for heavy loads)
   • Door clearance needed: ${depth + 5}cm minimum
   • Standard door width: ${(width/2).toFixed(1)}cm per door
   • Weight capacity: ~30kg per shelf (depending on material)

╚══════════════════════════════════════════════════════════════╝
    `;

    document.getElementById("result").innerText = result;
}

function validateMeasurements() {
    // Get all input fields
    const height = document.getElementById('height')?.value;
    const width = document.getElementById('width')?.value;
    const depth = document.getElementById('depth')?.value;
    const length = document.getElementById('length')?.value;

    // Check if any field is empty
    if ((height !== undefined && !height) ||
        (width !== undefined && !width) ||
        (depth !== undefined && !depth) ||
        (length !== undefined && !length)) {
        alert('Please enter all measurements');
        return false; // prevent form submission
    }

    // Optional: success alert
    alert('Measurements accepted!');
    return false; // keep page from refreshing
}

// Free AI Chat Functionality using Hugging Face
async function sendAIMessage() {
    const input = document.getElementById('ai-input');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to chat
    addMessageToChat(message, 'user');
    input.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
        // Using a simple free conversational AI approach
        // Since Hugging Face free tier has limitations, we'll use fallback responses
        // that are relevant to furniture design

        const furnitureResponses = {
            'hello': 'Hello! I\'m your FurniAI design assistant. I can help you with furniture ideas, measurements, and design tips. What are you working on?',
            'help': 'I can assist with furniture design, material recommendations, measurement calculations, and general advice. Try asking about wardrobes, kitchens, or sofa designs!',
            'wardrobe': 'For wardrobes, consider the room size and storage needs. Standard heights are 180-220cm. Add 60-100cm width per person. Depth should be 50-65cm for comfortable access.',
            'kitchen': 'Kitchen cabinets typically need 60-90cm height for base units and 30-40cm for wall units. Consider workflow - fridge, sink, and stove should form a triangle.',
            'sofa': 'Sofa dimensions: 140-200cm width, 80-100cm depth, 75-85cm height. Consider seat height (40-45cm) for comfort. Add 10cm clearance behind for wall-mounted TVs.',
            'measurement': 'Always measure twice! Add 2-3cm clearance for doors and drawers. Consider ceiling height, door widths, and electrical outlets in your planning.',
            'material': 'Popular choices: Solid wood (durable, expensive), MDF (affordable, stable), Particle board (budget-friendly). Consider moisture resistance for kitchens/bathrooms.',
            'color': 'Neutral colors work best for longevity. Consider room lighting - cool lights make warm colors appear different. Test samples in your space.',
            'default': 'That\'s an interesting question! For furniture design, focus on functionality first, then aesthetics. Consider ergonomics, material durability, and how pieces work together in a space.'
        };

        // Simple keyword matching for relevant responses
        const lowerMessage = message.toLowerCase();
        let response = furnitureResponses.default;

        for (const [key, value] of Object.entries(furnitureResponses)) {
            if (key !== 'default' && lowerMessage.includes(key)) {
                response = value;
                break;
            }
        }

        // Add some randomization for more natural feel
        if (response === furnitureResponses.default) {
            const tips = [
                'Consider the scale - furniture should be proportional to room size.',
                'Think about storage solutions that maximize space efficiency.',
                'Quality hardware makes a big difference in functionality and longevity.',
                'Measure doorways and hallways for delivery considerations.',
                'Consider future needs - will the space requirements change?'
            ];
            response = tips[Math.floor(Math.random() * tips.length)];
        }

        // Simulate realistic response delay
        setTimeout(() => {
            removeTypingIndicator();
            addMessageToChat(response, 'bot');
        }, 1000 + Math.random() * 2000);

    } catch (error) {
        console.error('AI Chat Error:', error);
        removeTypingIndicator();
        addMessageToChat('I\'m here to help with your furniture design questions! Feel free to ask about measurements, materials, or design ideas.', 'bot');
    }
}

function addMessageToChat(content, type) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    messageDiv.innerHTML = `
        <div class="message-avatar">${type === 'bot' ? '🤖' : '👤'}</div>
        <div class="message-content">
            <p>${content.replace(/\n/g, '<br>')}</p>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';

    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');

    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
}

// Close mobile menu when clicking on a link
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const navToggle = document.querySelector('.nav-toggle');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.nav-menu').classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Add click event to nav toggle
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }
});

// Scroll animations
function handleScrollAnimations() {
    const sections = document.querySelectorAll('.hero, .products-section, .features-section, .ai-section, .contact-section');

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;

        if (isVisible) {
            section.classList.add('in-view');
        }
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact form handling
function handleContactForm(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Simple validation
    if (!data.name || !data.email || !data.subject || !data.message) {
        alert('Please fill in all fields.');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Simulate form submission
    alert('Thank you for your message! We\'ll get back to you soon.');
    form.reset();
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    // AI chat initialization
    const aiInput = document.getElementById('ai-input');
    if (aiInput) {
        aiInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAIMessage();
            }
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Scroll animations
    handleScrollAnimations();
    window.addEventListener('scroll', handleScrollAnimations);

    // Add fade-in animation to elements
    const fadeElements = document.querySelectorAll('.product-card, .feature-item, .contact-item');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        observer.observe(element);
    });
});
