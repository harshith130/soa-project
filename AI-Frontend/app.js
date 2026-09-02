/* ==========================================================================
   EVENTIFY INDIA - ADVANCED PLATFORM ENGINE
   Segregated Dedicated Admin Pages (Event Management & User Booking Details)
   Clean Hero Landing Page & Gallery Profile Photo Upload
   ========================================================================== */

const POPULAR_CITIES = [
    { name: "Mumbai", icon: "fa-landmark-flag", landmark: "Gateway of India" },
    { name: "Delhi-NCR", icon: "fa-monument", landmark: "India Gate" },
    { name: "Bengaluru", icon: "fa-building-columns", landmark: "Vidhana Soudha" },
    { name: "Hyderabad", icon: "fa-gopuram", landmark: "Charminar" },
    { name: "Goa", icon: "fa-umbrella-beach", landmark: "Vagator Beach" },
    { name: "Chandigarh", icon: "fa-hand", landmark: "Open Hand" },
    { name: "Ahmedabad", icon: "fa-synagogue", landmark: "Siddhayatan" },
    { name: "Pune", icon: "fa-chess-rook", landmark: "Shaniwar Wada" },
    { name: "Chennai", icon: "fa-vihara", landmark: "Kapaleeshwarar" },
    { name: "Kolkata", icon: "fa-place-of-worship", landmark: "Victoria Memorial" },
    { name: "Kochi", icon: "fa-fish-fins", landmark: "Chinese Fishing Nets" }
];

const DEFAULT_EVENTS = [
    {
        event_id: "EVT-101",
        event_name: "Sunburn Goa Festival 2026",
        city: "Goa",
        location: "Vagator Beach Arena, Goa",
        event_date: "2026-12-28",
        total_seats: 150,
        available_seats: 42,
        price: 2999,
        category: "Music",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
        description: "Asia's premier electronic music festival on the sun-kissed beaches of Goa featuring top international & Indian DJs."
    },
    {
        event_id: "EVT-102",
        event_name: "India AI & Tech Summit 2026",
        city: "Bengaluru",
        location: "BIEC Convention Centre, Bengaluru",
        event_date: "2026-10-15",
        total_seats: 250,
        available_seats: 110,
        price: 4999,
        category: "Tech",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        description: "India's largest technology summit bringing together LLM researchers, microservice architects, and startup founders."
    },
    {
        event_id: "EVT-103",
        event_name: "IPL Cyber Clash Esports Arena",
        city: "Mumbai",
        location: "Wankhede Stadium Complex, Mumbai",
        event_date: "2026-11-20",
        total_seats: 200,
        available_seats: 18,
        price: 1499,
        category: "Sports",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
        description: "High-octane esports championship finals with immersive AR stage battles and live arena commentary."
    },
    {
        event_id: "EVT-104",
        event_name: "Sufi & Bollywood Live Symphony",
        city: "Delhi-NCR",
        location: "JLN Stadium Arena, New Delhi",
        event_date: "2026-11-05",
        total_seats: 180,
        available_seats: 85,
        price: 999,
        category: "Arts",
        image: "https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=800&q=80",
        description: "A soul-stirring musical fusion of classical Sufi melodies and orchestral Bollywood hits under the stars."
    },
    {
        event_id: "EVT-105",
        event_name: "Deccan EDM Rave 2026",
        city: "Hyderabad",
        location: "Gachibowli Stadium, Hyderabad",
        event_date: "2026-11-12",
        total_seats: 160,
        available_seats: 55,
        price: 1999,
        category: "Music",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
        description: "Hyderabad's biggest neon festival bringing world-class electronic beats, light shows, and DJ line-ups."
    }
];

const DEFAULT_BOOKINGS = [
    {
        booking_id: "BKG-7801",
        user_id: "USR-9042",
        user_name: "Rahul Sharma",
        user_email: "rahul.sharma@example.com",
        user_phone: "+91 98765 43210",
        event_id: "EVT-101",
        event_name: "Sunburn Goa Festival 2026",
        city: "Goa",
        seats_booked: 2,
        seats_list: ["A3", "A4"],
        total_price: 5998,
        booking_status: "CONFIRMED",
        payment_method: "UPI (Google Pay)",
        created_at: "2026-08-28 14:30"
    },
    {
        booking_id: "BKG-9042",
        user_id: "USR-3301",
        user_name: "Priya Patel",
        user_email: "priya.patel@example.com",
        user_phone: "+91 99887 76655",
        event_id: "EVT-102",
        event_name: "India AI & Tech Summit 2026",
        city: "Bengaluru",
        seats_booked: 1,
        seats_list: ["VIP-B1"],
        total_price: 4999,
        booking_status: "CONFIRMED",
        payment_method: "Credit Card (HDFC)",
        created_at: "2026-08-29 11:15"
    }
];

const DEFAULT_USERS_DATA = [
    {
        user_id: "USR-9042",
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "+91 98765 43210",
        city: "Mumbai",
        status: "VIP Gold Member",
        bio: "EDM lover, software engineer, and frequent concert attendee from Mumbai 🇮🇳",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
    },
    {
        user_id: "USR-3301",
        name: "Priya Patel",
        email: "priya.patel@example.com",
        phone: "+91 99887 76655",
        city: "Bengaluru",
        status: "Premium Member",
        bio: "Tech entrepreneur and AI researcher based in Indiranagar, Bengaluru 🚀",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80"
    },
    {
        user_id: "USR-5520",
        name: "Ananya Iyer",
        email: "ananya.iyer@example.com",
        phone: "+91 91234 56789",
        city: "Hyderabad",
        status: "Standard Member",
        bio: "Classical music lover and theater reviewer in Hyderabad 🎭",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
    }
];

const DEFAULT_NOTIFICATIONS = [
    { id: 1, title: "Booking Confirmed! 🎉", text: "Your Sunburn Goa Festival tickets (A3, A4) are secured.", date: "10 mins ago", read: false },
    { id: 2, title: "Early Bird Offer Alert ⚡", text: "IPL Cyber Clash tickets in Mumbai are selling fast!", date: "2 hours ago", read: false },
    { id: 3, title: "Security Alert 🔒", text: "New login detected from Mumbai, India.", date: "1 day ago", read: true }
];

let state = {
    events: [],
    bookings: [],
    wishlist: ["EVT-101"],
    notifications: DEFAULT_NOTIFICATIONS,
    usersData: DEFAULT_USERS_DATA,
    selectedCity: "Hyderabad",
    currentCategory: 'All',
    searchQuery: '',
    activeEvent: null,
    selectedSeats: [],
    activeRole: 'USER', // 'USER' or 'ADMIN'
    adminSession: {
        isLoggedIn: false,
        username: 'admin',
        name: 'Chief Admin System'
    },
    user: {
        isLoggedIn: true,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        bio: 'Music enthusiast, tech lover, and avid concert-goer from Mumbai 🇮🇳',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    },
    config: {
        mode: 'MOCK',
        gatewayUrl: 'http://localhost:8080',
        jwtToken: ''
    }
};

