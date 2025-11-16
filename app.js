class MagazineApp {
    constructor() {
        this.currentPage = 'home';
        this.lastScrollPosition = 0;
        this.carouselIndex = 0;
        this.carouselInterval = null;
        this.testimonialIndex = 0;
        this.testimonialInterval = null;
        
        this.init();
    }

    init() {
        this.loadPage('home');

        this.initNavigation();

        this.initScrollMenu();
    }

    // ========================================
    // Navigation dynamique avec fetch
    // ========================================
    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                this.loadPage(page);
            });
        });
    }

    async loadPage(page) {
        const mainContent = document.getElementById('main-content');
        
        try {
            mainContent.style.opacity = '0';
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const response = await fetch(`pages/${page}.html`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const content = await response.text();
            mainContent.innerHTML = content;
            
            mainContent.style.opacity = '1';
            
            window.scrollTo(0, 0);
            
            this.currentPage = page;
            this.initPageFeatures();
            
        } catch (error) {
            console.error('Erreur lors du chargement de la page:', error);
            mainContent.innerHTML = `
                <div style="text-align: center; padding: 4rem;">
                    <h2>Erreur de chargement</h2>
                    <p>Impossible de charger le contenu de la page.</p>
                    <p style="color: #666;">Assurez-vous que le serveur local est démarré.</p>
                </div>
            `;
            mainContent.style.opacity = '1';
        }
    }

    initPageFeatures() {
        if (this.currentPage === 'home') {
            this.initCarousel();
            this.initLikesAndComments();
            this.initTestimonials();
        } else if (this.currentPage === 'tech' || this.currentPage === 'culture') {
            this.initLikesAndComments();
        } else if (this.currentPage === 'contact') {
            this.initContactForm();
        }
    }

    // ========================================
    // Menu dynamique au scroll
    // ========================================
    initScrollMenu() {
        let lastScroll = 0;
        const navbar = document.getElementById('navbar');
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                navbar.classList.remove('hidden');
                return;
            }
            
            if (currentScroll > lastScroll && currentScroll > 100) {
                // Scroll vers le bas - cacher le menu
                navbar.classList.add('hidden');
            } else {
                // Scroll vers le haut - afficher le menu
                navbar.classList.remove('hidden');
            }
            
            lastScroll = currentScroll;
        });
    }

    // ========================================
    // Carrousel d'images
    // ========================================
    initCarousel() {
        const track = document.querySelector('.carousel-track');
        const slides = document.querySelectorAll('.carousel-slide');
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');
        const indicatorsContainer = document.querySelector('.carousel-indicators');
        
        if (!track || slides.length === 0) return;
        
        this.carouselIndex = 0;
        
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('indicator');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(index));
            indicatorsContainer.appendChild(dot);
        });
        
        prevBtn.addEventListener('click', () => this.previousSlide());
        nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.startCarouselAutoPlay();
        
        const carousel = document.querySelector('.carousel');
        carousel.addEventListener('mouseenter', () => this.stopCarouselAutoPlay());
        carousel.addEventListener('mouseleave', () => this.startCarouselAutoPlay());
    }

    goToSlide(index) {
        const track = document.querySelector('.carousel-track');
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        
        if (!track || !slides.length) return;
        
        this.carouselIndex = index;
        const offset = -index * 100;
        track.style.transform = `translateX(${offset}%)`;
        
        indicators.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    nextSlide() {
        const slides = document.querySelectorAll('.carousel-slide');
        this.carouselIndex = (this.carouselIndex + 1) % slides.length;
        this.goToSlide(this.carouselIndex);
    }

    previousSlide() {
        const slides = document.querySelectorAll('.carousel-slide');
        this.carouselIndex = (this.carouselIndex - 1 + slides.length) % slides.length;
        this.goToSlide(this.carouselIndex);
    }

    startCarouselAutoPlay() {
        this.stopCarouselAutoPlay();
        this.carouselInterval = setInterval(() => this.nextSlide(), 5000);
    }

    stopCarouselAutoPlay() {
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
            this.carouselInterval = null;
        }
    }

    // ========================================
    // Système de likes et commentaires
    // ========================================
    initLikesAndComments() {
        this.loadLikesAndComments();
        
        const likeButtons = document.querySelectorAll('.like-btn');
        likeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const articleId = btn.getAttribute('data-article-id');
                this.toggleLike(articleId, btn);
            });
        });
        
        const commentToggles = document.querySelectorAll('.comment-toggle');
        commentToggles.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const articleId = btn.getAttribute('data-article-id');
                this.toggleComments(articleId);
            });
        });
        
        const commentForms = document.querySelectorAll('.comment-form');
        commentForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const articleId = form.closest('.comments-section').getAttribute('data-article-id');
                this.addComment(articleId, form);
            });
        });
    }

    loadLikesAndComments() {
        const likes = JSON.parse(localStorage.getItem('articleLikes') || '{}');
        Object.keys(likes).forEach(articleId => {
            const btn = document.querySelector(`.like-btn[data-article-id="${articleId}"]`);
            if (btn) {
                const count = btn.querySelector('.like-count');
                count.textContent = likes[articleId].count;
                if (likes[articleId].liked) {
                    btn.classList.add('liked');
                }
            }
        });
        
        const comments = JSON.parse(localStorage.getItem('articleComments') || '{}');
        Object.keys(comments).forEach(articleId => {
            const commentSection = document.querySelector(`.comments-section[data-article-id="${articleId}"]`);
            if (commentSection) {
                const commentsList = commentSection.querySelector('.comments-list');
                const countElement = document.querySelector(`.comment-toggle[data-article-id="${articleId}"] .comment-count`);
                
                commentsList.innerHTML = '';
                comments[articleId].forEach(comment => {
                    this.renderComment(commentsList, comment);
                });
                
                if (countElement) {
                    countElement.textContent = comments[articleId].length;
                }
            }
        });
    }

    toggleLike(articleId, btn) {
        const likes = JSON.parse(localStorage.getItem('articleLikes') || '{}');
        
        if (!likes[articleId]) {
            likes[articleId] = { count: 0, liked: false };
        }
        
        const count = btn.querySelector('.like-count');
        
        if (likes[articleId].liked) {
            likes[articleId].count = Math.max(0, likes[articleId].count - 1);
            likes[articleId].liked = false;
            btn.classList.remove('liked');
        } else {
            likes[articleId].count++;
            likes[articleId].liked = true;
            btn.classList.add('liked');
        }
        
        count.textContent = likes[articleId].count;
        localStorage.setItem('articleLikes', JSON.stringify(likes));
    }

    toggleComments(articleId) {
        const section = document.querySelector(`.comments-section[data-article-id="${articleId}"]`);
        if (section) {
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        }
    }

    addComment(articleId, form) {
        const name = form.querySelector('.comment-name').value.trim();
        const text = form.querySelector('.comment-text').value.trim();
        
        if (!name || !text) return;
        
        const comments = JSON.parse(localStorage.getItem('articleComments') || '{}');
        
        if (!comments[articleId]) {
            comments[articleId] = [];
        }
        
        const comment = {
            author: name,
            text: text,
            date: new Date().toISOString()
        };
        
        comments[articleId].push(comment);
        localStorage.setItem('articleComments', JSON.stringify(comments));
        
        const commentsList = form.previousElementSibling;
        this.renderComment(commentsList, comment);
        
        const countElement = document.querySelector(`.comment-toggle[data-article-id="${articleId}"] .comment-count`);
        if (countElement) {
            countElement.textContent = comments[articleId].length;
        }
        
        form.reset();
    }

    renderComment(container, comment) {
        const div = document.createElement('div');
        div.classList.add('comment');
        div.innerHTML = `
            <div class="comment-author">${this.escapeHtml(comment.author)}</div>
            <div class="comment-text">${this.escapeHtml(comment.text)}</div>
        `;
        container.appendChild(div);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // Témoignages automatiques
    // ========================================
    initTestimonials() {
        const testimonials = document.querySelectorAll('.testimonial');
        const dotsContainer = document.querySelector('.testimonial-dots');
        
        if (!testimonials.length || !dotsContainer) return;
        
        this.testimonialIndex = 0;
        
        testimonials.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('testimonial-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToTestimonial(index));
            dotsContainer.appendChild(dot);
        });
        
        this.startTestimonialsAutoPlay();
        
        const container = document.querySelector('.testimonials');
        container.addEventListener('mouseenter', () => this.stopTestimonialsAutoPlay());
        container.addEventListener('mouseleave', () => this.startTestimonialsAutoPlay());
    }

    goToTestimonial(index) {
        const testimonials = document.querySelectorAll('.testimonial');
        const dots = document.querySelectorAll('.testimonial-dot');
        
        testimonials.forEach((t, i) => {
            t.classList.toggle('active', i === index);
        });
        
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === index);
        });
        
        this.testimonialIndex = index;
    }

    nextTestimonial() {
        const testimonials = document.querySelectorAll('.testimonial');
        this.testimonialIndex = (this.testimonialIndex + 1) % testimonials.length;
        this.goToTestimonial(this.testimonialIndex);
    }

    startTestimonialsAutoPlay() {
        this.stopTestimonialsAutoPlay();
        this.testimonialInterval = setInterval(() => this.nextTestimonial(), 4000);
    }

    stopTestimonialsAutoPlay() {
        if (this.testimonialInterval) {
            clearInterval(this.testimonialInterval);
            this.testimonialInterval = null;
        }
    }

    // ========================================
    // Validation du formulaire de contact
    // ========================================
    initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(form);
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const errorMessage = field.parentElement.querySelector('.error-message');
        let isValid = true;
        let message = '';
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'Ce champ est obligatoire';
        }
        
        if (value && field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Veuillez entrer une adresse email valide';
            }
        }
        
        if (value && field.type === 'tel') {
            const phoneRegex = /^[0-9+\s\-()]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                message = 'Veuillez entrer un numéro de téléphone valide';
            }
        }
        
        if (value && field.hasAttribute('minlength')) {
            const minLength = parseInt(field.getAttribute('minlength'));
            if (value.length < minLength) {
                isValid = false;
                message = `Minimum ${minLength} caractères requis`;
            }
        }
        
        if (field.type === 'checkbox' && field.hasAttribute('required')) {
            if (!field.checked) {
                isValid = false;
                message = 'Vous devez accepter ce champ';
            }
        }
        
        if (field.tagName === 'SELECT' && field.hasAttribute('required')) {
            if (!value) {
                isValid = false;
                message = 'Veuillez sélectionner une option';
            }
        }
        
        if (isValid) {
            field.classList.remove('error');
            if (errorMessage) errorMessage.textContent = '';
        } else {
            field.classList.add('error');
            if (errorMessage) errorMessage.textContent = message;
        }
        
        return isValid;
    }

    handleFormSubmit(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }
        
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
        
        setTimeout(() => {
            form.style.display = 'none';
            
            const successMessage = document.getElementById('form-success');
            successMessage.style.display = 'block';
            
            setTimeout(() => {
                form.reset();
                form.style.display = 'block';
                successMessage.style.display = 'none';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Envoyer le message';
                
                inputs.forEach(input => input.classList.remove('error'));
            }, 5000);
        }, 1500);
    }
}

// ========================================
// Initialiser l'application au chargement
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    new MagazineApp();
});