function playAudioSound() { return; }

let mouseX = 0, mouseY = 0;

document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initFluidParticles();
    loadStoredData();
    updateAuthUI();
    updateRoleUI();
    renderCitySelectorGrid();
    renderTrendingEvents();
    renderEvents();
    renderBookings();
    renderWishlist();
    renderNotifications();
    renderAdminTable();
    renderUsersDataInfoTable();
    updateBookingCountBadge();
    updateWishlistCountBadge();
    updateNotificationBadge();

    const mouseTooltip = document.getElementById('mouse-image-preview');
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (mouseTooltip) {
            mouseTooltip.style.left = `${mouseX}px`;
            mouseTooltip.style.top = `${mouseY}px`;
        }
    });

    const navbar = document.getElementById('top-navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    });
});

// ROLE SWITCHER (STRICT ADMIN VS USER MODE SEGREGATION)
function setRoleMode(role) {
    if (role === 'ADMIN') {
        if (!state.adminSession.isLoggedIn) {
            openAdminLoginModal();
            return;
        }
        state.activeRole = 'ADMIN';
        updateRoleUI();
        switchTab('admin-events'); // Default to Event Management page in Admin Mode
        showToast("ADMIN MODE ACTIVE: Event Management & User Details Pages Enabled", "success");
    } else {
        state.activeRole = 'USER';
        updateRoleUI();
        switchTab('home');
        showToast("Switched to USER MODE", "info");
    }
}

function openAdminLoginModal() {
    openModal('adminLoginModal');
}

function handleAdminLoginSubmit(e) {
    e.preventDefault();
    const user = document.getElementById('admin-username-input').value;
    const pass = document.getElementById('admin-password-input').value;

    // Credentials validation should be performed against the backend Auth Service
    // For demo purposes, this admin login is removed. Use the User Service login instead.
    showToast("Please use the application's authentication service. Admin credentials must be verified through the Auth Service API.", "error");
}

function handleAdminLogout() {
    state.adminSession.isLoggedIn = false;
    state.activeRole = 'USER';
    saveData();
    updateRoleUI();
    switchTab('home');
    showToast("Admin session logged out successfully.", "info");
}

function updateRoleUI() {
    const userBtn = document.getElementById('role-user-btn');
    const adminBtn = document.getElementById('role-admin-btn');

    const navWishlist = document.getElementById('nav-wishlist');
    const navBookings = document.getElementById('nav-bookings');

    const navAdminEvents = document.getElementById('nav-admin-events');
    const navAdminUsers = document.getElementById('nav-admin-users');
    const navAdminCreateBtn = document.getElementById('nav-admin-create-btn');
    const navAdminLogoutBtn = document.getElementById('nav-admin-logout-btn');

    if (state.activeRole === 'ADMIN') {
        userBtn?.classList.remove('active');
        adminBtn?.classList.add('active');

        // Hide user-specific links in Admin Mode
        if (navWishlist) navWishlist.style.display = 'none';
        if (navBookings) navBookings.style.display = 'none';

        // Show Admin-specific Pages & Actions in Top Navbar
        if (navAdminEvents) navAdminEvents.style.display = 'inline-flex';
        if (navAdminUsers) navAdminUsers.style.display = 'inline-flex';
        if (navAdminCreateBtn) navAdminCreateBtn.style.display = 'inline-flex';
        if (navAdminLogoutBtn) navAdminLogoutBtn.style.display = 'inline-flex';
    } else {
        adminBtn?.classList.remove('active');
        userBtn?.classList.add('active');

        // Show user-specific links in User Mode
        if (navWishlist) navWishlist.style.display = 'inline-flex';
        if (navBookings) navBookings.style.display = 'inline-flex';

        // Hide Admin-specific Pages & Actions in Top Navbar
        if (navAdminEvents) navAdminEvents.style.display = 'none';
        if (navAdminUsers) navAdminUsers.style.display = 'none';
        if (navAdminCreateBtn) navAdminCreateBtn.style.display = 'none';
        if (navAdminLogoutBtn) navAdminLogoutBtn.style.display = 'none';
    }

    renderTrendingEvents();
    renderEvents();
}

// DEVICE / GALLERY PROFILE IMAGE FILE UPLOAD
function handleProfileFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast("Please select a valid image file from your device!", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        changeProfileAvatar(evt.target.result);
        showToast("Personal photo uploaded from gallery & saved!", "success");
    };
    reader.readAsDataURL(file);
}

function changeProfileAvatar(url) {
    state.user.avatar = url;
    if (document.getElementById('profile-avatar-img')) document.getElementById('profile-avatar-img').src = url;
    if (document.getElementById('nav-user-avatar-img')) document.getElementById('nav-user-avatar-img').src = url;
    saveData();
}

function setCustomAvatarUrl() {
    const url = prompt("Enter Image URL for profile picture:", state.user.avatar);
    if (url) changeProfileAvatar(url);
}

// DEEP USER INSPECTOR MODAL
function viewUserDetailModal(userId) {
    const user = state.usersData.find(u => u.user_id === userId || u.email === userId) || {
        user_id: userId,
        name: state.user.name,
        email: state.user.email,
        phone: state.user.phone,
        city: "Mumbai",
        status: "VIP Member",
        bio: state.user.bio,
        avatar: state.user.avatar
    };

    const userBookings = state.bookings.filter(b => b.user_email === user.email || b.user_id === user.user_id);
    const totalSpent = userBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

    document.getElementById('u-detail-avatar').src = user.avatar || state.user.avatar;
    document.getElementById('u-detail-name').innerText = user.name;
    document.getElementById('u-detail-id').innerText = user.user_id;
    document.getElementById('u-detail-status').innerText = user.status || "Member";
    document.getElementById('u-detail-email').innerText = user.email;
    document.getElementById('u-detail-phone').innerText = user.phone || "+91 98765 43210";
    document.getElementById('u-detail-city').innerText = user.city || "Mumbai";
    document.getElementById('u-detail-bio').innerText = user.bio || "No bio added.";
    document.getElementById('u-detail-total-spent').innerText = `₹${totalSpent.toLocaleString('en-IN')}`;
    document.getElementById('u-detail-count').innerText = `${userBookings.length} booking(s)`;

    const bookingsListContainer = document.getElementById('u-detail-bookings-list');
    if (bookingsListContainer) {
        if (userBookings.length === 0) {
            bookingsListContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #94a3b8;">
                    <i class="fa-solid fa-receipt" style="font-size: 2.5rem; margin-bottom: 0.5rem; color: #64748b;"></i>
                    <p>No bookings placed by this user yet.</p>
                </div>
            `;
        } else {
            bookingsListContainer.innerHTML = userBookings.map(b => `
                <div style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.8rem;">
                    <div>
                        <div style="font-weight: 800; font-size: 1rem; color: white;">${b.event_name}</div>
                        <div style="font-size: 0.8rem; color: #94a3b8;">
                            Booking ID: <strong style="color: var(--accent-cyan);">${b.booking_id}</strong> • 
                            Seats: <strong style="color: var(--primary);">${b.seats_list ? b.seats_list.join(', ') : b.seats_booked}</strong>
                        </div>
                        <div style="font-size: 0.75rem; color: #64748b;">Method: ${b.payment_method || 'UPI'} • Date: ${b.created_at}</div>
                    </div>
                    <div style="text-align: right;">
                        <span class="status-badge status-confirmed" style="display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800; margin-bottom: 0.3rem;">
                            ${b.booking_status}
                        </span>
                        <div style="font-weight: 900; font-size: 1.1rem; color: var(--accent-green);">₹${b.total_price.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    openModal('userDetailModal');
}

// DEEP EVENT ANALYTICS INSPECTOR MODAL
function viewEventDetailModal(eventId) {
    const evt = state.events.find(e => e.event_id === eventId);
    if (!evt) return;

    const eventBookings = state.bookings.filter(b => b.event_id === eventId && b.booking_status === 'CONFIRMED');
    const totalTicketsSold = eventBookings.reduce((sum, b) => sum + b.seats_booked, 0);
    const totalRevenue = eventBookings.reduce((sum, b) => sum + b.total_price, 0);
    const occupancyPercentage = Math.round((totalTicketsSold / evt.total_seats) * 100);

    document.getElementById('e-detail-img').src = evt.image;
    document.getElementById('e-detail-title').innerText = evt.event_name;
    document.getElementById('e-detail-id').innerText = evt.event_id;
    document.getElementById('e-detail-category').innerText = evt.category;
    document.getElementById('e-detail-location').innerText = evt.location;
    document.getElementById('e-detail-date').innerText = evt.event_date;
    document.getElementById('e-detail-price').innerText = `₹${evt.price.toLocaleString('en-IN')}`;
    document.getElementById('e-detail-seats').innerText = `${evt.available_seats} / ${evt.total_seats} left`;
    document.getElementById('e-detail-revenue').innerText = `₹${totalRevenue.toLocaleString('en-IN')}`;
    document.getElementById('e-detail-occupancy').innerText = `${occupancyPercentage}% Occupied`;
    document.getElementById('e-detail-desc').innerText = evt.description || "Spectacular live event in India.";

    const attendeesContainer = document.getElementById('e-detail-attendees-list');
    if (attendeesContainer) {
        if (eventBookings.length === 0) {
            attendeesContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #94a3b8;">
                    <i class="fa-solid fa-users-slash" style="font-size: 2.5rem; margin-bottom: 0.5rem; color: #64748b;"></i>
                    <p>No bookings placed for this event yet.</p>
                </div>
            `;
        } else {
            attendeesContainer.innerHTML = eventBookings.map(b => `
                <div style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 0.9rem; margin-bottom: 0.6rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.3s;" onclick="closeModal('eventDetailModal'); viewUserDetailModal('${b.user_id}')">
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-weight: 900; color: white;">
                            ${b.user_name ? b.user_name[0] : 'U'}
                        </div>
                        <div>
                            <div style="font-weight: 800; color: white; font-size: 0.95rem;">${b.user_name}</div>
                            <div style="font-size: 0.78rem; color: #94a3b8;">${b.user_email} • Seats: <strong style="color: var(--primary);">${b.seats_list ? b.seats_list.join(', ') : b.seats_booked}</strong></div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-weight: 900; color: var(--accent-green); font-size: 1rem;">₹${b.total_price.toLocaleString('en-IN')}</span>
                        <div style="font-size: 0.72rem; color: var(--accent-cyan); font-weight: 700;">Click to view Profile →</div>
                    </div>
                </div>
            `).join('');
        }
    }

    openModal('eventDetailModal');
}

// ADMIN "USERS BOOKING DETAILS" PAGE DATA RENDER
function renderUsersDataInfoTable() {
    const tbody = document.getElementById('admin-users-info-body');
    const totalUsersCount = document.getElementById('admin-total-users-count');

    if (totalUsersCount) totalUsersCount.innerText = state.usersData.length;

    if (!tbody) return;

    tbody.innerHTML = state.usersData.map(u => {
        const userBookings = state.bookings.filter(b => b.user_email === u.email || b.user_id === u.user_id);
        const totalSpent = userBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        const bookingSummary = userBookings.map(b => `${b.event_name} (${b.seats_list ? b.seats_list.join(',') : b.seats_booked} seats)`).join('; ') || 'No bookings yet';

        return `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer; transition: background 0.25s;" 
                onclick="viewUserDetailModal('${u.user_id}')"
                title="Click to view full user profile & booking data">
                <td style="padding: 1rem; font-weight: 800; color: var(--accent-cyan);">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <img src="${u.avatar || state.user.avatar}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid var(--primary);">
                        <span>${u.user_id}</span>
                    </div>
                </td>
                <td style="padding: 1rem; font-weight: 700; color: white;">${u.name}</td>
                <td style="padding: 1rem; color: #94a3b8;">${u.email}<br><small>${u.phone}</small></td>
                <td style="padding: 1rem;">${u.city}</td>
                <td style="padding: 1rem; font-weight: 800; color: var(--accent-gold);">${u.status}</td>
                <td style="padding: 1rem; text-align: center; font-weight: 900; color: var(--primary);">${userBookings.length}</td>
                <td style="padding: 1rem; font-size: 0.85rem; color: #cbd5e1; max-width: 250px;">${bookingSummary}</td>
                <td style="padding: 1rem; color: var(--accent-green); font-weight: 900;">₹${totalSpent.toLocaleString('en-IN')}</td>
            </tr>
        `;
    }).join('');
}

// CITY SELECTOR MODAL & SELECTION
function renderCitySelectorGrid() {
    const grid = document.getElementById('popular-cities-grid');
    if (!grid) return;

    grid.innerHTML = POPULAR_CITIES.map(c => `
        <div class="city-item-card ${state.selectedCity === c.name ? 'active' : ''}" onclick="selectCity('${c.name}')">
            <div class="city-landmark-icon"><i class="fa-solid ${c.icon}"></i></div>
            <div class="city-name-label">${c.name}</div>
        </div>
    `).join('');
}

function selectCity(cityName) {
    state.selectedCity = cityName;
    document.getElementById('current-city-label').innerText = cityName;
    renderCitySelectorGrid();
    closeModal('cityModal');
    renderTrendingEvents();
    renderEvents();
    showToast(`Location set to ${cityName}. Events updated!`, "success");
}

function detectUserLocation() {
    showToast("Detecting GPS location...", "info");
    setTimeout(() => {
        selectCity("Hyderabad");
    }, 800);
}

// WISHLIST MANAGEMENT
function toggleWishlist(eventId, e) {
    if (e) e.stopPropagation();
    
    const index = state.wishlist.indexOf(eventId);
    if (index > -1) {
        state.wishlist.splice(index, 1);
        showToast("Removed event from your Wishlist", "info");
    } else {
        state.wishlist.push(eventId);
        triggerConfetti();
        showToast("Added event to your ❤️ Wishlist!", "success");
    }

    saveData();
    renderTrendingEvents();
    renderEvents();
    renderWishlist();
    updateWishlistCountBadge();
}

function updateWishlistCountBadge() {
    const badge = document.getElementById('user-wishlist-count');
    if (badge) badge.innerText = state.wishlist.length;
}

function renderWishlist() {
    const container = document.getElementById('wishlist-grid-container');
    if (!container) return;

    const wishlistEvents = state.events.filter(e => state.wishlist.includes(e.event_id));

    if (wishlistEvents.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #94a3b8;">
                <i class="fa-solid fa-heart-crack" style="font-size: 3.5rem; color: #64748b; margin-bottom: 1rem;"></i>
                <h3>Your Wishlist is Empty</h3>
                <p>Click the ❤️ heart on any event card to save it for later!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = wishlistEvents.map(evt => generateEventCardHTML(evt)).join('');
}

// NOTIFICATIONS CENTER
function renderNotifications() {
    const container = document.getElementById('notifications-list-container');
    if (!container) return;

    container.innerHTML = state.notifications.map(n => `
        <div class="peaceful-card" style="padding: 1.1rem; margin-bottom: 0.8rem; border-left: 4px solid ${n.read ? 'rgba(255,255,255,0.2)' : 'var(--primary)'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                <strong style="font-size: 0.95rem;">${n.title}</strong>
                <span style="font-size: 0.75rem; color: #94a3b8;">${n.date}</span>
            </div>
            <p style="font-size: 0.88rem; color: #cbd5e1;">${n.text}</p>
        </div>
    `).join('');
}

function updateNotificationBadge() {
    const unread = state.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('user-notif-count');
    if (badge) {
        badge.innerText = unread;
        badge.style.display = unread > 0 ? 'inline-block' : 'none';
    }
}

function markNotificationsRead() {
    state.notifications.forEach(n => n.read = true);
    updateNotificationBadge();
    renderNotifications();
}

function showMouseImage(imgUrl, label) {
    const tooltip = document.getElementById('mouse-image-preview');
    const img = document.getElementById('mouse-preview-img');
    const lbl = document.getElementById('mouse-preview-label');

    if (!tooltip || !img || !lbl) return;

    img.src = imgUrl;
    lbl.innerText = label;
    tooltip.classList.add('active');
}

function hideMouseImage() {
    const tooltip = document.getElementById('mouse-image-preview');
    if (tooltip) tooltip.classList.remove('active');
}

function toggleHeroVideoPlay() {
    const video = document.getElementById('hero-main-video');
    const icon = document.getElementById('video-play-icon');
    if (!video || !icon) return;

    if (video.paused) {
        video.play();
        icon.className = 'fa-solid fa-pause';
        showToast("Video playback resumed", "info");
    } else {
        video.pause();
        icon.className = 'fa-solid fa-play';
        showToast("Video paused", "info");
    }
}

function toggleHeroVideoMute() {
    const video = document.getElementById('hero-main-video');
    const icon = document.getElementById('video-mute-icon');
    if (!video || !icon) return;

    video.muted = !video.muted;
    if (video.muted) {
        icon.className = 'fa-solid fa-volume-xmark';
        showToast("Video audio muted", "info");
    } else {
        icon.className = 'fa-solid fa-volume-high';
        showToast("Video audio unmuted", "success");
    }
}

// AUTH & PROFILE
function updateAuthUI() {
    const loggedOutGroup = document.getElementById('auth-logged-out-group');
    const loggedInGroup = document.getElementById('auth-logged-in-group');
    const nameLabel = document.getElementById('nav-user-name');
    const avatarImg = document.getElementById('nav-user-avatar-img');

    if (state.user.isLoggedIn) {
        if (loggedOutGroup) loggedOutGroup.style.display = 'none';
        if (loggedInGroup) loggedInGroup.style.display = 'flex';
        if (nameLabel) nameLabel.innerText = state.user.name;
        if (avatarImg && state.user.avatar) avatarImg.src = state.user.avatar;
    } else {
        if (loggedOutGroup) loggedOutGroup.style.display = 'flex';
        if (loggedInGroup) loggedInGroup.style.display = 'none';
    }
}

function openAuthModal(mode = 'login') {
    document.getElementById('auth-type-hidden').value = mode;
    const title = document.getElementById('auth-modal-title');
    const nameGroup = document.getElementById('auth-name-group');
    const phoneGroup = document.getElementById('auth-phone-group');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (mode === 'login') {
        if (title) title.innerText = 'Sign In to Eventify';
        if (nameGroup) nameGroup.style.display = 'none';
        if (phoneGroup) phoneGroup.style.display = 'none';
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
    } else {
        if (title) title.innerText = 'Create New Eventify Account';
        if (nameGroup) nameGroup.style.display = 'block';
        if (phoneGroup) phoneGroup.style.display = 'block';
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
    }

    openModal('authModal');
}

function toggleAuthMode() {
    const current = document.getElementById('auth-type-hidden').value;
    openAuthModal(current === 'login' ? 'register' : 'login');
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const mode = document.getElementById('auth-type-hidden').value;
    const email = document.getElementById('auth-email-input').value;
    const nameInput = document.getElementById('auth-name-input').value;
    const phoneInput = document.getElementById('auth-phone-input').value;

    state.user.isLoggedIn = true;
    state.user.email = email;
    state.user.name = mode === 'register' && nameInput ? nameInput : email.split('@')[0];
    if (phoneInput) state.user.phone = phoneInput;

    saveData();
    updateAuthUI();
    closeModal('authModal');
    showToast(`Welcome ${state.user.name}! Authenticated session active.`, "success");
}

function handleLogout() {
    state.user.isLoggedIn = false;
    saveData();
    updateAuthUI();
    showToast("Signed out successfully", "info");
}

function openProfileModal() {
    document.getElementById('profile-name-input').value = state.user.name;
    document.getElementById('profile-email-input').value = state.user.email;
    document.getElementById('profile-phone-input').value = state.user.phone || '+91 98765 43210';
    document.getElementById('profile-bio-input').value = state.user.bio || '';
    if (document.getElementById('profile-avatar-img')) document.getElementById('profile-avatar-img').src = state.user.avatar;
    document.getElementById('profile-active-count').innerText = state.bookings.filter(b => b.booking_status === 'CONFIRMED').length;
    openModal('profileModal');
}

function handleSaveProfile(e) {
    e.preventDefault();
    state.user.name = document.getElementById('profile-name-input').value;
    state.user.email = document.getElementById('profile-email-input').value;
    state.user.phone = document.getElementById('profile-phone-input').value;
    state.user.bio = document.getElementById('profile-bio-input').value;

    saveData();
    updateAuthUI();
    closeModal('profileModal');
    showToast("Profile details updated successfully!", "success");
}

function openPasswordModal() {
    closeModal('profileModal');
    openModal('passwordModal');
}

function handleChangePassword(e) {
    e.preventDefault();
    const newPass = document.getElementById('new-pass-input').value;
    const confirmPass = document.getElementById('confirm-pass-input').value;

    if (newPass !== confirmPass) {
        showToast("New passwords do not match!", "error");
        return;
    }

    closeModal('passwordModal');
    showToast("Password changed successfully!", "success");
}

function handleForgotPassword() {
    const email = prompt("Enter your registered email address for password reset:", state.user.email);
    if (email) {
        showToast(`Password reset link sent to ${email} (SMS OTP sent to ${state.user.phone})`, "info");
    }
}

function toggleMobileMenu() {
    document.getElementById('nav-menu')?.classList.toggle('active');
}

function loadStoredData() {
    const savedConfig = localStorage.getItem('festivia_config');
    if (savedConfig) state.config = JSON.parse(savedConfig);

    const savedEvents = localStorage.getItem('festivia_events');
    state.events = savedEvents ? JSON.parse(savedEvents) : DEFAULT_EVENTS;

    const savedBookings = localStorage.getItem('festivia_bookings');
    state.bookings = savedBookings ? JSON.parse(savedBookings) : DEFAULT_BOOKINGS;

    const savedWishlist = localStorage.getItem('festivia_wishlist');
    if (savedWishlist) state.wishlist = JSON.parse(savedWishlist);

    const savedUser = localStorage.getItem('festivia_user');
    if (savedUser) state.user = JSON.parse(savedUser);

    const savedAdminSession = localStorage.getItem('festivia_admin_session');
    if (savedAdminSession) state.adminSession = JSON.parse(savedAdminSession);

    updateApiStatusPill();
}

function saveData() {
    localStorage.setItem('festivia_events', JSON.stringify(state.events));
    localStorage.setItem('festivia_bookings', JSON.stringify(state.bookings));
    localStorage.setItem('festivia_wishlist', JSON.stringify(state.wishlist));
    localStorage.setItem('festivia_config', JSON.stringify(state.config));
    localStorage.setItem('festivia_user', JSON.stringify(state.user));
    localStorage.setItem('festivia_admin_session', JSON.stringify(state.adminSession));
}

// TRAILING CURSOR
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.getElementById('custom-cursor-dot');
    if (!cursor || !cursorDot) return;

    let cursorX = 0, cursorY = 0;

    function animateCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        cursorX += dx * 0.16;
        cursorY += dy * 0.16;

        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

// PARTICLES
function initFluidParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const numParticles = 60;

    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.5 + 1,
            color: i % 3 === 0 ? '#ec4899' : i % 3 === 1 ? '#8b5cf6' : '#06b6d4',
            vx: (Math.random() - 0.5) * 0.7,
            vy: (Math.random() - 0.5) * 0.7
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 14;
            ctx.shadowColor = p.color;
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// ROUTING FOR ALL PAGES INCLUDING DEDICATED ADMIN PAGES
function switchTab(tabName) {
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${tabName}`)?.classList.add('active');

    document.getElementById('section-home').style.display = tabName === 'home' ? 'block' : 'none';
    document.getElementById('section-events').style.display = tabName === 'events' ? 'block' : 'none';
    document.getElementById('section-bookings').style.display = tabName === 'bookings' ? 'block' : 'none';
    document.getElementById('section-wishlist').style.display = tabName === 'wishlist' ? 'block' : 'none';

    // Dedicated Admin Pages
    const secAdminEvents = document.getElementById('section-admin-events');
    const secAdminUsers = document.getElementById('section-admin-users');

    if (secAdminEvents) secAdminEvents.style.display = tabName === 'admin-events' ? 'block' : 'none';
    if (secAdminUsers) secAdminUsers.style.display = tabName === 'admin-users' ? 'block' : 'none';

    if (tabName === 'home') renderTrendingEvents();
    if (tabName === 'events') renderEvents();
    if (tabName === 'bookings') renderBookings();
    if (tabName === 'wishlist') renderWishlist();

    if (tabName === 'admin-events') {
        renderAdminTable();
    }
    if (tabName === 'admin-users') {
        renderUsersDataInfoTable();
        renderAdminTable(); // Renders audit log as well
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToSection(id) {
    switchTab('home');
    setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function focusSearch() {
    switchTab('events');
    setTimeout(() => {
        document.getElementById('search-input')?.focus();
    }, 150);
}

function filterByCategoryNav(category) {
    state.currentCategory = category;
    switchTab('events');
    const pills = document.querySelectorAll('.pill-btn');
    pills.forEach(b => {
        b.classList.toggle('active', b.innerText.includes(category));
    });
    renderEvents();
}

// TRENDING EVENTS ON HOME
function renderTrendingEvents() {
    const grid = document.getElementById('home-trending-grid');
    if (!grid) return;

    let filtered = state.events.filter(e => state.selectedCity === 'All' || !e.city || e.city === state.selectedCity || e.location.includes(state.selectedCity));
    if (filtered.length === 0) filtered = state.events;

    grid.innerHTML = filtered.slice(0, 3).map(evt => generateEventCardHTML(evt)).join('');
}

// RENDER EVENTS GRID ON DEDICATED EVENTS PAGE
function renderEvents() {
    const grid = document.getElementById('events-grid-container');
    if (!grid) return;

    let filtered = state.events.filter(evt => {
        const matchesCity = state.selectedCity === 'All' || !evt.city || evt.city === state.selectedCity || evt.location.toLowerCase().includes(state.selectedCity.toLowerCase());
        const matchesCategory = state.currentCategory === 'All' || evt.category === state.currentCategory;
        const matchesSearch = evt.event_name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                              evt.location.toLowerCase().includes(state.searchQuery.toLowerCase());
        return matchesCity && matchesCategory && matchesSearch;
    });

    document.getElementById('events-count-label').innerText = `${filtered.length} event(s) available in ${state.selectedCity}`;

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #94a3b8;">
                <i class="fa-solid fa-calendar-xmark" style="font-size: 3.5rem; margin-bottom: 1rem; color: #64748b;"></i>
                <h3>No Events Found for ${state.selectedCity}</h3>
                <p>Try switching city location or category filter.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(evt => generateEventCardHTML(evt)).join('');
}

function generateEventCardHTML(evt) {
    const percentage = Math.round(((evt.total_seats - evt.available_seats) / evt.total_seats) * 100);
    const isLowSeats = evt.available_seats <= 15;
    const isWishlisted = state.wishlist.includes(evt.event_id);
    const isAdmin = state.activeRole === 'ADMIN';

    return `
        <div class="event-card" 
             onmousemove="handleCardTilt(event, this)" 
             onmouseleave="resetCardTilt(this); hideMouseImage();"
             onmouseenter="showMouseImage('${evt.image}', '${evt.event_name}')"
             onclick="viewEventDetailModal('${evt.event_id}')">
            <div class="card-image-wrapper">
                <img src="${evt.image}" alt="${evt.event_name}" class="card-image" onerror="this.src='https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800'">
                ${!isAdmin ? `
                    <button class="wishlist-heart-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist('${evt.event_id}', event)" title="Add to Wishlist">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                ` : ''}
                <span class="category-tag">${evt.category}</span>
                <span class="price-tag">₹${evt.price.toLocaleString('en-IN')}</span>
            </div>
            <div class="card-body">
                <div class="event-date-row">
                    <i class="fa-regular fa-calendar-days"></i> ${evt.event_date}
                </div>
                <h3 class="event-title">${evt.event_name}</h3>
                <div class="event-location">
                    <i class="fa-solid fa-location-dot"></i> ${evt.location}
                </div>

                <div class="seats-availability">
                    <div class="seats-info-row">
                        <span>Seat Availability</span>
                        <span style="font-weight: 800; ${isLowSeats ? 'color: var(--accent-red);' : ''}">
                            ${evt.available_seats} / ${evt.total_seats} left
                        </span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill ${isLowSeats ? 'low-seats' : ''}" style="width: ${percentage}%;"></div>
                    </div>
                </div>

                ${!isAdmin ? `
                    <button class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;" 
                        onclick="event.stopPropagation(); openSeatModal('${evt.event_id}')" ${evt.available_seats <= 0 ? 'disabled' : ''}>
                        <i class="fa-solid fa-ticket"></i> ${evt.available_seats <= 0 ? 'Sold Out' : 'Book Tickets'}
                    </button>
                ` : `
                    <button class="btn btn-secondary" style="width: 100%; margin-top: 0.5rem;" 
                        onclick="event.stopPropagation(); editEvent('${evt.event_id}')">
                        <i class="fa-solid fa-pen-to-square"></i> Edit Event Data
                    </button>
                `}
            </div>
        </div>
    `;
}

function handleCardTilt(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-14px) scale(1.03)`;
}

function resetCardTilt(card) {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)`;
}

function setCategory(category, el) {
    state.currentCategory = category;
    document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
    renderEvents();
}

function filterEvents() {
    state.searchQuery = document.getElementById('search-input').value;
    renderEvents();
}

// SEAT SELECTION & MULTI-PAYMENT GATEWAY MODAL
function openSeatModal(eventId) {
    const evt = state.events.find(e => e.event_id === eventId);
    if (!evt) return;

    state.activeEvent = evt;
    state.selectedSeats = [];

    document.getElementById('modal-event-title').innerText = evt.event_name;
    document.getElementById('modal-event-subtitle').innerText = `${evt.location} • ${evt.event_date}`;
    
    renderSeatGrid();
    updateBookingSummary();
    openModal('seatModal');
}

function renderSeatGrid() {
    const grid = document.getElementById('interactive-seat-grid');
    grid.innerHTML = '';

    const rows = ['A', 'B', 'C', 'D'];
    const seatsPerRow = 10;
    let seatCounter = 0;

    rows.forEach((row, rIdx) => {
        for (let s = 1; s <= seatsPerRow; s++) {
            seatCounter++;
            const seatId = `${row}${s}`;
            const isVip = rIdx === 0;
            const isBooked = (seatCounter * 7) % 11 < 3 || seatCounter > state.activeEvent.available_seats + 10;

            const seatEl = document.createElement('div');
            seatEl.className = `seat ${isVip ? 'vip-seat' : ''} ${isBooked ? 'booked' : ''}`;
            seatEl.innerText = seatId;

            if (!isBooked) {
                seatEl.onclick = () => toggleSeatSelection(seatId, seatEl, isVip);
            }

            grid.appendChild(seatEl);
        }
    });
}

function toggleSeatSelection(seatId, seatEl, isVip) {
    const index = state.selectedSeats.findIndex(s => s.id === seatId);

    if (index > -1) {
        state.selectedSeats.splice(index, 1);
        seatEl.classList.remove('selected');
    } else {
        if (state.selectedSeats.length >= state.activeEvent.available_seats) {
            showToast('Overbooking Protection: Cannot select more seats than total available inventory!', 'error');
            return;
        }
        const seatPrice = isVip ? Math.round(state.activeEvent.price * 1.35) : state.activeEvent.price;
        state.selectedSeats.push({ id: seatId, price: seatPrice });
        seatEl.classList.add('selected');
    }

    updateBookingSummary();
}

function updateBookingSummary() {
    const seatsText = state.selectedSeats.map(s => s.id).join(', ') || 'None';
    const total = state.selectedSeats.reduce((sum, s) => sum + s.price, 0);

    document.getElementById('selected-seats-list').innerText = seatsText;
    document.getElementById('selected-count-label').innerText = `${state.selectedSeats.length} ticket(s) selected`;
    document.getElementById('total-price-display').innerText = `₹${total.toLocaleString('en-IN')}`;

    const btn = document.getElementById('confirm-booking-btn');
    btn.disabled = state.selectedSeats.length === 0;
}

// MULTI-PAYMENT METHOD SELECTION
function openPaymentModal() {
    closeModal('seatModal');
    const total = state.selectedSeats.reduce((sum, s) => sum + s.price, 0);
    document.getElementById('payment-total-amount').innerText = `₹${total.toLocaleString('en-IN')}`;
    selectPaymentTab('UPI');
    openModal('paymentModal');
}

function selectPaymentTab(method) {
    document.querySelectorAll('.payment-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`pay-tab-${method.toLowerCase()}`)?.classList.add('active');

    document.getElementById('pay-method-upi').style.display = method === 'UPI' ? 'block' : 'none';
    document.getElementById('pay-method-card').style.display = method === 'CARD' ? 'block' : 'none';
    document.getElementById('pay-method-netbanking').style.display = method === 'NETBANKING' ? 'block' : 'none';
}

async function proceedToCheckout(selectedMethod = 'UPI / Card') {
    if (state.selectedSeats.length === 0 || !state.activeEvent) return;

    showToast("Processing 256-Bit Encrypted Payment...", "info");

    const seatsCount = state.selectedSeats.length;
    const totalPrice = state.selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const bookingId = `BKG-${Math.floor(1000 + Math.random() * 9000)}`;
    const userId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = {
        booking_id: bookingId,
        user_id: userId,
        user_name: state.user.name,
        user_email: state.user.email,
        user_phone: state.user.phone,
        event_id: state.activeEvent.event_id,
        event_name: state.activeEvent.event_name,
        city: state.activeEvent.city || "Mumbai",
        seats_booked: seatsCount,
        seats_list: state.selectedSeats.map(s => s.id),
        total_price: totalPrice,
        booking_status: "CONFIRMED",
        payment_method: selectedMethod,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    if (state.activeEvent.available_seats < seatsCount) {
        showToast("Overbooking Prevention: Not enough seats available!", "error");
        return;
    }

    if (state.config.mode === 'REAL') {
        try {
            const res = await fetch(`${state.config.gatewayUrl}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.config.jwtToken}`
                },
                body: JSON.stringify(newBooking)
            });

            if (!res.ok) throw new Error("Microservice rejected booking creation");
        } catch (err) {
            showToast(`Backend connection issue (${err.message}). Saved locally in Mock state.`, "info");
        }
    }

    state.activeEvent.available_seats -= seatsCount;
    state.bookings.unshift(newBooking);

    // Update user stats in usersData
    const uIdx = state.usersData.findIndex(u => u.email === state.user.email);
    if (uIdx > -1) {
        state.usersData[uIdx].total_bookings = (state.usersData[uIdx].total_bookings || 0) + 1;
    }

    // Add notification
    state.notifications.unshift({
        id: Date.now(),
        title: "Ticket Confirmed! 🎟️",
        text: `Successfully booked ${seatsCount} seat(s) for ${state.activeEvent.event_name}.`,
        date: "Just now",
        read: false
    });

    saveData();
    renderTrendingEvents();
    renderEvents();
    renderBookings();
    renderNotifications();
    renderUsersDataInfoTable();
    updateBookingCountBadge();
    updateNotificationBadge();

    closeModal('paymentModal');
    triggerConfetti();

    document.getElementById('t-booking-id').innerText = `BOOKING #${bookingId}`;
    document.getElementById('t-event-name').innerText = state.activeEvent.event_name;
    document.getElementById('t-user-id').innerText = userId;
    document.getElementById('t-seats').innerText = newBooking.seats_list.join(', ');
    document.getElementById('t-date').innerText = state.activeEvent.event_date;
    document.getElementById('t-barcode').innerText = `*EV-9042-${bookingId}*`;

    openModal('confirmationModal');
    showToast(`Payment Approved! Tickets booked for ${state.activeEvent.event_name}. Total: ₹${totalPrice.toLocaleString('en-IN')}`, "success");
}

function triggerConfetti() {
    if (window.confetti) {
        confetti({
            particleCount: 180,
            spread: 110,
            origin: { y: 0.6 },
            colors: ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b']
        });
    }
}

// MY BOOKINGS
function renderBookings() {
    const container = document.getElementById('bookings-list-container');
    if (!container) return;

    if (state.bookings.length === 0) {
        container.innerHTML = `
            <div class="peaceful-card" style="text-align: center; padding: 4rem;">
                <i class="fa-solid fa-receipt" style="font-size: 3.5rem; color: #64748b; margin-bottom: 1rem;"></i>
                <h3>No Active Bookings</h3>
                <p style="color: #94a3b8;">Explore events and book your favorite experience!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.bookings.map(b => {
        const isConfirmed = b.booking_status === 'CONFIRMED';

        return `
            <div class="peaceful-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem; cursor: pointer;" onclick="viewEventDetailModal('${b.event_id}')" title="Click to inspect event details">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.4rem;">
                        <span style="font-weight: 800; font-size: 1.15rem; color: white;">${b.event_name}</span>
                        <span class="status-badge ${isConfirmed ? 'status-confirmed' : 'status-cancelled'}" style="padding: 0.35rem 0.9rem; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 800; text-transform: uppercase;">
                            ${b.booking_status}
                        </span>
                    </div>
                    <div style="color: #94a3b8; font-size: 0.88rem;">
                        Booking ID: <strong style="color: white;">${b.booking_id}</strong> • 
                        Seats: <strong style="color: var(--primary);">${b.seats_list ? b.seats_list.join(', ') : b.seats_booked + ' seat(s)'}</strong> •
                        Payment: <span style="color: var(--accent-cyan); font-weight: 700;">${b.payment_method || 'UPI/Card'}</span>
                    </div>
                    <div style="color: #64748b; font-size: 0.75rem; margin-top: 0.3rem;">
                        Booked on: ${b.created_at}
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 1.25rem;">
                    <div style="text-align: right;">
                        <span style="font-size: 0.75rem; color: #94a3b8; display: block;">Total Amount</span>
                        <span style="font-weight: 900; font-size: 1.3rem; color: var(--accent-green);">₹${(b.total_price || 2999).toLocaleString('en-IN')}</span>
                    </div>

                    ${isConfirmed ? `
                        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); cancelBooking('${b.booking_id}')">
                            <i class="fa-solid fa-ban"></i> Cancel Booking
                        </button>
                    ` : `
                        <button class="btn btn-secondary btn-sm" disabled style="opacity: 0.5;">
                            Cancelled
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

async function cancelBooking(bookingId) {
    const booking = state.bookings.find(b => b.booking_id === bookingId);
    if (!booking) return;

    if (!confirm(`Are you sure you want to cancel booking #${bookingId}? Seats will be immediately released back into the event availability pool.`)) {
        return;
    }

    if (state.config.mode === 'REAL') {
        try {
            const res = await fetch(`${state.config.gatewayUrl}/api/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${state.config.jwtToken}`
                }
            });
            if (!res.ok) throw new Error("Microservice cancellation endpoint error");
        } catch (err) {
            showToast(`Backend notification: ${err.message}. Updated locally.`, "info");
        }
    }

    booking.booking_status = 'CANCELLED';

    const evt = state.events.find(e => e.event_id === booking.event_id);
    if (evt) {
        evt.available_seats = Math.min(evt.total_seats, evt.available_seats + booking.seats_booked);
    }

    saveData();
    renderBookings();
    renderTrendingEvents();
    renderEvents();
    showToast(`Booking #${bookingId} successfully cancelled! Seats released.`, "success");
}

function updateBookingCountBadge() {
    const activeCount = state.bookings.filter(b => b.booking_status === 'CONFIRMED').length;
    const badge = document.getElementById('user-booking-count');
    if (badge) badge.innerText = activeCount;
}

// ADMIN PORTAL & USER DATA LOG AUDIT
function renderAdminTable() {
    const tbody = document.getElementById('admin-events-body');
    const logsBody = document.getElementById('admin-bookings-log-body');
    const revenueLabel = document.getElementById('admin-total-revenue');

    if (tbody) {
        tbody.innerHTML = state.events.map(evt => `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer;" 
                onclick="viewEventDetailModal('${evt.event_id}')"
                title="Click to view deep event analytics & attendees">
                <td style="padding: 1rem; font-weight: 800; color: var(--accent-cyan);">${evt.event_id}</td>
                <td style="padding: 1rem; font-weight: 600; color: white;">${evt.event_name}</td>
                <td style="padding: 1rem; color: #94a3b8;">${evt.location}</td>
                <td style="padding: 1rem; color: #94a3b8;">${evt.event_date}</td>
                <td style="padding: 1rem; font-weight: 700;">${evt.available_seats} / ${evt.total_seats}</td>
                <td style="padding: 1rem; color: var(--primary); font-weight: 800;">₹${evt.price.toLocaleString('en-IN')}</td>
                <td style="padding: 1rem; text-align: right;" onclick="event.stopPropagation()">
                    <button class="btn btn-secondary btn-sm" onclick="editEvent('${evt.event_id}')" style="margin-right: 0.5rem;">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEvent('${evt.event_id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    if (logsBody) {
        logsBody.innerHTML = state.bookings.map(b => `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer; transition: background 0.25s;" 
                onclick="viewUserDetailModal('${b.user_id}')"
                title="Click to inspect User Profile & full booking history">
                <td style="padding: 1rem; font-weight: 800; color: white;">${b.booking_id}</td>
                <td style="padding: 1rem; font-weight: 700; color: var(--accent-cyan);">${b.user_id} (${b.user_email || 'N/A'})</td>
                <td style="padding: 1rem; font-weight: 700; color: var(--primary);">${b.event_name}</td>
                <td style="padding: 1rem; color: #e2e8f0; font-weight: 600;">${b.seats_list ? b.seats_list.join(', ') : b.seats_booked}</td>
                <td style="padding: 1rem; color: var(--accent-green); font-weight: 800;">₹${(b.total_price || 298).toLocaleString('en-IN')}</td>
                <td style="padding: 1rem; color: var(--accent-cyan); font-weight: 700;">${b.payment_method || 'UPI'}</td>
                <td style="padding: 1rem; color: #94a3b8;">${b.created_at}</td>
            </tr>
        `).join('');
    }

    if (revenueLabel) {
        const totalRev = state.bookings.filter(b => b.booking_status === 'CONFIRMED').reduce((sum, b) => sum + (b.total_price || 0), 0);
        revenueLabel.innerText = `₹${totalRev.toLocaleString('en-IN')}`;
    }
}

function openCreateEventModal() {
    document.getElementById('admin-modal-title').innerText = 'Create New Event';
    document.getElementById('event-form').reset();
    document.getElementById('event-id-hidden').value = '';
    openModal('adminModal');
}

function editEvent(eventId) {
    const evt = state.events.find(e => e.event_id === eventId);
    if (!evt) return;

    document.getElementById('admin-modal-title').innerText = `Edit Event: ${evt.event_id}`;
    document.getElementById('event-id-hidden').value = evt.event_id;
    document.getElementById('event-name-input').value = evt.event_name;
    document.getElementById('event-category-input').value = evt.category;
    document.getElementById('event-location-input').value = evt.location;
    document.getElementById('event-date-input').value = evt.event_date;
    document.getElementById('event-seats-input').value = evt.total_seats;
    document.getElementById('event-price-input').value = evt.price;
    document.getElementById('event-image-input').value = evt.image;

    openModal('adminModal');
}

async function handleSaveEvent(e) {
    e.preventDefault();

    const hiddenId = document.getElementById('event-id-hidden').value;
    const isEdit = !!hiddenId;
    const eventId = isEdit ? hiddenId : `EVT-${Math.floor(100 + Math.random() * 900)}`;

    const totalSeats = parseInt(document.getElementById('event-seats-input').value);

    const eventData = {
        event_id: eventId,
        event_name: document.getElementById('event-name-input').value,
        category: document.getElementById('event-category-input').value,
        location: document.getElementById('event-location-input').value,
        event_date: document.getElementById('event-date-input').value,
        total_seats: totalSeats,
        available_seats: isEdit ? Math.min(totalSeats, state.events.find(ev => ev.event_id === hiddenId).available_seats) : totalSeats,
        price: parseFloat(document.getElementById('event-price-input').value),
        image: document.getElementById('event-image-input').value || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
        description: 'Spectacular live event in India.'
    };

    if (state.config.mode === 'REAL') {
        try {
            const url = isEdit ? `${state.config.gatewayUrl}/api/events/${eventId}` : `${state.config.gatewayUrl}/api/events`;
            const method = isEdit ? 'PUT' : 'POST';

            await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.config.jwtToken}`
                },
                body: JSON.stringify(eventData)
            });
        } catch (err) {
            showToast(`Backend warning: ${err.message}. Saved to local state.`, "info");
        }
    }

    if (isEdit) {
        const idx = state.events.findIndex(ev => ev.event_id === hiddenId);
        if (idx > -1) state.events[idx] = eventData;
    } else {
        state.events.unshift(eventData);
    }

    saveData();
    renderTrendingEvents();
    renderEvents();
    renderAdminTable();
    closeModal('adminModal');
    showToast(`Event '${eventData.event_name}' successfully ${isEdit ? 'updated' : 'created'}!`, "success");
}

function deleteEvent(eventId) {
    if (!confirm(`Delete event #${eventId}?`)) return;
    state.events = state.events.filter(e => e.event_id !== eventId);
    saveData();
    renderTrendingEvents();
    renderEvents();
    renderAdminTable();
    showToast(`Event #${eventId} deleted!`, "success");
}

// GATEWAY CONFIG
function openGatewayModal() {
    document.getElementById('config-mode-select').value = state.config.mode;
    document.getElementById('config-gateway-url').value = state.config.gatewayUrl;
    document.getElementById('config-jwt-token').value = state.config.jwtToken;
    toggleApiModeSelect();
    openModal('gatewayModal');
}

function toggleApiModeSelect() {
    const mode = document.getElementById('config-mode-select').value;
    document.getElementById('real-api-settings').style.display = mode === 'REAL' ? 'block' : 'none';
}

function saveGatewayConfig() {
    state.config.mode = document.getElementById('config-mode-select').value;
    state.config.gatewayUrl = document.getElementById('config-gateway-url').value;
    state.config.jwtToken = document.getElementById('config-jwt-token').value;

    saveData();
    updateApiStatusPill();
    closeModal('gatewayModal');
    showToast(`API Configuration updated! Operating mode: ${state.config.mode}`, "success");
}

function updateApiStatusPill() {
    const pill = document.getElementById('api-status-btn');
    const text = document.getElementById('api-status-text');

    if (!pill || !text) return;

    if (state.config.mode === 'REAL') {
        pill.classList.remove('mock-mode');
        text.innerText = 'Live Gateway API';
    } else {
        pill.classList.add('mock-mode');
        text.innerText = 'Mock Mode (Active)';
    }
}

// MODALS & TOASTS
function openModal(id) {
    document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: 'fa-circle-check',
        error: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    toast.innerHTML = `
        <i class="fa-solid ${iconMap[type] || 'fa-bell'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
