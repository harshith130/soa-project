import React, { useEffect, useRef, useState } from 'react'
import { cancelBooking, changePassword, createBooking, createEvent, createNotification, deleteEvent, forgotPassword, getAdminNotifications, getAllBookings, getBookingsByEvent, getBookingsByUser, getEvent, getEvents, getUserNotifications, getUsers, login, markAllAdminNotificationsRead, markAllUserNotificationsRead, markNotificationRead, registerUser, resetPassword, updateEvent, updateUserProfile } from './api'

const POPULAR_CITIES = [
  { name: "Mumbai", icon: "fa-landmark-flag", landmark: "Gateway of India" },
  { name: "Delhi-NCR", icon: "fa-monument", landmark: "India Gate" },
  { name: "Bengaluru", icon: "fa-building-columns", landmark: "Vidhana Soudha" },
  { name: "Hyderabad", icon: "fa-gopuram", landmark: "Charminar" },
  { name: "Goa", icon: "fa-umbrella-beach", landmark: "Vagator Beach" },
  { name: "Chandigarh", icon: "fa-hand", landmark: "Open Hand" },
  { name: "Pune", icon: "fa-chess-rook", landmark: "Shaniwar Wada" },
  { name: "Chennai", icon: "fa-vihara", landmark: "Kapaleeshwarar" },
  { name: "Kolkata", icon: "fa-place-of-worship", landmark: "Victoria Memorial" }
]

const CATEGORY_IMAGES = {
  Music: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  Tech: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
  Sports: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
  Arts: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=800&q=80',
  Default: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
}

// Timezone-safe local date utilities (YYYY-MM-DD)
export const getTodayLocalDateStr = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatToInputDateStr = (dateVal) => {
  if (!dateVal) return getTodayLocalDateStr()
  const str = String(dateVal).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  try {
    const d = new Date(str)
    if (isNaN(d.getTime())) return getTodayLocalDateStr()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return getTodayLocalDateStr()
  }
}

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('stagefront-user') || 'null'))
  const [activeRole, setActiveRole] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('stagefront-user') || 'null')
    return saved?.role === 'ADMIN' ? 'ADMIN' : 'USER'
  })
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('stagefront-user') || 'null')
    return saved?.role === 'ADMIN'
  })
  const [page, setPage] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('stagefront-user') || 'null')
    return saved?.role === 'ADMIN' ? 'admin-events' : 'home'
  })

  const [selectedCity, setSelectedCity] = useState('Hyderabad')
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('stagefront-wishlist') || '[]'))
  const [toasts, setToasts] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Preferences
  const [eventNotifsPref, setEventNotifsPref] = useState(() => JSON.parse(localStorage.getItem('stagefront-pref-event-notifs') ?? 'true'))
  const [bookingNotifsPref, setBookingNotifsPref] = useState(() => JSON.parse(localStorage.getItem('stagefront-pref-booking-notifs') ?? 'true'))

  // Modals state
  const [cityModalOpen, setCityModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false)
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false)
  const [forgotEmailTarget, setForgotEmailTarget] = useState('')
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false)
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false)
  
  // Admin Action Modals
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false)
  const [editEventModalOpen, setEditEventModalOpen] = useState(false)
  const [deleteEventModalOpen, setDeleteEventModalOpen] = useState(false)
  const [viewEventModalOpen, setViewEventModalOpen] = useState(false)
  const [eventBookingsModalOpen, setEventBookingsModalOpen] = useState(false)
  const [eventAnalyticsModalOpen, setEventAnalyticsModalOpen] = useState(false)
  const [bookingInspectModalOpen, setBookingInspectModalOpen] = useState(false)

  const [targetEventForEdit, setTargetEventForEdit] = useState(null)
  const [targetEventForDelete, setTargetEventForDelete] = useState(null)
  const [targetEventForView, setTargetEventForView] = useState(null)
  const [targetEventForBookings, setTargetEventForBookings] = useState(null)
  const [targetEventForAnalytics, setTargetEventForAnalytics] = useState(null)
  const [targetBookingForInspect, setTargetBookingForInspect] = useState(null)

  const [notifModalOpen, setNotifModalOpen] = useState(false)
  const [seatModalOpen, setSeatModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false)

  // Active targets
  const [activeBookingEvent, setActiveBookingEvent] = useState(null)
  const [pendingBookingEvent, setPendingBookingEvent] = useState(null)
  const [lastConfirmedBooking, setLastConfirmedBooking] = useState(null)
  const [inspectUser, setInspectUser] = useState(null)

  // Refresh trigger for events
  const [eventListRefreshKey, setEventListRefreshKey] = useState(0)
  const triggerEventsRefresh = () => setEventListRefreshKey(k => k + 1)

  // Real Notifications State
  const [notificationsState, setNotificationsState] = useState({ loading: true, error: '', items: [] })

  const loadNotifications = () => {
    setNotificationsState(prev => ({ ...prev, loading: true, error: '' }))
    if (activeRole === 'ADMIN') {
      getAdminNotifications()
        .then(items => setNotificationsState({ loading: false, error: '', items: items || [] }))
        .catch(err => setNotificationsState({ loading: false, error: err.message || 'Unable to load notifications.', items: [] }))
    } else if (user && (user.id || user.userId)) {
      getUserNotifications(user.id || user.userId)
        .then(items => setNotificationsState({ loading: false, error: '', items: items || [] }))
        .catch(err => setNotificationsState({ loading: false, error: err.message || 'Unable to load notifications.', items: [] }))
    } else {
      setNotificationsState({ loading: false, error: '', items: [] })
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user, activeRole, eventListRefreshKey])

  const unreadNotifsCount = notificationsState.items.filter(n => !n.isRead).length

  // Mouse image preview state
  const [mousePreview, setMousePreview] = useState({ active: false, img: '', label: '', x: 0, y: 0 })

  const showToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  const showMouseImage = (imgUrl, label) => setMousePreview(prev => ({ ...prev, active: true, img: imgUrl, label }))
  const hideMouseImage = () => setMousePreview(prev => ({ ...prev, active: false }))

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePreview(prev => ({ ...prev, x: e.clientX, y: e.clientY }))
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleRoleChange = (role) => {
    if (role === 'ADMIN') {
      if (user && user.role === 'ADMIN') {
        setActiveRole('ADMIN')
        setAdminLoggedIn(true)
        setPage('admin-events')
        showToast("ADMIN MODE ACTIVE: Event Management Controls Enabled", "success")
      } else {
        setAdminLoginModalOpen(true)
      }
    } else {
      setActiveRole('USER')
      setPage('home')
      showToast("Switched to USER MODE View", "info")
    }
  }

  const toggleWishlist = (eventId, e) => {
    if (e) e.stopPropagation()
    let updated
    if (wishlist.includes(eventId)) {
      updated = wishlist.filter(id => id !== eventId)
      showToast("Removed from Wishlist", "info")
    } else {
      updated = [...wishlist, eventId]
      showToast("Added to ❤️ Wishlist!", "success")
      if (window.confetti) window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } })
    }
    setWishlist(updated)
    localStorage.setItem('stagefront-wishlist', JSON.stringify(updated))
  }

  return (
    <div>
      <CustomCursor />
      <ParticlesCanvas />
      <ToastContainer toasts={toasts} />
      <MouseTooltip preview={mousePreview} />

      {/* Marquee Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-move">
          <div className="ticker-item"><i className="fa-solid fa-fire text-amber-400" /> SUNBURN GOA FESTIVAL 2026</div>
          <div className="ticker-item"><i className="fa-solid fa-bolt text-pink-400" /> INDIA AI & TECH SUMMIT BENGALURU</div>
          <div className="ticker-item"><i className="fa-solid fa-shield-halved text-cyan-400" /> REAL-TIME SEAT LOCKING & MICROSERVICE SYNC</div>
          <div className="ticker-item"><i className="fa-solid fa-crown text-amber-400" /> VIP PASSES AVAILABLE IN RUPEES (₹)</div>
          <div className="ticker-item"><i className="fa-solid fa-fire text-amber-400" /> SUNBURN GOA FESTIVAL 2026</div>
        </div>
      </div>

      {/* Top Navbar */}
      <Navbar
        page={page}
        setPage={setPage}
        user={user}
        setUser={setUser}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        handleRoleChange={handleRoleChange}
        adminLoggedIn={adminLoggedIn}
        setAdminLoggedIn={setAdminLoggedIn}
        selectedCity={selectedCity}
        setCityModalOpen={setCityModalOpen}
        setAuthModalOpen={setAuthModalOpen}
        setAuthMode={setAuthMode}
        setNotifModalOpen={setNotifModalOpen}
        unreadNotifsCount={unreadNotifsCount}
        wishlistCount={wishlist.length}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        showToast={showToast}
      />

      {/* Main Content Area */}
      <main style={{ minHeight: '100vh', paddingTop: '31px' }}>
        {page === 'home' && (
          <HomePage
            user={user}
            wishlistCount={wishlist.length}
            unreadNotifsCount={unreadNotifsCount}
            setPage={setPage}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            showMouseImage={showMouseImage}
            hideMouseImage={hideMouseImage}
            refreshKey={eventListRefreshKey}
            onBookEvent={(event) => {
              if (!user) {
                setPendingBookingEvent(event)
                setAuthMode('login')
                setAuthModalOpen(true)
                showToast('Please sign in before booking tickets.', 'info')
                return
              }
              setActiveBookingEvent(event)
              setSeatModalOpen(true)
            }}
          />
        )}

        {page === 'events' && (
          <EventsPage
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            showMouseImage={showMouseImage}
            hideMouseImage={hideMouseImage}
            refreshKey={eventListRefreshKey}
            onBookEvent={(event) => {
              if (!user) {
                setPendingBookingEvent(event)
                setAuthMode('login')
                setAuthModalOpen(true)
                showToast('Please sign in before booking tickets.', 'info')
                return
              }
              setActiveBookingEvent(event)
              setSeatModalOpen(true)
            }}
          />
        )}

        {page === 'wishlist' && (
          <WishlistPage
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            refreshKey={eventListRefreshKey}
            onBookEvent={(event) => {
              if (!user) {
                setPendingBookingEvent(event)
                setAuthMode('login')
                setAuthModalOpen(true)
                showToast('Please sign in before booking tickets.', 'info')
                return
              }
              setActiveBookingEvent(event)
              setSeatModalOpen(true)
            }}
          />
        )}

        {page === 'bookings' && (
          <BookingsPage
            user={user}
            setAuthModalOpen={setAuthModalOpen}
            triggerEventsRefresh={triggerEventsRefresh}
            onViewTicket={(booking) => {
              setLastConfirmedBooking(booking)
              setConfirmationModalOpen(true)
            }}
            showToast={showToast}
          />
        )}

        {page === 'notifications' && (
          <NotificationsPage
            activeRole={activeRole}
            user={user}
            state={notificationsState}
            onRefresh={loadNotifications}
            onMarkRead={async (id) => {
              try {
                await markNotificationRead(id)
                setNotificationsState(prev => ({
                  ...prev,
                  items: prev.items.map(n => n.id === id ? { ...n, isRead: true } : n)
                }))
              } catch (err) {
                showToast("Failed to mark as read", "error")
              }
            }}
            onMarkAllRead={async () => {
              try {
                if (activeRole === 'ADMIN') {
                  await markAllAdminNotificationsRead()
                } else if (user) {
                  await markAllUserNotificationsRead(user.id || user.userId)
                }
                setNotificationsState(prev => ({
                  ...prev,
                  items: prev.items.map(n => ({ ...n, isRead: true }))
                }))
                showToast("All notifications marked as read", "success")
              } catch (err) {
                showToast("Failed to mark all read", "error")
              }
            }}
          />
        )}

        {page === 'users' && (
          <UsersPage
            onInspectUser={(u) => {
              setInspectUser(u)
              setUserDetailModalOpen(true)
            }}
          />
        )}

        {page === 'profile' && (
          <ProfilePage
            user={user}
            setPage={setPage}
            setAuthModalOpen={setAuthModalOpen}
            onOpenEditProfile={() => setEditProfileModalOpen(true)}
            onOpenChangePassword={() => setChangePasswordModalOpen(true)}
          />
        )}

        {page === 'settings' && (
          <SettingsPage
            user={user}
            setPage={setPage}
            setAuthModalOpen={setAuthModalOpen}
            eventNotifs={eventNotifsPref}
            setEventNotifs={(val) => {
              setEventNotifsPref(val)
              localStorage.setItem('stagefront-pref-event-notifs', JSON.stringify(val))
              showToast(`Event notifications ${val ? 'enabled' : 'disabled'}`, 'info')
            }}
            bookingNotifs={bookingNotifsPref}
            setBookingNotifs={(val) => {
              setBookingNotifsPref(val)
              localStorage.setItem('stagefront-pref-booking-notifs', JSON.stringify(val))
              showToast(`Booking notifications ${val ? 'enabled' : 'disabled'}`, 'info')
            }}
            onOpenEditProfile={() => setEditProfileModalOpen(true)}
            onOpenChangePassword={() => setChangePasswordModalOpen(true)}
            onOpenForgotPassword={() => {
              setForgotEmailTarget(user?.email || '')
              setForgotPasswordModalOpen(true)
            }}
            onLogout={() => {
              setUser(null)
              localStorage.removeItem('stagefront-user')
              setAdminLoggedIn(false)
              setActiveRole('USER')
              setPage('home')
              showToast("Logged out successfully", "info")
            }}
          />
        )}

        {page === 'admin-events' && (
          <AdminEventsPage
            refreshKey={eventListRefreshKey}
            onOpenViewModal={(evt) => {
              setTargetEventForView(evt)
              setViewEventModalOpen(true)
            }}
            onOpenCreateModal={() => setCreateEventModalOpen(true)}
            onOpenEditModal={(evt) => {
              setTargetEventForEdit(evt)
              setEditEventModalOpen(true)
            }}
            onOpenBookingsModal={(evt) => {
              setTargetEventForBookings(evt)
              setEventBookingsModalOpen(true)
            }}
            onOpenAnalyticsModal={(evt) => {
              setTargetEventForAnalytics(evt)
              setEventAnalyticsModalOpen(true)
            }}
            onOpenDeleteModal={(evt) => {
              setTargetEventForDelete(evt)
              setDeleteEventModalOpen(true)
            }}
          />
        )}

        {page === 'admin-users' && (
          <AdminUsersPage
            onInspectUser={(u) => {
              setInspectUser(u)
              setUserDetailModalOpen(true)
            }}
          />
        )}
      </main>

      {/* Modals */}
      {cityModalOpen && (
        <CityModal
          selectedCity={selectedCity}
          onSelectCity={(c) => {
            setSelectedCity(c)
            setCityModalOpen(false)
            showToast(`Location set to ${c}`, "success")
          }}
          onClose={() => setCityModalOpen(false)}
        />
      )}

      {authModalOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onLoginSuccess={(u) => {
            setUser(u)
            localStorage.setItem('stagefront-user', JSON.stringify(u))
            setAuthModalOpen(false)
            if (u.role === 'ADMIN') {
              setAdminLoggedIn(true)
              setActiveRole('ADMIN')
              setPage('admin-events')
              showToast(`Welcome back, ${u.name || 'Admin'}! (Admin Mode Active)`, 'success')
            } else {
              setAdminLoggedIn(false)
              setActiveRole('USER')
              showToast(`Welcome back, ${u.name || 'User'}!`, 'success')
              if (pendingBookingEvent) {
                setActiveBookingEvent(pendingBookingEvent)
                setSeatModalOpen(true)
                setPendingBookingEvent(null)
              }
            }
          }}
          onOpenForgotPassword={(email) => {
            setForgotEmailTarget(email || '')
            setAuthModalOpen(false)
            setForgotPasswordModalOpen(true)
          }}
          onClose={() => setAuthModalOpen(false)}
          showToast={showToast}
        />
      )}

      {adminLoginModalOpen && (
        <AdminLoginModal
          onSuccess={(u) => {
            setUser(u)
            localStorage.setItem('stagefront-user', JSON.stringify(u))
            setAdminLoggedIn(true)
            setActiveRole('ADMIN')
            setAdminLoginModalOpen(false)
            setPage('admin-events')
            showToast(`Admin Session Authenticated! Welcome, ${u.name || 'Admin'}`, "success")
          }}
          onOpenForgotPassword={(email) => {
            setForgotEmailTarget(email || '')
            setAdminLoginModalOpen(false)
            setForgotPasswordModalOpen(true)
          }}
          onClose={() => setAdminLoginModalOpen(false)}
          showToast={showToast}
        />
      )}

      {forgotPasswordModalOpen && (
        <ForgotPasswordModal
          initialEmail={forgotEmailTarget}
          onSuccess={() => {
            setForgotPasswordModalOpen(false)
            setAuthMode('login')
            setAuthModalOpen(true)
          }}
          onClose={() => setForgotPasswordModalOpen(false)}
          showToast={showToast}
        />
      )}

      {changePasswordModalOpen && user && (
        <ChangePasswordModal
          user={user}
          onSuccess={() => {
            setChangePasswordModalOpen(false)
            showToast("Password changed successfully.", "success")
          }}
          onClose={() => setChangePasswordModalOpen(false)}
          showToast={showToast}
        />
      )}

      {editProfileModalOpen && user && (
        <EditProfileModal
          user={user}
          onSuccess={(updatedUser) => {
            const merged = { ...user, ...updatedUser }
            setUser(merged)
            localStorage.setItem('stagefront-user', JSON.stringify(merged))
            setEditProfileModalOpen(false)
            showToast("Profile updated successfully.", "success")
          }}
          onClose={() => setEditProfileModalOpen(false)}
          showToast={showToast}
        />
      )}

      {createEventModalOpen && (
        <CreateEventModal
          onSuccess={() => {
            setCreateEventModalOpen(false)
            triggerEventsRefresh()
            showToast("Event created successfully.", "success")
            setActiveRole('USER')
            setPage('events')
          }}
          onClose={() => setCreateEventModalOpen(false)}
          showToast={showToast}
        />
      )}

      {editEventModalOpen && targetEventForEdit && (
        <EditEventModal
          event={targetEventForEdit}
          onSuccess={() => {
            setEditEventModalOpen(false)
            setTargetEventForEdit(null)
            triggerEventsRefresh()
            showToast("Event updated successfully.", "success")
          }}
          onClose={() => {
            setEditEventModalOpen(false)
            setTargetEventForEdit(null)
          }}
          showToast={showToast}
        />
      )}

      {deleteEventModalOpen && targetEventForDelete && (
        <DeleteEventModal
          event={targetEventForDelete}
          onSuccess={() => {
            setDeleteEventModalOpen(false)
            setTargetEventForDelete(null)
            triggerEventsRefresh()
            showToast("Event deleted successfully.", "success")
          }}
          onClose={() => {
            setDeleteEventModalOpen(false)
            setTargetEventForDelete(null)
          }}
          showToast={showToast}
        />
      )}

      {viewEventModalOpen && targetEventForView && (
        <EventViewModal
          event={targetEventForView}
          onClose={() => {
            setViewEventModalOpen(false)
            setTargetEventForView(null)
          }}
        />
      )}

      {eventBookingsModalOpen && targetEventForBookings && (
        <EventBookingsModal
          event={targetEventForBookings}
          onInspectBooking={(b) => {
            setTargetBookingForInspect(b)
            setBookingInspectModalOpen(true)
          }}
          onRefreshEvent={triggerEventsRefresh}
          onClose={() => {
            setEventBookingsModalOpen(false)
            setTargetEventForBookings(null)
          }}
          showToast={showToast}
        />
      )}

      {bookingInspectModalOpen && targetBookingForInspect && (
        <BookingInspectModal
          booking={targetBookingForInspect}
          event={targetEventForBookings}
          onClose={() => {
            setBookingInspectModalOpen(false)
            setTargetBookingForInspect(null)
          }}
        />
      )}

      {eventAnalyticsModalOpen && targetEventForAnalytics && (
        <EventAnalyticsModal
          event={targetEventForAnalytics}
          onClose={() => {
            setEventAnalyticsModalOpen(false)
            setTargetEventForAnalytics(null)
          }}
        />
      )}

      {notifModalOpen && (
        <NotifModal
          activeRole={activeRole}
          user={user}
          state={notificationsState}
          onRefresh={loadNotifications}
          onOpenFullPage={() => {
            setNotifModalOpen(false)
            setPage('notifications')
          }}
          onMarkRead={async (id) => {
            try {
              await markNotificationRead(id)
              setNotificationsState(prev => ({
                ...prev,
                items: prev.items.map(n => n.id === id ? { ...n, isRead: true } : n)
              }))
            } catch (err) {
              showToast("Failed to mark as read", "error")
            }
          }}
          onMarkAllRead={async () => {
            try {
              if (activeRole === 'ADMIN') {
                await markAllAdminNotificationsRead()
              } else if (user) {
                await markAllUserNotificationsRead(user.id || user.userId)
              }
              setNotificationsState(prev => ({
                ...prev,
                items: prev.items.map(n => ({ ...n, isRead: true }))
              }))
              showToast("All notifications marked as read", "success")
            } catch (err) {
              showToast("Failed to mark all as read", "error")
            }
          }}
          onClose={() => setNotifModalOpen(false)}
        />
      )}

      {seatModalOpen && activeBookingEvent && (
        <SeatModal
          event={activeBookingEvent}
          onProceed={(selectedSeats) => {
            setActiveBookingEvent(prev => ({ ...prev, selectedSeats }))
            setSeatModalOpen(false)
            setPaymentModalOpen(true)
          }}
          onClose={() => setSeatModalOpen(false)}
        />
      )}

      {paymentModalOpen && activeBookingEvent && (
        <PaymentModal
          event={activeBookingEvent}
          user={user}
          onPaymentComplete={async (paymentMethod) => {
            try {
              const numSeats = activeBookingEvent.selectedSeats?.length || 1
              const booking = await createBooking({
                userId: user.userId || user.id || 1,
                eventId: activeBookingEvent.id,
                numberOfSeats: numSeats,
                price: activeBookingEvent.price
              })
              booking.event = activeBookingEvent
              booking.paymentMethod = paymentMethod
              booking.selectedSeats = activeBookingEvent.selectedSeats
              setLastConfirmedBooking(booking)

              // Seat reduction in Event Service DB
              const currentAvail = activeBookingEvent.availableSeats !== undefined ? activeBookingEvent.availableSeats : (activeBookingEvent.totalSeats || 150)
              const newAvail = Math.max(0, currentAvail - numSeats)
              try {
                await updateEvent(activeBookingEvent.id, {
                  name: activeBookingEvent.name,
                  description: activeBookingEvent.description || 'Live stage experience in India.',
                  venue: activeBookingEvent.venue,
                  eventDate: activeBookingEvent.eventDate,
                  eventTime: activeBookingEvent.eventTime || '19:00:00',
                  category: activeBookingEvent.category || 'Music',
                  totalSeats: Number(activeBookingEvent.totalSeats || 150),
                  availableSeats: Number(newAvail),
                  price: Number(activeBookingEvent.price || 0)
                })
              } catch (e) {
                console.error('Failed to update event seats in event-service:', e)
              }

              setPaymentModalOpen(false)
              setConfirmationModalOpen(true)
              triggerEventsRefresh()
              showToast("Booking Confirmed & Synchronized with Gateway!", "success")

              // Real Notifications Creation
              createNotification({
                recipientUserId: user.userId || user.id || 1,
                recipientRole: 'USER',
                title: 'Booking Confirmed 🎉',
                message: `Your reservation for ${activeBookingEvent.name} (${numSeats} seats) is confirmed!`,
                type: 'BOOKING_CREATED',
                relatedId: booking.id
              }).catch(() => {})

              createNotification({
                recipientUserId: null,
                recipientRole: 'ADMIN',
                title: 'New Ticket Booking 🎟️',
                message: `${user.name || 'User'} booked ${numSeats} ticket(s) for ${activeBookingEvent.name}.`,
                type: 'BOOKING_CREATED',
                relatedId: booking.id
              }).catch(() => {})

              if (window.confetti) window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } })
            } catch (err) {
              showToast(err.message || "Failed to place booking", "error")
            }
          }}
          onClose={() => setPaymentModalOpen(false)}
        />
      )}

      {confirmationModalOpen && lastConfirmedBooking && (
        <ConfirmationModal
          booking={lastConfirmedBooking}
          onClose={() => setConfirmationModalOpen(false)}
          onViewBookings={() => {
            setConfirmationModalOpen(false)
            setPage('bookings')
          }}
        />
      )}

      {userDetailModalOpen && inspectUser && (
        <UserDetailModal user={inspectUser} onClose={() => setUserDetailModalOpen(false)} />
      )}
    </div>
  )
}

/* ==================== REDESIGNED NAVBAR ==================== */
function Navbar({
  page,
  setPage,
  user,
  setUser,
  activeRole,
  setActiveRole,
  handleRoleChange,
  adminLoggedIn,
  setAdminLoggedIn,
  selectedCity,
  setCityModalOpen,
  setAuthModalOpen,
  setAuthMode,
  setNotifModalOpen,
  unreadNotifsCount,
  wishlistCount,
  mobileMenuOpen,
  setMobileMenuOpen,
  showToast
}) {
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('stagefront-user')
    setAdminLoggedIn(false)
    setActiveRole('USER')
    setPage('home')
    setDropdownOpen(false)
    showToast("Logged out successfully.", "info")
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <div className="logo-container" onClick={() => setPage(activeRole === 'ADMIN' ? 'admin-events' : 'home')}>
          <div className="logo-icon"><i className="fa-solid fa-ticket-simple" /></div>
          <div className="logo-text">STAGEFRONT<span className="gradient-text">.in</span></div>
        </div>

        <button className="city-selector-btn" onClick={() => setCityModalOpen(true)} title="Select Your City">
          <i className="fa-solid fa-location-dot text-pink-500" />
          <span id="current-city-label">{selectedCity}</span>
          <i className="fa-solid fa-chevron-down text-xs text-slate-400" />
        </button>
      </div>

      <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`} id="nav-menu">
        {activeRole === 'USER' ? (
          <>
            <button className={`nav-link ${page === 'home' ? 'active' : ''}`} onClick={() => { setPage('home'); setMobileMenuOpen(false); }}>
              <i className="fa-solid fa-house" /> Home
            </button>
            <button className={`nav-link ${page === 'events' ? 'active' : ''}`} onClick={() => { setPage('events'); setMobileMenuOpen(false); }}>
              <i className="fa-solid fa-compass" /> Events
            </button>
            <button className={`nav-link ${page === 'wishlist' ? 'active' : ''}`} onClick={() => { setPage('wishlist'); setMobileMenuOpen(false); }}>
              <i className="fa-solid fa-heart text-pink-500" /> Wishlist
              <span className="badge-count">{wishlistCount}</span>
            </button>
            <button className={`nav-link ${page === 'bookings' ? 'active' : ''}`} onClick={() => { setPage('bookings'); setMobileMenuOpen(false); }}>
              <i className="fa-solid fa-bookmark" /> My Bookings
            </button>
          </>
        ) : (
          <>
            <button className={`nav-link ${page === 'admin-events' ? 'active' : ''}`} onClick={() => { setPage('admin-events'); setMobileMenuOpen(false); }}>
              <i className="fa-solid fa-house" /> Home
            </button>
            <button className={`nav-link ${page === 'events' ? 'active' : ''}`} onClick={() => { setPage('events'); setMobileMenuOpen(false); }}>
              <i className="fa-solid fa-compass" /> Events
            </button>
            <button className={`nav-link ${page === 'admin-users' ? 'active' : ''}`} onClick={() => { setPage('admin-users'); setMobileMenuOpen(false); }}>
              <i className="fa-solid fa-bookmark" /> Bookings
            </button>
          </>
        )}

        <button className={`nav-link ${page === 'notifications' ? 'active' : ''}`} onClick={() => { setNotifModalOpen(true); setMobileMenuOpen(false); }}>
          <i className="fa-solid fa-bell" /> Notifications
          {unreadNotifsCount > 0 && <span className="badge-count" style={{ background: 'var(--accent-red)' }}>{unreadNotifsCount}</span>}
        </button>
      </div>

      <div className="nav-auth-group">
        {user ? (
          <div className="profile-dropdown-container" ref={dropdownRef}>
            <button className="btn btn-secondary btn-sm" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '12px', color: 'white' }}>
                {initial}
              </span>
              <span id="nav-user-name" style={{ fontWeight: '800' }}>{user.name}</span>
              {user.role === 'ADMIN' && (
                <span className="admin-mini-badge">ADMIN</span>
              )}
              <i className={`fa-solid fa-chevron-down text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-header">
                  <div style={{ fontWeight: '900', color: 'white', fontSize: '0.95rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user.email}</div>
                  <span style={{ background: user.role === 'ADMIN' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(6, 182, 212, 0.2)', color: user.role === 'ADMIN' ? 'var(--primary)' : 'var(--accent-cyan)', padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '800', marginTop: '0.3rem', display: 'inline-block' }}>
                    Role: {user.role || 'USER'}
                  </span>
                </div>

                <button className="profile-dropdown-item" onClick={() => { setPage('profile'); setDropdownOpen(false); }}>
                  <i className="fa-solid fa-id-card text-pink-400" /> View Profile
                </button>

                <button className="profile-dropdown-item" onClick={() => { setPage('settings'); setDropdownOpen(false); }}>
                  <i className="fa-solid fa-sliders text-cyan-400" /> Settings
                </button>

                {user.role === 'ADMIN' && (
                  <button className="profile-dropdown-item" onClick={() => { handleRoleChange(activeRole === 'ADMIN' ? 'USER' : 'ADMIN'); setDropdownOpen(false); }}>
                    <i className="fa-solid fa-arrows-rotate text-purple-400" /> {activeRole === 'ADMIN' ? 'Switch to User Mode' : 'Switch to Admin Mode'}
                  </button>
                )}

                <button className="profile-dropdown-item danger" onClick={handleLogout}>
                  <i className="fa-solid fa-right-from-bracket" /> {activeRole === 'ADMIN' ? 'Admin Logout' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div id="auth-logged-out-group" style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}>
              <i className="fa-solid fa-right-to-bracket" /> Login
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}>
              <i className="fa-solid fa-user-plus" /> Register
            </button>
          </div>
        )}

        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><i className="fa-solid fa-bars" /></button>
      </div>
    </nav>
  )
}

/* ==================== USER & ADMIN PROFILE PAGE ==================== */
function ProfilePage({ user, setPage, setAuthModalOpen, onOpenEditProfile, onOpenChangePassword }) {
  if (!user) {
    return (
      <section className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', padding: '4rem', borderRadius: 'var(--radius-lg)', maxWidth: '600px', margin: '0 auto' }}>
          <i className="fa-solid fa-user-lock" style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.8rem', color: 'white' }}>Sign In Required</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Please sign in to view your profile details and settings.</p>
          <button className="btn btn-primary" onClick={() => setAuthModalOpen(true)}>
            <i className="fa-solid fa-right-to-bracket" /> Sign In Now
          </button>
        </div>
      </section>
    )
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U'
  const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Active Member'

  return (
    <section id="section-profile" className="container" style={{ paddingTop: '5rem', maxWidth: '850px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.1em' }}>STAGEFRONT USER IDENTITY</span>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginTop: '0.2rem' }}>
          {user.role === 'ADMIN' ? 'ADMIN' : 'USER'} <span className="gradient-text">PROFILE</span>
        </h2>
      </div>

      <div className="dashboard-banner-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'grid', placeItems: 'center', fontSize: '2.8rem', fontWeight: '900', color: 'white', boxShadow: 'var(--shadow-pink)', flexShrink: 0 }}>
            {initial}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'white' }}>{user.name}</h3>
              <span className={`mode-badge ${user.role === 'ADMIN' ? 'admin-mode-badge' : 'user-mode-badge'}`}>
                {user.role || 'USER'}
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.3rem' }}>{user.email}</p>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={onOpenEditProfile}>
              <i className="fa-solid fa-user-pen" /> Edit Profile
            </button>
            <button className="btn btn-secondary" onClick={() => setPage('settings')}>
              <i className="fa-solid fa-gear" /> Settings
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card-glow">
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Account ID</span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>USR-{user.id || user.userId || 1}</strong>
          </div>

          <div className="stat-card-glow">
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Phone Number</span>
            <strong style={{ fontSize: '1.1rem', color: 'white' }}>{user.phone || 'Not Provided'}</strong>
          </div>

          <div className="stat-card-glow">
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Member Since</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--accent-green)' }}>{createdDate}</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ==================== SETTINGS PAGE ==================== */
function SettingsPage({ user, setPage, setAuthModalOpen, eventNotifs, setEventNotifs, bookingNotifs, setBookingNotifs, onOpenEditProfile, onOpenChangePassword, onOpenForgotPassword, onLogout }) {
  if (!user) {
    return (
      <section className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', padding: '4rem', borderRadius: 'var(--radius-lg)', maxWidth: '600px', margin: '0 auto' }}>
          <i className="fa-solid fa-lock" style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.8rem', color: 'white' }}>Sign In Required</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Please sign in to manage account preferences and security settings.</p>
          <button className="btn btn-primary" onClick={() => setAuthModalOpen(true)}>
            <i className="fa-solid fa-right-to-bracket" /> Sign In Now
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="section-settings" className="container" style={{ paddingTop: '5rem', maxWidth: '850px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.1em' }}>ACCOUNT & PREFERENCES</span>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginTop: '0.2rem' }}>
          SETTINGS & <span className="gradient-text">SECURITY</span>
        </h2>
      </div>

      {/* ACCOUNT SECTION */}
      <div className="peaceful-card" style={{ padding: '1.8rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem' }}>
          <i className="fa-solid fa-user-gear text-pink-500" style={{ fontSize: '1.3rem' }} />
          <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '800' }}>Account Overview</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>FULL NAME</span>
            <strong style={{ color: 'white', fontSize: '1.1rem' }}>{user.name}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>REGISTERED EMAIL</span>
            <strong style={{ color: 'white', fontSize: '1.1rem' }}>{user.email}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>PHONE NUMBER</span>
            <strong style={{ color: 'white', fontSize: '1.1rem' }}>{user.phone || 'Not Provided'}</strong>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={onOpenEditProfile}>
          <i className="fa-solid fa-user-pen" /> Edit Name / Phone
        </button>
      </div>

      {/* SECURITY SECTION */}
      <div className="peaceful-card" style={{ padding: '1.8rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem' }}>
          <i className="fa-solid fa-shield-halved text-cyan-400" style={{ fontSize: '1.3rem' }} />
          <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '800' }}>Security & Authentication</h3>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h4 style={{ color: 'white', fontSize: '1rem' }}>Password Management</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Encrypted with BCrypt algorithm. Never stored in plain text.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button className="btn btn-primary btn-sm" onClick={onOpenChangePassword}>
              <i className="fa-solid fa-key" /> Change Password
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onOpenForgotPassword}>
              <i className="fa-solid fa-arrows-rotate" /> Forgot Password
            </button>
          </div>
        </div>
      </div>

      {/* PREFERENCES SECTION */}
      <div className="peaceful-card" style={{ padding: '1.8rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem' }}>
          <i className="fa-solid fa-sliders text-purple-400" style={{ fontSize: '1.3rem' }} />
          <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '800' }}>Notification Preferences</h3>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <strong style={{ color: 'white', display: 'block' }}>Upcoming Event Alerts</strong>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Receive alerts when new concerts or tech summits are announced.</span>
          </div>
          <label className="switch-toggle">
            <input type="checkbox" checked={eventNotifs} onChange={e => setEventNotifs(e.target.checked)} />
            <span className="slider-round" />
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0' }}>
          <div>
            <strong style={{ color: 'white', display: 'block' }}>Booking Confirmation Alerts</strong>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Receive digital pass generation alerts for ticket orders.</span>
          </div>
          <label className="switch-toggle">
            <input type="checkbox" checked={bookingNotifs} onChange={e => setBookingNotifs(e.target.checked)} />
            <span className="slider-round" />
          </label>
        </div>
      </div>

      {/* SESSION SECTION */}
      <div className="peaceful-card" style={{ padding: '1.8rem', borderColor: 'rgba(239,68,68,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#fca5a5', fontSize: '1rem' }}>Active Session Management</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sign out of StageFront on this device.</p>
          </div>
          <button className="btn btn-danger btn-sm" onClick={onLogout}>
            <i className="fa-solid fa-right-from-bracket" /> {user.role === 'ADMIN' ? 'Admin Logout' : 'Sign Out'}
          </button>
        </div>
      </div>
    </section>
  )
}

/* ==================== DEDICATED NOTIFICATIONS PAGE ==================== */
function NotificationsPage({ activeRole, user, state, onRefresh, onMarkRead, onMarkAllRead }) {
  const [filter, setFilter] = useState('All')

  const items = state.items.filter(n => {
    if (filter === 'Unread') return !n.isRead
    if (filter === 'Read') return n.isRead
    return true
  })

  return (
    <section id="section-notifications-page" className="container" style={{ paddingTop: '5rem', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
            {activeRole === 'ADMIN' ? 'ADMINISTRATOR AUDIT LOG' : 'PERSONAL UPDATES'}
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginTop: '0.2rem' }}>
            System <span className="gradient-text">Notifications</span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={onRefresh} title="Refresh Notifications">
            <i className={`fa-solid fa-arrows-rotate ${state.loading ? 'fa-spin' : ''}`} /> Refresh
          </button>
          {state.items.some(n => !n.isRead) && (
            <button className="btn btn-primary btn-sm" onClick={onMarkAllRead}>
              <i className="fa-solid fa-check-double" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', marginBottom: '1.5rem', width: 'fit-content' }}>
        {['All', 'Unread', 'Read'].map(f => (
          <button
            key={f}
            className={`pill-btn ${filter === f ? 'active' : ''}`}
            style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem', fontWeight: '700' }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {state.loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Loading notifications...</p>
        </div>
      ) : state.error ? (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', padding: '1.5rem', borderRadius: 'var(--radius-md)', color: '#fca5a5', textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem' }}>{state.error}</p>
          <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
            <i className="fa-solid fa-arrows-rotate" /> Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', color: '#94a3b8' }}>
          <i className="fa-solid fa-bell-slash" style={{ fontSize: '3rem', color: '#64748b', marginBottom: '1rem' }} />
          <h3 style={{ color: 'white' }}>No notifications found</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '0.3rem' }}>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {items.map(n => (
            <div key={n.id} className="peaceful-card" style={{ padding: '1.2rem 1.5rem', borderLeft: `4px solid ${n.isRead ? 'rgba(255,255,255,0.2)' : 'var(--primary)'}`, background: n.isRead ? 'rgba(15, 18, 42, 0.6)' : 'rgba(15, 20, 48, 0.9)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <i className={`fa-solid ${n.type === 'BOOKING_CREATED' ? 'fa-ticket text-green-400' : n.type === 'BOOKING_CANCELLED' ? 'fa-circle-xmark text-red-400' : n.type === 'EVENT_CREATED' ? 'fa-calendar-plus text-cyan-400' : 'fa-bell text-pink-400'}`} style={{ fontSize: '1.1rem' }} />
                  <strong style={{ fontSize: '1rem', color: 'white' }}>{n.title}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}
                  </span>
                  {!n.isRead && (
                    <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }} onClick={() => onMarkRead(n.id)}>
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ==================== EDIT PROFILE MODAL ==================== */
function EditProfileModal({ user, onSuccess, onClose, showToast }) {
  const [name, setName] = useState(user.name || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const updated = await updateUserProfile(user.id || user.userId || 1, { name, phone })
      onSuccess(updated)
    } catch (err) {
      setError(err.message || "Failed to update profile.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay active" id="editProfileModal">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div>
            <h3>Edit User Profile</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Update your personal profile details</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--accent-red)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1.2rem', fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input className="form-control" value={user.email} disabled style={{ opacity: 0.6 }} />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-control" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                <i className="fa-solid fa-floppy-disk" /> {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ==================== CHANGE PASSWORD MODAL ==================== */
function ChangePasswordModal({ user, onSuccess, onClose, showToast }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.")
      return
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }
    setLoading(true)
    setError('')
    try {
      await changePassword({
        email: user.email,
        currentPassword,
        newPassword,
        confirmPassword
      })
      onSuccess()
    } catch (err) {
      setError(err.message || "Failed to change password. Check current password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay active" id="changePasswordModal">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div>
            <h3>Change Password</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Update your account password securely</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--accent-red)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1.2rem', fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-control" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-control" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-control" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                <i className="fa-solid fa-key" /> {loading ? 'Updating Password...' : 'Change Password'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ==================== HOME PAGE (USER DASHBOARD) ==================== */
function HomePage({ user, wishlistCount, unreadNotifsCount, setPage, wishlist, toggleWishlist, showMouseImage, hideMouseImage, refreshKey, onBookEvent }) {
  const [eventsState, setEventsState] = useState({ loading: true, error: '', events: [] })
  const [myBookingsCount, setMyBookingsCount] = useState(0)

  const [videoPlaying, setVideoPlaying] = useState(true)
  const [videoMuted, setVideoMuted] = useState(true)
  const videoRef = useRef(null)

  useEffect(() => {
    setEventsState(prev => ({ ...prev, loading: true }))
    getEvents()
      .then(events => setEventsState({ loading: false, error: '', events }))
      .catch(err => setEventsState({ loading: false, error: err.message, events: [] }))
  }, [refreshKey])

  useEffect(() => {
    if (user?.userId || user?.id) {
      getBookingsByUser(user.userId || user.id)
        .then(res => setMyBookingsCount(res ? res.length : 0))
        .catch(() => setMyBookingsCount(0))
    }
  }, [user])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoPlaying) { videoRef.current.pause(); setVideoPlaying(false); }
    else { videoRef.current.play(); setVideoPlaying(true); }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoMuted
    setVideoMuted(!videoMuted)
  }

  const availEventsCount = eventsState.events.filter(e => (e.availableSeats || 0) > 0).length

  return (
    <section id="section-home">
      <div className="hero-viewport-100vh">
        <video ref={videoRef} id="hero-main-video" className="hero-full-video" autoPlay loop muted={videoMuted} playsInline preload="auto">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-crowd-at-a-concert-with-lights-41564-large.mp4" type="video/mp4" />
        </video>

        <div className="hero-video-cinematic-overlay" />

        <div className="hero-layered-content">
          <div className="hero-small-label">
            <i className="fa-solid fa-bolt" /> LIVE THE MOMENT • STAGEFRONT
          </div>
          <h1 className="hero-main-heading">
            Your Next <br />
            <span className="gradient-text">Unforgettable Experience.</span>
          </h1>
          <p className="hero-supporting-text">
            Discover concerts, festivals, tech summits, esports arenas, and theater performances across India with real-time seat selection in Rupees (₹).
          </p>

          <div className="hero-button-group">
            <button className="btn btn-primary" onClick={() => setPage('events')}>
              <i className="fa-solid fa-compass" /> EXPLORE EVENTS
            </button>
            <button className="btn btn-secondary" onClick={() => setPage('bookings')}>
              <i className="fa-solid fa-bookmark" /> MY BOOKINGS
            </button>
          </div>
        </div>

        <div className="hero-live-badge-group">
          <div className="live-pulse-pill">
            <div className="pulse-dot" />
            <span>● LIVE EXPERIENCES IN INDIA</span>
          </div>

          <div className="hero-video-controls">
            <button className="v-btn" onClick={togglePlay} title="Play / Pause Video">
              <i className={`fa-solid ${videoPlaying ? 'fa-pause' : 'fa-play'}`} id="video-play-icon" />
            </button>
            <button className="v-btn" onClick={toggleMute} title="Mute / Unmute Audio">
              <i className={`fa-solid ${videoMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`} id="video-mute-icon" />
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem', marginBottom: '5rem' }} id="user-dashboard-container">
        {/* USER DASHBOARD BANNER */}
        <div className="dashboard-banner-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.1em' }}>WELCOME BACK {user ? user.name?.toUpperCase() : 'GUEST'}</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', marginTop: '0.2rem' }}>
                USER <span className="gradient-text">DASHBOARD</span>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.3rem' }}>Real-time overview of live event availability, ticket reservations, and saved wishlist.</p>
            </div>
            <span className="mode-badge user-mode-badge" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-circle-check" /> USER ACCOUNT ACTIVE
            </span>
          </div>

          <div className="stats-grid">
            <div className="stat-card-glow" onClick={() => setPage('events')} style={{ cursor: 'pointer' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Available Events</span>
              <strong style={{ fontSize: '1.6rem', color: 'white' }}>{availEventsCount}</strong>
            </div>

            <div className="stat-card-glow" onClick={() => setPage('bookings')} style={{ cursor: 'pointer' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>My Bookings</span>
              <strong style={{ fontSize: '1.6rem', color: 'var(--accent-cyan)' }}>{myBookingsCount}</strong>
            </div>

            <div className="stat-card-glow" onClick={() => setPage('wishlist')} style={{ cursor: 'pointer' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Wishlist</span>
              <strong style={{ fontSize: '1.6rem', color: 'var(--primary)' }}>{wishlistCount}</strong>
            </div>

            <div className="stat-card-glow" onClick={() => setPage('notifications')} style={{ cursor: 'pointer' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Notifications</span>
              <strong style={{ fontSize: '1.6rem', color: 'var(--accent-gold)' }}>{unreadNotifsCount}</strong>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.1em' }}>POPULAR & FEATURED IN INDIA</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginTop: '0.2rem' }}>
            Trending <span className="gradient-text">Events</span>
          </h2>
        </div>

        {eventsState.loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }} />
            <p>Loading live events from Gateway API...</p>
          </div>
        ) : eventsState.error ? (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', padding: '1.5rem', borderRadius: 'var(--radius-md)', color: '#fca5a5' }}>
            {eventsState.error}
          </div>
        ) : eventsState.events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', color: '#94a3b8' }}>
            No events currently available in the system.
          </div>
        ) : (
          <div className="events-grid" id="home-trending-grid">
            {eventsState.events.slice(0, 6).map(evt => (
              <EventCard key={evt.id} event={evt} isWishlisted={wishlist.includes(evt.id)} onToggleWishlist={(e) => toggleWishlist(evt.id, e)} onBook={() => onBookEvent(evt)} showMouseImage={showMouseImage} hideMouseImage={hideMouseImage} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ==================== EVENTS PAGE ==================== */
function EventsPage({ wishlist, toggleWishlist, showMouseImage, hideMouseImage, refreshKey, onBookEvent }) {
  const [state, setState] = useState({ loading: true, error: '', events: [] })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [scheduleFilter, setScheduleFilter] = useState('All')

  useEffect(() => {
    setState(prev => ({ ...prev, loading: true }))
    getEvents()
      .then(events => setState({ loading: false, error: '', events }))
      .catch(err => setState({ loading: false, error: err.message, events: [] }))
  }, [refreshKey])

  const todayStr = getTodayLocalDateStr()

  const filtered = state.events.filter(evt => {
    const matchSearch = (evt.name || '').toLowerCase().includes(search.toLowerCase()) || (evt.venue || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || evt.category === category
    let matchSched = true
    if (scheduleFilter === 'Upcoming') matchSched = (evt.eventDate || '') >= todayStr
    if (scheduleFilter === 'Today') matchSched = (evt.eventDate || '') === todayStr
    if (scheduleFilter === 'Past') matchSched = (evt.eventDate || '') < todayStr
    return matchSearch && matchCat && matchSched
  })

  return (
    <section id="section-events" className="container" style={{ paddingTop: '5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white' }}>
          Explore <span className="gradient-text">Available Events</span>
        </h2>
        <p style={{ color: '#94a3b8' }}>Search and filter upcoming live experiences in India with real-time seat selection in Rupees (₹).</p>
      </div>

      <div className="filter-bar" id="events-search-bar" style={{ flexDirection: 'column', gap: '1.2rem' }}>
        <div style={{ display: 'flex', width: '100%', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-input-group" style={{ flex: 1 }}>
            <i className="fa-solid fa-magnifying-glass" />
            <input type="text" id="search-input" className="search-control" placeholder="Search event title, city, venue..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            {['All', 'Upcoming', 'Today', 'Past'].map(f => (
              <button
                key={f}
                className={`pill-btn ${scheduleFilter === f ? 'active' : ''}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                onClick={() => setScheduleFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="category-pills" id="category-filter-list">
          {['All', 'Music', 'Tech', 'Sports', 'Arts'].map(cat => (
            <button
              key={cat}
              className={`pill-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
              onMouseEnter={() => showMouseImage(CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.Default, `${cat} Events`)}
              onMouseLeave={hideMouseImage}
            >
              {cat === 'Music' && <i className="fa-solid fa-music" />}
              {cat === 'Tech' && <i className="fa-solid fa-laptop-code" />}
              {cat === 'Sports' && <i className="fa-solid fa-trophy" />}
              {cat === 'Arts' && <i className="fa-solid fa-palette" />}
              {cat} {cat === 'All' ? 'Events' : ''}
            </button>
          ))}
        </div>
      </div>

      {state.loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Loading events from StageFront Gateway...</p>
        </div>
      ) : state.error ? (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', padding: '1.5rem', borderRadius: 'var(--radius-md)', color: '#fca5a5' }}>
          {state.error}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', color: '#94a3b8' }}>
          <i className="fa-solid fa-compass" style={{ fontSize: '3rem', color: '#64748b', marginBottom: '1rem' }} />
          <h3>No events found matching criteria</h3>
        </div>
      ) : (
        <div className="events-grid" id="events-grid-container">
          {filtered.map(evt => (
            <EventCard key={evt.id} event={evt} isWishlisted={wishlist.includes(evt.id)} onToggleWishlist={(e) => toggleWishlist(evt.id, e)} onBook={() => onBookEvent(evt)} showMouseImage={showMouseImage} hideMouseImage={hideMouseImage} />
          ))}
        </div>
      )}
    </section>
  )
}

/* ==================== WISHLIST PAGE ==================== */
function WishlistPage({ wishlist, toggleWishlist, refreshKey, onBookEvent }) {
  const [state, setState] = useState({ loading: true, error: '', events: [] })

  useEffect(() => {
    getEvents()
      .then(events => setState({ loading: false, error: '', events }))
      .catch(err => setState({ loading: false, error: err.message, events: [] }))
  }, [refreshKey])

  const saved = state.events.filter(e => wishlist.includes(e.id))

  return (
    <section id="section-wishlist" className="container" style={{ paddingTop: '5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white' }}>
          My Saved <span className="gradient-text">Wishlist</span> ❤️
        </h2>
        <p style={{ color: '#94a3b8' }}>Keep track of upcoming concerts and festivals so you never miss out on tickets.</p>
      </div>

      {state.loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Loading wishlist events...</p>
        </div>
      ) : saved.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', color: '#94a3b8' }}>
          <i className="fa-solid fa-heart-crack" style={{ fontSize: '3.5rem', color: '#64748b', marginBottom: '1rem' }} />
          <h3>Your Wishlist is Empty</h3>
          <p>Click the ❤️ heart on any event card to save it for later!</p>
        </div>
      ) : (
        <div className="events-grid" id="wishlist-grid-container">
          {saved.map(evt => (
            <EventCard key={evt.id} event={evt} isWishlisted={true} onToggleWishlist={(e) => toggleWishlist(evt.id, e)} onBook={() => onBookEvent(evt)} />
          ))}
        </div>
      )}
    </section>
  )
}

/* ==================== EVENT CARD WITH CONTINUOUS 3D MOUSE TILT ==================== */
function EventCard({ event, isWishlisted, onToggleWishlist, onBook, showMouseImage, hideMouseImage }) {
  const cardRef = useRef(null)
  const reqRef = useRef(null)

  const imageUrl = CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.Default
  const total = event.totalSeats || 150
  const avail = event.availableSeats !== undefined ? event.availableSeats : 150
  const bookedPercent = Math.min(100, Math.round(((total - avail) / total) * 100))

  const handlePointerMove = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (e.pointerType === 'touch') return
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const normX = (x - centerX) / centerX
    const normY = (y - centerY) / centerY

    const maxRotX = 12
    const maxRotY = 14

    const rotX = -normY * maxRotX
    const rotY = normX * maxRotY

    if (reqRef.current) cancelAnimationFrame(reqRef.current)
    reqRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1000px) translateY(-10px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
        cardRef.current.style.transition = 'transform 0.08s ease-out'
      }
    })
  }

  const handlePointerLeave = () => {
    if (reqRef.current) cancelAnimationFrame(reqRef.current)
    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(1000px) translateY(0px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
      cardRef.current.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }
  }

  return (
    <article
      ref={cardRef}
      className="event-card"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="card-image-wrapper">
        <img src={imageUrl} alt={event.name} className="card-image" />
        <span className="category-tag">{event.category || 'Live'}</span>
        <button className={`wishlist-heart-btn ${isWishlisted ? 'active' : ''}`} onClick={onToggleWishlist} title="Toggle Wishlist">
          <i className={`fa-${isWishlisted ? 'solid' : 'regular'} fa-heart`} />
        </button>
        <span className="price-tag">₹{Number(event.price || 0).toLocaleString('en-IN')}</span>
      </div>

      <div className="card-body">
        <div className="event-date-row">
          <i className="fa-regular fa-calendar-days" />
          <span>{event.eventDate ? new Date(`${event.eventDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upcoming'} • {event.eventTime || '7:00 PM'}</span>
        </div>

        <h3 className="event-title" style={{ color: 'white' }}>{event.name}</h3>

        <div className="event-location">
          <i className="fa-solid fa-location-dot text-pink-500" />
          <span>{event.venue || 'Main Arena'}</span>
        </div>

        <div className="seats-availability">
          <div className="seats-info-row">
            <span>Seats availability</span>
            <strong style={{ color: avail < 20 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
              {avail} / {total} left
            </strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${bookedPercent}%` }} />
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={onBook} disabled={avail < 1}>
          <i className="fa-solid fa-ticket" /> {avail < 1 ? 'Sold Out' : 'Book Tickets'}
        </button>
      </div>
    </article>
  )
}

/* ==================== MY BOOKINGS PAGE ==================== */
function BookingsPage({ user, setAuthModalOpen, triggerEventsRefresh, onViewTicket, showToast }) {
  const [state, setState] = useState({ loading: true, error: '', bookings: [] })
  const [eventsMap, setEventsMap] = useState({})

  const fetchBookingsAndEvents = () => {
    if (!user) return
    setState(prev => ({ ...prev, loading: true }))
    Promise.all([
      getBookingsByUser(user.userId || user.id || 1),
      getEvents().catch(() => [])
    ])
      .then(([bookings, events]) => {
        const eMap = {}
        events.forEach(e => { eMap[e.id] = e })
        setEventsMap(eMap)
        setState({ loading: false, error: '', bookings: bookings || [] })
      })
      .catch(err => setState({ loading: false, error: err.message, bookings: [] }))
  }

  useEffect(() => {
    fetchBookingsAndEvents()
  }, [user])

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking reservation?")) return
    const bToCancel = state.bookings.find(b => b.id === bookingId)
    try {
      const updated = await cancelBooking(bookingId)
      setState(prev => ({
        ...prev,
        bookings: prev.bookings.map(b => b.id === bookingId ? updated : b)
      }))

      if (bToCancel) {
        try {
          const evt = await getEvent(bToCancel.eventId)
          const currentAvail = evt.availableSeats !== undefined ? evt.availableSeats : 0
          const totalS = evt.totalSeats || 150
          const restoredAvail = Math.min(totalS, currentAvail + (bToCancel.numberOfSeats || 1))
          await updateEvent(evt.id, {
            name: evt.name,
            description: evt.description || 'Live stage experience in India.',
            venue: evt.venue,
            eventDate: evt.eventDate,
            eventTime: evt.eventTime || '19:00:00',
            category: evt.category || 'Music',
            totalSeats: Number(totalS),
            availableSeats: Number(restoredAvail),
            price: Number(evt.price || 0)
          })
          if (triggerEventsRefresh) triggerEventsRefresh()
        } catch (e) {
          console.error("Seat restoration error:", e)
        }
      }

      createNotification({
        recipientUserId: null,
        recipientRole: 'ADMIN',
        title: 'Booking Cancellation ⚠️',
        message: `Reservation #${bookingId} was cancelled by user.`,
        type: 'BOOKING_CANCELLED',
        relatedId: bookingId
      }).catch(() => {})

      showToast("Booking cancelled & seat capacity restored!", "info")
    } catch (err) {
      showToast(err.message || "Failed to cancel booking", "error")
    }
  }

  if (!user) {
    return (
      <section className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', padding: '4rem', borderRadius: 'var(--radius-lg)', maxWidth: '600px', margin: '0 auto' }}>
          <i className="fa-solid fa-lock" style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.8rem', color: 'white' }}>Sign In Required</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Please sign in to view active ticket reservations and digital passes.</p>
          <button className="btn btn-primary" onClick={() => setAuthModalOpen(true)}>
            <i className="fa-solid fa-right-to-bracket" /> Sign In Now
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="section-bookings" className="container" style={{ paddingTop: '5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white' }}>
          My Event <span className="gradient-text">Bookings</span>
        </h2>
        <p style={{ color: '#94a3b8' }}>Manage active reservations, view digital ticket passes, or trigger instant seat release cancellations.</p>
      </div>

      {state.loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Loading bookings from Gateway API...</p>
        </div>
      ) : state.error ? (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', padding: '1.5rem', borderRadius: 'var(--radius-md)', color: '#fca5a5', textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem' }}>{state.error}</p>
          <button className="btn btn-secondary btn-sm" onClick={fetchBookingsAndEvents}>
            <i className="fa-solid fa-arrows-rotate" /> Retry
          </button>
        </div>
      ) : state.bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', color: '#94a3b8' }}>
          <i className="fa-solid fa-bookmark" style={{ fontSize: '3.5rem', color: '#64748b', marginBottom: '1rem' }} />
          <h3>No Active Bookings</h3>
        </div>
      ) : (
        <div className="bookings-list" id="bookings-list-container">
          {state.bookings.map(b => {
            const evt = eventsMap[b.eventId]
            const eventName = evt?.name || `Event EVT-${b.eventId}`
            const venue = evt?.venue || 'Main Arena'
            const eventDate = evt?.eventDate || 'Upcoming'

            return (
              <div key={b.id} className="booking-card" style={{ padding: '1.4rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>BOOKING REF</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {b.bookingReference || `STG-${b.id}`}
                  </div>
                  <div style={{ color: 'white', fontWeight: '800', marginTop: '0.3rem', fontSize: '1.05rem' }}>
                    {eventName}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    <i className="fa-solid fa-location-dot text-pink-500" style={{ marginRight: '0.3rem' }} /> {venue} • {eventDate}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>TICKETS</span>
                  <strong style={{ fontSize: '1.2rem', color: 'white' }}>{b.numberOfSeats} ticket(s)</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>TOTAL AMOUNT</span>
                  <strong style={{ fontSize: '1.3rem', color: 'var(--accent-green)' }}>₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span className={`status-badge ${b.status === 'CANCELLED' ? 'status-cancelled' : b.status === 'PENDING' ? 'status-pending' : 'status-confirmed'}`}>
                    {b.status || 'CONFIRMED'}
                  </span>

                  <button className="btn btn-secondary btn-sm" onClick={() => onViewTicket({ ...b, eventName, venue, eventDate })}>
                    <i className="fa-solid fa-qrcode" /> Pass
                  </button>

                  {b.status !== 'CANCELLED' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

/* ==================== USERS DIRECTORY PAGE ==================== */
function UsersPage({ onInspectUser }) {
  const [state, setState] = useState({ loading: true, error: '', users: [] })

  useEffect(() => {
    getUsers()
      .then(users => setState({ loading: false, error: '', users }))
      .catch(err => setState({ loading: false, error: err.message, users: [] }))
  }, [])

  return (
    <section id="section-users" className="container" style={{ paddingTop: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white' }}>
            Users <span className="gradient-text">Directory</span>
          </h2>
          <p style={{ color: '#94a3b8' }}>A clear, synchronized view of every registered account on StageFront microservices.</p>
        </div>
        <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid var(--accent-cyan)', padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>REGISTERED ACCOUNTS</span>
          <strong style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)' }}>{state.loading ? '...' : state.users.length}</strong>
        </div>
      </div>

      {state.loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }} />
          <p>Loading user accounts from Gateway...</p>
        </div>
      ) : state.error ? (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', padding: '1.5rem', borderRadius: 'var(--radius-md)', color: '#fca5a5' }}>
          {state.error}
        </div>
      ) : (
        <div className="peaceful-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>User ID</th>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email Address</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {state.users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer' }} onClick={() => onInspectUser(u)}>
                  <td style={{ padding: '1rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>USR-{u.id}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--primary)', display: 'grid', placeItems: 'center', fontWeight: '900', color: 'white' }}>
                        {u.name?.charAt(0) || 'U'}
                      </span>
                      <strong style={{ color: 'white' }}>{u.name}</strong>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#cbd5e1' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid var(--secondary)', color: '#c4b5fd', padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '800' }}>
                      {u.role || 'USER'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/* ==================== ADMIN DASHBOARD (NO BOOK TICKETS BUTTON) ==================== */
function AdminEventsPage({
  refreshKey,
  onOpenViewModal,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenBookingsModal,
  onOpenAnalyticsModal,
  onOpenDeleteModal
}) {
  const [state, setState] = useState({ loading: true, error: '', events: [] })
  const [allBookings, setAllBookings] = useState([])
  const [scheduleFilter, setScheduleFilter] = useState('Upcoming')

  const loadEventsAndBookings = () => {
    setState(prev => ({ ...prev, loading: true }))
    Promise.all([getEvents(), getAllBookings().catch(() => [])])
      .then(([events, bookings]) => {
        setState({ loading: false, error: '', events })
        setAllBookings(bookings || [])
      })
      .catch(err => setState({ loading: false, error: err.message, events: [] }))
  }

  useEffect(() => {
    loadEventsAndBookings()
  }, [refreshKey])

  const activeEvents = state.events.filter(e => (e.availableSeats || 0) > 0).length
  const availableSeatsSum = state.events.reduce((sum, e) => sum + (e.availableSeats || 0), 0)
  const totalRevenue = allBookings.filter(b => b.status !== 'CANCELLED').reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)

  const todayStr = getTodayLocalDateStr()

  const filteredEvents = state.events.filter(evt => {
    if (scheduleFilter === 'Upcoming') return (evt.eventDate || '') >= todayStr
    if (scheduleFilter === 'Today') return (evt.eventDate || '') === todayStr
    if (scheduleFilter === 'Past') return (evt.eventDate || '') < todayStr
    return true
  }).sort((a, b) => (a.eventDate || '').localeCompare(b.eventDate || ''))

  return (
    <section id="section-admin-events" className="container" style={{ paddingTop: '5rem', maxWidth: '1250px' }}>
      {/* 1. HEADER WITH PROMINENT + CREATE EVENT BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', letterSpacing: '-0.02em' }}>
            Event <span className="gradient-text">Management</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Manage your events, schedules, capacity and ticket pricing.
          </p>
        </div>

        <button className="btn btn-primary" id="open-create-event-btn" onClick={onOpenCreateModal} style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem', fontWeight: '800' }}>
          <i className="fa-solid fa-plus" /> + Create Event
        </button>
      </div>

      {/* 2. STATISTICS ROW (3 RESPONSIVE CARDS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="stat-card-glow" style={{ padding: '1.4rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 18, 42, 0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Events</span>
            <i className="fa-solid fa-bolt text-green-400" style={{ fontSize: '1.2rem' }} />
          </div>
          <strong style={{ fontSize: '2rem', fontWeight: '900', color: 'white' }}>{activeEvents}</strong>
        </div>

        <div className="stat-card-glow" style={{ padding: '1.4rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 18, 42, 0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Available Seats</span>
            <i className="fa-solid fa-chair text-cyan-400" style={{ fontSize: '1.2rem' }} />
          </div>
          <strong style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-cyan)' }}>{availableSeatsSum}</strong>
        </div>

        <div className="stat-card-glow" style={{ padding: '1.4rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 18, 42, 0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</span>
            <i className="fa-solid fa-indian-rupee-sign text-pink-400" style={{ fontSize: '1.2rem' }} />
          </div>
          <strong style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>₹{totalRevenue.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {/* 3. EVENT FILTERS IN SINGLE HORIZONTAL BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
          {['Upcoming', 'Today', 'Past', 'All'].map(f => (
            <button
              key={f}
              className={`pill-btn ${scheduleFilter === f ? 'active' : ''}`}
              style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem', fontWeight: '700' }}
              onClick={() => setScheduleFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>
          Showing {filteredEvents.length} event(s)
        </span>
      </div>

      {/* 4. ADMIN EVENT LIST TABLE (DESKTOP) & CARDS (MOBILE) */}
      {state.loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Loading event catalogue...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', color: '#94a3b8' }}>
          <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '3rem', color: '#64748b', marginBottom: '1rem' }} />
          <h3>No events found for "{scheduleFilter}" filter</h3>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="peaceful-card admin-desktop-table" style={{ overflowX: 'auto', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }} id="admin-events-table">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: '#94a3b8', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1.2rem 1rem' }}>Event</th>
                  <th style={{ padding: '1.2rem 1rem' }}>Venue</th>
                  <th style={{ padding: '1.2rem 1rem' }}>Date & Time</th>
                  <th style={{ padding: '1.2rem 1rem' }}>Seats</th>
                  <th style={{ padding: '1.2rem 1rem' }}>Price</th>
                  <th style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '1.1rem 1rem' }}>
                      <div style={{ fontWeight: '800', color: 'white', fontSize: '1rem' }}>{e.name}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: '700' }}>EVT-{e.id} • {e.category || 'Live'}</span>
                    </td>
                    <td style={{ padding: '1.1rem 1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>{e.venue}</td>
                    <td style={{ padding: '1.1rem 1rem', color: '#94a3b8', fontSize: '0.88rem' }}>
                      {e.eventDate || 'Upcoming'} {e.eventTime ? `at ${e.eventTime}` : ''}
                    </td>
                    <td style={{ padding: '1.1rem 1rem', fontWeight: '800', color: e.availableSeats < 20 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                      {e.availableSeats} / {e.totalSeats || 150}
                    </td>
                    <td style={{ padding: '1.1rem 1rem', fontWeight: '900', color: 'var(--primary)' }}>₹{Number(e.price || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '1.1rem 1rem', textAlign: 'right' }}>
                      {/* ADMIN ONLY ACTIONS — NO BOOK TICKETS BUTTON */}
                      <div className="action-btn-group" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => onOpenViewModal(e)} title="View Event Details">
                          View
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => onOpenEditModal(e)} title="Edit Event Details">
                          Edit
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => onOpenBookingsModal(e)} title="View Event Reservations">
                          Bookings
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => onOpenAnalyticsModal(e)} title="View Event Analytics">
                          Analytics
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => onOpenDeleteModal(e)} title="Delete Event">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="admin-card-grid">
            {filteredEvents.map(e => (
              <div key={e.id} className="admin-event-card-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '800' }}>{e.name}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>EVT-{e.id} • {e.category}</span>
                  </div>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>₹{Number(e.price || 0).toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  <i className="fa-solid fa-location-dot text-pink-500" style={{ marginRight: '0.4rem' }} /> {e.venue}<br />
                  <i className="fa-regular fa-calendar" style={{ marginRight: '0.4rem' }} /> {e.eventDate || 'Upcoming'} {e.eventTime}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.85rem', color: e.availableSeats < 20 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: '800' }}>
                    {e.availableSeats} / {e.totalSeats || 150} left
                  </span>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => onOpenViewModal(e)}>View</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => onOpenEditModal(e)}>Edit</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => onOpenBookingsModal(e)}>Bookings</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => onOpenAnalyticsModal(e)}>Analytics</button>
                    <button className="btn btn-danger btn-sm" onClick={() => onOpenDeleteModal(e)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

/* ==================== ADMIN USER BOOKING DETAILS PAGE ==================== */
function AdminUsersPage({ onInspectUser }) {
  const [usersState, setUsersState] = useState({ loading: true, users: [] })
  const [bookingsState, setBookingsState] = useState({ loading: true, bookings: [] })

  useEffect(() => {
    getUsers()
      .then(users => setUsersState({ loading: false, users }))
      .catch(() => setUsersState({ loading: false, users: [] }))

    getAllBookings()
      .then(bookings => setBookingsState({ loading: false, bookings: bookings || [] }))
      .catch(() => setBookingsState({ loading: false, bookings: [] }))
  }, [])

  return (
    <section id="section-admin-users" className="container" style={{ paddingTop: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white' }}>
            User Booking <span className="gradient-text">Details & Audit</span> (Admin)
          </h2>
          <p style={{ color: '#94a3b8' }}>Inspect full ticket purchasing history, booking references, and total customer expenditure.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid var(--accent-cyan)', padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>REGISTERED USERS</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)' }}>{usersState.users.length}</strong>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-green)', padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>TOTAL BOOKINGS</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--accent-green)' }}>{bookingsState.bookings.length}</strong>
          </div>
        </div>
      </div>

      <div className="peaceful-card" style={{ overflowX: 'auto', marginBottom: '3rem' }}>
        <h3 style={{ padding: '1rem 1rem 0.5rem 1rem', color: 'white', fontSize: '1.2rem', fontWeight: '800' }}>Master User Reservations</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>Booking Ref</th>
              <th style={{ padding: '1rem' }}>User ID</th>
              <th style={{ padding: '1rem' }}>Event ID</th>
              <th style={{ padding: '1rem' }}>Tickets</th>
              <th style={{ padding: '1rem' }}>Total Amount (₹)</th>
              <th style={{ padding: '1rem' }}>Booking Date</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookingsState.bookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '1rem', fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {b.bookingReference || `STG-${b.id}`}
                </td>
                <td style={{ padding: '1rem', color: 'white', fontWeight: '700' }}>USR-{b.userId}</td>
                <td style={{ padding: '1rem', color: '#cbd5e1' }}>EVT-{b.eventId}</td>
                <td style={{ padding: '1rem', color: 'white', fontWeight: '700' }}>{b.numberOfSeats} ticket(s)</td>
                <td style={{ padding: '1rem', fontWeight: '900', color: 'var(--accent-green)' }}>
                  ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                  {b.bookingDate || (b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—')}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className={`status-badge ${b.status === 'CANCELLED' ? 'status-cancelled' : b.status === 'PENDING' ? 'status-pending' : 'status-confirmed'}`}>
                    {b.status || 'CONFIRMED'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* ==================== MODALS ==================== */

/* 1. ADMIN EVENT VIEW MODAL */
function EventViewModal({ event, onClose }) {
  const imageUrl = CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.Default

  return (
    <div className="modal-overlay active" id="eventViewModal">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <div>
            <h3>Event Details (EVT-{event.id})</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Complete information for this event</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          <div style={{ position: 'relative', height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={event.name} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(2,2,6,0.95) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '1rem', left: '1.5rem' }}>
              <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.8rem', borderRadius: '999px', textTransform: 'uppercase' }}>{event.category || 'Live'}</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', marginTop: '0.3rem' }}>{event.name}</h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>VENUE / LOCATION</span>
              <strong style={{ color: 'white', fontSize: '1rem' }}>{event.venue || 'Main Arena'}</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>DATE & TIME</span>
              <strong style={{ color: 'white', fontSize: '1rem' }}>{event.eventDate || 'Upcoming'} {event.eventTime ? `at ${event.eventTime}` : ''}</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>TICKET PRICE</span>
              <strong style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: '900' }}>₹{Number(event.price || 0).toLocaleString('en-IN')}</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>CAPACITY</span>
              <strong style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>{event.availableSeats} / {event.totalSeats || 150} left</strong>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.5rem' }}>DESCRIPTION</h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>{event.description || 'No detailed description provided.'}</p>
          </div>

          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onClose}>
            Close Event Inspector
          </button>
        </div>
      </div>
    </div>
  )
}

/* 2. ADMIN EVENT BOOKINGS MODAL (BOOKING MANAGEMENT VIEW) */
function EventBookingsModal({ event, onInspectBooking, onRefreshEvent, onClose, showToast }) {
  const [state, setState] = useState({ loading: true, error: '', bookings: [] })
  const [usersMap, setUsersMap] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const fetchBookingsAndUsers = () => {
    setState(prev => ({ ...prev, loading: true, error: '' }))
    Promise.all([
      getBookingsByEvent(event.id),
      getUsers().catch(() => [])
    ])
      .then(([bookings, users]) => {
        const uMap = {}
        users.forEach(u => { uMap[u.id] = u })
        setUsersMap(uMap)
        setState({ loading: false, error: '', bookings: bookings || [] })
      })
      .catch(err => {
        setState({ loading: false, error: err.message || 'Unable to load bookings. Please try again.', bookings: [] })
      })
  }

  useEffect(() => {
    fetchBookingsAndUsers()
  }, [event])

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking reservation?")) return
    const bToCancel = state.bookings.find(b => b.id === bookingId)
    try {
      const updated = await cancelBooking(bookingId)
      setState(prev => ({
        ...prev,
        bookings: prev.bookings.map(b => b.id === bookingId ? updated : b)
      }))

      if (bToCancel) {
        try {
          const evt = await getEvent(event.id)
          const currentAvail = evt.availableSeats !== undefined ? evt.availableSeats : 0
          const totalS = evt.totalSeats || 150
          const restoredAvail = Math.min(totalS, currentAvail + (bToCancel.numberOfSeats || 1))
          await updateEvent(evt.id, {
            name: evt.name,
            description: evt.description || 'Live stage experience in India.',
            venue: evt.venue,
            eventDate: evt.eventDate,
            eventTime: evt.eventTime || '19:00:00',
            category: evt.category || 'Music',
            totalSeats: Number(totalS),
            availableSeats: Number(restoredAvail),
            price: Number(evt.price || 0)
          })
        } catch (e) {
          console.error("Seat restoration error:", e)
        }
      }

      createNotification({
        recipientUserId: null,
        recipientRole: 'ADMIN',
        title: 'Booking Cancellation ⚠️',
        message: `Reservation #${bookingId} was cancelled by admin.`,
        type: 'BOOKING_CANCELLED',
        relatedId: bookingId
      }).catch(() => {})

      if (onRefreshEvent) onRefreshEvent()
      showToast("Booking cancelled & seat capacity restored!", "info")
    } catch (err) {
      showToast(err.message || "Failed to cancel booking", "error")
    }
  }

  const activeBookings = state.bookings.filter(b => b.status !== 'CANCELLED')
  const totalBookingsCount = state.bookings.length
  const ticketsSold = activeBookings.reduce((sum, b) => sum + Number(b.numberOfSeats || 0), 0)
  const totalRevenue = activeBookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)

  const filteredBookings = state.bookings.filter(b => {
    const u = usersMap[b.userId]
    const userName = (u ? u.name : `User #${b.userId}`).toLowerCase()
    const userEmail = (u ? u.email : `usr${b.userId}@stagefront.in`).toLowerCase()
    const bookingRef = (b.bookingReference || `BK-${b.id}`).toLowerCase()
    const query = searchQuery.toLowerCase().trim()

    const matchesSearch = !query || bookingRef.includes(query) || userName.includes(query) || userEmail.includes(query)
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="modal-overlay active" id="eventBookingsModal">
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <div>
            <h3>Booking Management</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Real-time reservations for {event.name}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          {/* EVENT SUMMARY HEADER CARD */}
          <div style={{ background: 'linear-gradient(135deg, rgba(15, 20, 42, 0.95), rgba(10, 12, 30, 0.98))', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1.2rem 1.6rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: '800' }}>EVT-{event.id} • {event.category || 'Live'}</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', marginTop: '0.2rem' }}>{event.name}</h3>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                <i className="fa-solid fa-location-dot text-pink-500" style={{ marginRight: '0.4rem' }} /> {event.venue} • {event.eventDate || 'Upcoming'} {event.eventTime ? `at ${event.eventTime}` : ''}
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>TICKET PRICE</span>
                <strong style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--primary)' }}>₹{Number(event.price || 0).toLocaleString('en-IN')}</strong>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={fetchBookingsAndUsers} title="Refresh Bookings">
                <i className={`fa-solid fa-arrows-rotate ${state.loading ? 'fa-spin' : ''}`} /> Refresh
              </button>
            </div>
          </div>

          {/* SUMMARY METRICS CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '800' }}>Total Bookings</span>
              <strong style={{ fontSize: '1.5rem', color: 'white', fontWeight: '900' }}>{state.loading ? '...' : totalBookingsCount}</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '800' }}>Tickets Sold</span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)', fontWeight: '900' }}>{state.loading ? '...' : ticketsSold}</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '800' }}>Available Seats</span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--accent-green)', fontWeight: '900' }}>{event.availableSeats}</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '800' }}>Total Revenue</span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: '900' }}>₹{state.loading ? '0' : totalRevenue.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* SEARCH AND STATUS FILTER BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                placeholder="Search by Booking ID, user name, or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.04)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              {['All', 'CONFIRMED', 'PENDING', 'CANCELLED'].map(s => (
                <button
                  key={s}
                  className={`pill-btn ${statusFilter === s ? 'active' : ''}`}
                  style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem', fontWeight: '700' }}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* LOADING, ERROR, & EMPTY STATES */}
          {state.loading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }} />
              <p>Loading bookings...</p>
            </div>
          ) : state.error ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', padding: '1.5rem', borderRadius: 'var(--radius-md)', color: '#fca5a5', textAlign: 'center' }}>
              <p style={{ marginBottom: '1rem' }}>{state.error}</p>
              <button className="btn btn-secondary btn-sm" onClick={fetchBookingsAndUsers}>
                <i className="fa-solid fa-arrows-rotate" /> Retry
              </button>
            </div>
          ) : state.bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', color: '#94a3b8' }}>
              <i className="fa-solid fa-bookmark" style={{ fontSize: '3rem', color: '#64748b', marginBottom: '1rem' }} />
              <h3 style={{ color: 'white' }}>No bookings yet</h3>
              <p style={{ fontSize: '0.88rem', marginTop: '0.3rem' }}>Total Bookings: 0 • Tickets Sold: 0 • Available Seats: {event.totalSeats || event.availableSeats} • Total Revenue: ₹0</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', color: '#94a3b8' }}>
              <i className="fa-solid fa-filter-circle-xmark" style={{ fontSize: '2.5rem', color: '#64748b', marginBottom: '0.8rem' }} />
              <h4>No bookings match "{searchQuery}" filter</h4>
            </div>
          ) : (
            <div className="peaceful-card" style={{ overflowX: 'auto', maxHeight: '380px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: '#94a3b8', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1rem' }}>Booking ID</th>
                    <th style={{ padding: '1rem' }}>User</th>
                    <th style={{ padding: '1rem' }}>Email</th>
                    <th style={{ padding: '1rem' }}>Tickets</th>
                    <th style={{ padding: '1rem' }}>Amount</th>
                    <th style={{ padding: '1rem' }}>Booking Date</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(b => {
                    const u = usersMap[b.userId]
                    const userName = u ? u.name : `User #${b.userId}`
                    const userEmail = u ? u.email : `usr${b.userId}@stagefront.in`
                    const statusClass = b.status === 'CANCELLED' ? 'status-cancelled' : b.status === 'PENDING' ? 'status-pending' : 'status-confirmed'

                    return (
                      <tr key={b.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '1rem', fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {b.bookingReference || `BK-${b.id}`}
                        </td>
                        <td style={{ padding: '1rem', color: 'white', fontWeight: '700' }}>{userName}</td>
                        <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.88rem' }}>{userEmail}</td>
                        <td style={{ padding: '1rem', color: 'white', fontWeight: '700' }}>{b.numberOfSeats}</td>
                        <td style={{ padding: '1rem', fontWeight: '900', color: 'var(--accent-green)' }}>
                          ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.88rem' }}>
                          {b.bookingDate || (b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—')}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`status-badge ${statusClass}`}>
                            {b.status || 'CONFIRMED'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => onInspectBooking({ ...b, userName, userEmail })} title="View Booking Details">
                              View
                            </button>
                            {b.status !== 'CANCELLED' && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleCancelBooking(b.id)} title="Cancel Reservation">
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* BOOKING INSPECT MODAL */
function BookingInspectModal({ booking, event, onClose }) {
  return (
    <div className="modal-overlay active" id="bookingInspectModal">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div>
            <h3>Booking Details</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Reservation Reference: {booking.bookingReference || `BK-${booking.id}`}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1.4rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>BOOKING ID</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{booking.bookingReference || `BK-${booking.id}`}</div>
              </div>
              <span className={`status-badge ${booking.status === 'CANCELLED' ? 'status-cancelled' : booking.status === 'PENDING' ? 'status-pending' : 'status-confirmed'}`}>
                {booking.status || 'CONFIRMED'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>EVENT</span>
                <strong style={{ color: 'white' }}>{event?.name || `Event EVT-${booking.eventId}`}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>USER NAME</span>
                <strong style={{ color: 'white' }}>{booking.userName || `User #${booking.userId}`}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>USER EMAIL</span>
                <strong style={{ color: '#cbd5e1' }}>{booking.userEmail || `usr${booking.userId}@stagefront.in`}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>NUMBER OF TICKETS</span>
                <strong style={{ color: 'white' }}>{booking.numberOfSeats} ticket(s)</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>TICKET PRICE</span>
                <strong style={{ color: 'white' }}>₹{Number(event?.price || 0).toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>TOTAL AMOUNT</span>
                <strong style={{ color: 'var(--accent-green)', fontSize: '1.1rem' }}>₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', color: '#94a3b8' }}>
              Booking Date: <strong style={{ color: 'white' }}>{booking.bookingDate || (booking.createdAt ? new Date(booking.createdAt).toLocaleString() : '—')}</strong>
            </div>
          </div>

          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onClose}>
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  )
}

/* 3. ADMIN EVENT ANALYTICS MODAL */
function EventAnalyticsModal({ event, onClose }) {
  const [allBookings, setAllBookings] = useState([])

  useEffect(() => {
    getBookingsByEvent(event.id)
      .then(res => setAllBookings(res || []))
      .catch(() => setAllBookings([]))
  }, [event])

  const total = event.totalSeats || 150
  const avail = event.availableSeats || 0
  const sold = Math.max(0, total - avail)
  const occupancyPercent = Math.min(100, Math.round((sold / total) * 100))
  const revenue = allBookings.filter(b => b.status !== 'CANCELLED').reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)

  return (
    <div className="modal-overlay active" id="eventAnalyticsModal">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <div>
            <h3>Event Analytics Inspector (EVT-{event.id})</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sales metrics & occupancy statistics for "{event.name}"</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          {/* Occupancy Progress Banner */}
          <div style={{ background: 'rgba(15, 18, 42, 0.9)', border: '1px solid var(--border-glass)', padding: '1.4rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>Capacity Occupancy Rate</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{occupancyPercent}%</strong>
            </div>
            <div className="progress-track" style={{ height: '10px' }}>
              <div className="progress-fill" style={{ width: `${occupancyPercent}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              <span>{sold} Seats Sold</span>
              <span>{avail} Available Left</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>TOTAL CAPACITY</span>
              <strong style={{ fontSize: '1.4rem', color: 'white' }}>{total} seats</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>BOOKINGS COUNT</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)' }}>{allBookings.length}</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>GROSS REVENUE</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--accent-green)' }}>₹{revenue.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onClose}>
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  )
}

function CityModal({ selectedCity, onSelectCity, onClose }) {
  const [filter, setFilter] = useState('')
  const filtered = POPULAR_CITIES.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="modal-overlay active" id="cityModal">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div>
            <h3>Select Your City</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Discover live events happening in your city</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          <div className="form-group" style={{ position: 'relative' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--primary)' }} />
            <input type="text" className="form-control" style={{ paddingLeft: '2.8rem' }} placeholder="Search city (Mumbai, Delhi, Bengaluru...)" value={filter} onChange={e => setFilter(e.target.value)} />
          </div>

          <div className="city-grid" id="popular-cities-grid">
            {filtered.map(c => (
              <div key={c.name} className={`city-item-card ${selectedCity === c.name ? 'active' : ''}`} onClick={() => onSelectCity(c.name)}>
                <div className="city-landmark-icon"><i className={`fa-solid ${c.icon}`} /></div>
                <div className="city-name-label">{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AuthModal({ mode, setMode, onLoginSuccess, onOpenForgotPassword, onClose, showToast }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const u = await login({ email: form.email, password: form.password })
        onLoginSuccess(u)
      } else {
        await registerUser(form)
        showToast("Account created successfully! Please sign in.", "success")
        setMode('login')
      }
    } catch (err) {
      setError(err.message || "Authentication error.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay active" id="authModal">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3 id="auth-modal-title">{mode === 'login' ? 'Sign In to StageFront' : 'Create StageFront Account'}</h3>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          {error && <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid var(--accent-red)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1.2rem', fontSize: '0.88rem' }}>{error}</div>}

          <form id="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group" id="auth-name-group">
                <label className="form-label">Full Name</label>
                <input required name="name" className="form-control" placeholder="Rahul Sharma" value={form.name} onChange={update} />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input required type="email" name="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={update} />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() => onOpenForgotPassword(form.email)}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input required type="password" name="password" className="form-control" placeholder="••••••••" value={form.password} onChange={update} />
            </div>

            {mode === 'register' && (
              <div className="form-group" id="auth-phone-group">
                <label className="form-label">Phone Number</label>
                <input required name="phone" className="form-control" placeholder="+91 98765 43210" value={form.phone} onChange={update} />
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} id="auth-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.88rem' }}>
            <span id="auth-toggle-text">{mode === 'login' ? "Don't have an account?" : 'Already registered?'}</span>{' '}
            <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '800', cursor: 'pointer' }} onClick={() => setMode(mode === 'login' ? 'register' : 'login')} id="auth-toggle-link">
              {mode === 'login' ? 'Register Now' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminLoginModal({ onSuccess, onOpenForgotPassword, onClose, showToast }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const u = await login({ email, password })
      if (u && u.role === 'ADMIN') {
        onSuccess(u)
      } else {
        const msg = `Access Denied: Account '${u?.email || email}' does not have ADMIN privileges.`
        setError(msg)
        showToast(msg, "error")
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay active" id="adminLoginModal">
      <div className="modal-content" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <div>
            <h3>Administrator Sign In</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Secured Access to Event & User Analytics</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="modal-body">
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--accent-red)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1.2rem', fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Admin Password</label>
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => onOpenForgotPassword(email)}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              <i className="fa-solid fa-user-shield" /> {loading ? 'Authenticating...' : 'Sign In to Admin Mode'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function ForgotPasswordModal({ initialEmail, onSuccess, onClose, showToast }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState(initialEmail || '')
  const [resetCode, setResetCode] = useState('')
  const [devCodeInfo, setDevCodeInfo] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await forgotPassword(email)
      setDevCodeInfo(res.resetCode)
      setResetCode(res.resetCode || '')
      setStep(2)
      showToast("Reset code generated! Please enter your new password.", "info")
    } catch (err) {
      setError(err.message || "Failed to generate reset request.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.")
      return
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }
    setLoading(true)
    setError('')
    try {
      await resetPassword({ email, resetCode, newPassword, confirmPassword })
      showToast("Password reset successfully. Please sign in with your new password.", "success")
      onSuccess()
    } catch (err) {
      setError(err.message || "Failed to reset password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay active" id="forgotPasswordModal">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div>
            <h3>Forgot Password</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              {step === 1 ? 'Enter your registered email to request a password reset' : 'Enter reset code and set your new password'}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--accent-red)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1.2rem', fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendCode}>
              <div className="form-group">
                <label className="form-label">Registered Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                <i className="fa-solid fa-paper-plane" /> {loading ? 'Sending Request...' : 'Send Reset Request'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset}>
              {devCodeInfo && (
                <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid var(--accent-cyan)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--accent-cyan)', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-key" style={{ marginRight: '0.5rem' }} />
                  <strong>Development Reset Code:</strong> <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 'bold' }}>{devCodeInfo}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Reset Code / Token</label>
                <input type="text" className="form-control" placeholder="6-digit reset code" value={resetCode} onChange={e => setResetCode(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  <i className="fa-solid fa-check-double" /> {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} disabled={loading}>
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function CreateEventModal({ onSuccess, onClose, showToast }) {
  const todayStr = getTodayLocalDateStr()
  const [form, setForm] = useState({
    name: '',
    category: 'Music',
    venue: '',
    eventDate: todayStr,
    eventTime: '19:00:00',
    totalSeats: 150,
    price: 999,
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const currentToday = getTodayLocalDateStr()
    if (form.eventDate < currentToday) {
      setError("Event date must be today or later.")
      setLoading(false)
      return
    }

    try {
      const payload = {
        name: form.name,
        description: form.description || 'Live stage experience in India.',
        venue: form.venue,
        eventDate: form.eventDate,
        eventTime: form.eventTime.length === 5 ? `${form.eventTime}:00` : form.eventTime,
        category: form.category,
        totalSeats: Number(form.totalSeats),
        availableSeats: Number(form.totalSeats),
        price: Number(form.price)
      }
      const created = await createEvent(payload)

      createNotification({
        recipientUserId: null,
        recipientRole: 'ADMIN',
        title: 'Event Created 🎪',
        message: `Event '${payload.name}' created successfully.`,
        type: 'EVENT_CREATED',
        relatedId: created.id
      }).catch(() => {})

      onSuccess(created)
    } catch (err) {
      setError(err.message || "Failed to create event.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay active" id="createEventModal">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div>
            <h3>Create New Event</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Add a new live concert or summit to StageFront</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--accent-red)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1.2rem', fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input name="name" className="form-control" placeholder="e.g. Sunburn Festival 2026" value={form.name} onChange={update} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" className="form-control" value={form.category} onChange={update} required>
                  <option value="Music">Music</option>
                  <option value="Tech">Tech</option>
                  <option value="Sports">Sports</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Venue / Location</label>
                <input name="venue" className="form-control" placeholder="e.g. Vagator Arena, Goa" value={form.venue} onChange={update} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Event Date</label>
                <input type="date" name="eventDate" className="form-control" value={form.eventDate} min={todayStr} onChange={update} required />
              </div>

              <div className="form-group">
                <label className="form-label">Event Time</label>
                <input type="time" name="eventTime" className="form-control" value={form.eventTime} onChange={update} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Total Capacity / Seats</label>
                <input type="number" min="1" name="totalSeats" className="form-control" value={form.totalSeats} onChange={update} required />
              </div>

              <div className="form-group">
                <label className="form-label">Ticket Price (₹)</label>
                <input type="number" min="0" step="1" name="price" className="form-control" value={form.price} onChange={update} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows="3" placeholder="Describe the live experience..." value={form.description} onChange={update} required />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                <i className="fa-solid fa-plus" /> {loading ? 'Creating Event...' : 'Create Event'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function EditEventModal({ event, onSuccess, onClose, showToast }) {
  const todayStr = getTodayLocalDateStr()
  const initialDateStr = formatToInputDateStr(event.eventDate)
  const [form, setForm] = useState({
    name: event.name || '',
    category: event.category || 'Music',
    venue: event.venue || '',
    eventDate: initialDateStr,
    eventTime: event.eventTime || '19:00:00',
    totalSeats: event.totalSeats || 150,
    availableSeats: event.availableSeats !== undefined ? event.availableSeats : event.totalSeats || 150,
    price: event.price || 999,
    description: event.description || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const currentToday = getTodayLocalDateStr()
    if (form.eventDate < currentToday) {
      setError("Event date must be today or later.")
      setLoading(false)
      return
    }

    try {
      const payload = {
        name: form.name,
        description: form.description,
        venue: form.venue,
        eventDate: form.eventDate,
        eventTime: form.eventTime.length === 5 ? `${form.eventTime}:00` : form.eventTime,
        category: form.category,
        totalSeats: Number(form.totalSeats),
        availableSeats: Number(form.availableSeats),
        price: Number(form.price)
      }
      await updateEvent(event.id, payload)

      createNotification({
        recipientUserId: null,
        recipientRole: 'ADMIN',
        title: 'Event Updated ✏️',
        message: `Event '${payload.name}' (EVT-${event.id}) details updated.`,
        type: 'EVENT_UPDATED',
        relatedId: event.id
      }).catch(() => {})

      onSuccess()
    } catch (err) {
      setError(err.message || "Failed to update event.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay active" id="editEventModal">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div>
            <h3>Edit Event (EVT-{event.id})</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Update capacity, pricing, schedule, and venue details</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--accent-red)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1.2rem', fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input name="name" className="form-control" value={form.name} onChange={update} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" className="form-control" value={form.category} onChange={update} required>
                  <option value="Music">Music</option>
                  <option value="Tech">Tech</option>
                  <option value="Sports">Sports</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Venue / Location</label>
                <input name="venue" className="form-control" value={form.venue} onChange={update} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Event Date</label>
                <input type="date" name="eventDate" className="form-control" value={form.eventDate} min={todayStr} onChange={update} required />
              </div>

              <div className="form-group">
                <label className="form-label">Event Time</label>
                <input type="time" name="eventTime" className="form-control" value={form.eventTime} onChange={update} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Total Capacity</label>
                <input type="number" min="1" name="totalSeats" className="form-control" value={form.totalSeats} onChange={update} required />
              </div>

              <div className="form-group">
                <label className="form-label">Available Seats</label>
                <input type="number" min="0" name="availableSeats" className="form-control" value={form.availableSeats} onChange={update} required />
              </div>

              <div className="form-group">
                <label className="form-label">Ticket Price (₹)</label>
                <input type="number" min="0" step="1" name="price" className="form-control" value={form.price} onChange={update} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows="3" value={form.description} onChange={update} required />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                <i className="fa-solid fa-floppy-disk" /> {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function DeleteEventModal({ event, onSuccess, onClose, showToast }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setError('')
    try {
      await deleteEvent(event.id)

      createNotification({
        recipientUserId: null,
        recipientRole: 'ADMIN',
        title: 'Event Deleted 🗑️',
        message: `Event '${event.name}' (EVT-${event.id}) was permanently deleted.`,
        type: 'EVENT_DELETED',
        relatedId: event.id
      }).catch(() => {})

      onSuccess()
    } catch (err) {
      setError(err.message || "Failed to delete event.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay active" id="deleteEventModal">
      <div className="modal-content" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <div>
            <h3>Delete Event (EVT-{event.id})</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Confirm permanent removal from StageFront backend</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--accent-red)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1.2rem', fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          <p style={{ color: 'white', fontSize: '1rem', marginBottom: '1.5rem' }}>
            Are you sure you want to delete event <strong style={{ color: 'var(--primary)' }}>"{event.name}"</strong>? This action will remove it from the system.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete} disabled={loading}>
              <i className="fa-solid fa-trash" /> {loading ? 'Deleting...' : 'Confirm Delete'}
            </button>
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotifModal({ activeRole, user, state, onRefresh, onOpenFullPage, onMarkRead, onMarkAllRead, onClose }) {
  const [filter, setFilter] = useState('All')

  const items = state.items.filter(n => {
    if (filter === 'Unread') return !n.isRead
    if (filter === 'Read') return n.isRead
    return true
  })

  return (
    <div className="modal-overlay active" id="notifModal">
      <div className="modal-content" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div>
            <h3>{activeRole === 'ADMIN' ? 'Admin Notifications' : 'User Notifications'}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Real-time updates from Gateway</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body" id="notifications-list-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.04)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              {['All', 'Unread', 'Read'].map(f => (
                <button
                  key={f}
                  className={`pill-btn ${filter === f ? 'active' : ''}`}
                  style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem', fontWeight: '700' }}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }} onClick={onRefresh}>
                <i className={`fa-solid fa-arrows-rotate ${state.loading ? 'fa-spin' : ''}`} /> Refresh
              </button>
              {state.items.some(n => !n.isRead) && (
                <button className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }} onClick={onMarkAllRead}>
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {state.loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }} />
              <p>Loading notifications...</p>
            </div>
          ) : state.error ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', padding: '1.2rem', borderRadius: 'var(--radius-md)', color: '#fca5a5', textAlign: 'center' }}>
              <p style={{ marginBottom: '0.8rem' }}>Unable to load notifications.</p>
              <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
                <i className="fa-solid fa-arrows-rotate" /> Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', color: '#94a3b8' }}>
              <i className="fa-solid fa-bell-slash" style={{ fontSize: '2.5rem', color: '#64748b', marginBottom: '0.8rem' }} />
              <h4 style={{ color: 'white' }}>No notifications found</h4>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '340px', overflowY: 'auto' }}>
              {items.map(n => (
                <div key={n.id} className="peaceful-card" style={{ padding: '1rem 1.2rem', borderLeft: `4px solid ${n.isRead ? 'rgba(255,255,255,0.2)' : 'var(--primary)'}`, background: n.isRead ? 'rgba(15, 18, 42, 0.6)' : 'rgba(15, 20, 48, 0.9)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                    <strong style={{ fontSize: '0.92rem', color: 'white' }}>{n.title}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                      {!n.isRead && (
                        <button className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }} onClick={() => onMarkRead(n.id)}>
                          Read
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>{n.message}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={onOpenFullPage}>
              <i className="fa-solid fa-expand" /> View All Notifications Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SeatModal({ event, onProceed, onClose }) {
  const total = event.availableSeats !== undefined ? event.availableSeats : (event.totalSeats || 10)
  const max = Math.min(10, Math.max(1, total))
  const seatList = Array.from({ length: max }, (_, i) => `A${i + 1}`)
  const [selected, setSelected] = useState(['A1'])

  const toggle = code => {
    if (selected.includes(code)) {
      if (selected.length === 1) return
      setSelected(selected.filter(s => s !== code))
    } else {
      if (selected.length >= total) return
      setSelected([...selected, code])
    }
  }

  const price = selected.length * Number(event.price || 0)

  return (
    <div className="modal-overlay active" id="seatModal">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h3 id="modal-event-title">{event.name}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }} id="modal-event-subtitle">Select Seats & Book Tickets</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          <div className="stage-container">
            <div className="stage-screen" />
            <div className="stage-label">MAIN STAGE & PERFORMER ZONE</div>
          </div>

          <div className="seat-legend" style={{ display: 'flex', justifyContent: 'center', gap: '1.8rem', marginBottom: '2rem' }}>
            <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}><div className="seat-sample available" style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'rgba(255,255,255,0.15)' }} /> Standard</div>
            <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}><div className="seat-sample selected" style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'var(--primary)' }} /> Selected</div>
          </div>

          <div className="seat-grid" id="interactive-seat-grid">
            {seatList.map(s => (
              <div key={s} className={`seat ${selected.includes(s) ? 'selected' : ''}`} onClick={() => toggle(s)}>
                {s}
              </div>
            ))}
          </div>

          <div className="booking-summary-box">
            <div>
              <h4 style={{ color: 'white' }}>Selected: <span id="selected-seats-list" style={{ color: 'var(--primary)' }}>{selected.join(', ')}</span></h4>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{selected.length} ticket(s) selected (Available: {total})</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>Total Amount</span>
                <div className="summary-price" id="total-price-display" style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>₹{price.toLocaleString('en-IN')}</div>
              </div>
              <button className="btn btn-primary" id="confirm-booking-btn" onClick={() => onProceed(selected)} disabled={total < 1 || selected.length < 1}>
                <i className="fa-solid fa-shield-halved" /> Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PaymentModal({ event, user, onPaymentComplete, onClose }) {
  const [tab, setTab] = useState('UPI')
  const [loading, setLoading] = useState(false)
  const num = event.selectedSeats?.length || 1
  const price = num * Number(event.price || 0)

  const handlePay = async (method) => {
    setLoading(true)
    await onPaymentComplete(method)
    setLoading(false)
  }

  return (
    <div className="modal-overlay active" id="paymentModal">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div>
            <h3>Secure Payment Gateway</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>256-Bit SSL Encrypted Transaction</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          <div style={{ background: 'rgba(236, 72, 153, 0.12)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>TOTAL PAYABLE</span>
              <div id="payment-total-amount" style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>₹{price.toLocaleString('en-IN')}</div>
            </div>
            <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-green)', fontSize: '0.8rem', fontWeight: '800', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)' }}>
              <i className="fa-solid fa-lock" /> SECURE
            </span>
          </div>

          <div className="payment-tabs">
            <button className={`payment-tab-btn ${tab === 'UPI' ? 'active' : ''}`} id="pay-tab-upi" onClick={() => setTab('UPI')}>
              <i className="fa-solid fa-qrcode text-pink-500" /> UPI / QR Code
            </button>
            <button className={`payment-tab-btn ${tab === 'CARD' ? 'active' : ''}`} id="pay-tab-card" onClick={() => setTab('CARD')}>
              <i className="fa-solid fa-credit-card text-cyan-400" /> Debit / Credit Card
            </button>
            <button className={`payment-tab-btn ${tab === 'NETBANKING' ? 'active' : ''}`} id="pay-tab-netbanking" onClick={() => setTab('NETBANKING')}>
              <i className="fa-solid fa-building-columns text-purple-400" /> NetBanking
            </button>
          </div>

          {tab === 'UPI' && (
            <div className="qr-payment-box">
              <div className="qr-code-img">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=upi://pay?pa=stagefront@icici&pn=StageFront&am=${price}&cu=INR`} alt="UPI QR" />
              </div>
              <h4 style={{ color: 'white', marginBottom: '0.3rem' }}>Scan QR to Pay via Google Pay, PhonePe, Paytm</h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.4rem' }}>UPI ID: <strong style={{ color: 'white' }}>stagefront@icici</strong></p>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handlePay('UPI / QR Code')} disabled={loading}>
                {loading ? 'Processing Transaction...' : 'Complete & Verify Payment'}
              </button>
            </div>
          )}

          {tab === 'CARD' && (
            <form onSubmit={e => { e.preventDefault(); handlePay('Debit/Credit Card'); }}>
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input className="form-control" placeholder="4532 •••• •••• 8901" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input className="form-control" placeholder="12/28" required />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV Code</label>
                  <input type="password" className="form-control" placeholder="•••" maxLength="4" required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                {loading ? 'Processing...' : 'Pay Now & Generate Ticket Pass'}
              </button>
            </form>
          )}

          {tab === 'NETBANKING' && (
            <div>
              <div className="form-group">
                <label className="form-label">Select Bank</label>
                <select className="form-control">
                  <option>HDFC Bank NetBanking</option>
                  <option>State Bank of India (SBI)</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                </select>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => handlePay('NetBanking')} disabled={loading}>
                {loading ? 'Redirecting...' : 'Redirect to Bank Gateway'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfirmationModal({ booking, onClose, onViewBookings }) {
  return (
    <div className="modal-overlay active" id="confirmationModal">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
              <i className="fa-solid fa-circle-check" />
            </div>
            <div>
              <h3>Booking Confirmed!</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Ticket Synchronized with Booking Service</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="modal-body">
          <div className="ticket-pass" id="printable-ticket">
            <div className="ticket-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '1.2rem', marginBottom: '1.6rem' }}>
              <div>
                <div className="gradient-text" style={{ fontWeight: '900', fontSize: '1.3rem' }}>STAGEFRONT PASS</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>REF: <strong style={{ color: 'white' }}>{booking.bookingReference || `SF-${booking.id}`}</strong></div>
              </div>
              <span className="status-badge status-confirmed">CONFIRMED</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem', marginBottom: '1.6rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>SEATS</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary)' }} id="t-seats">
                  {booking.selectedSeats ? booking.selectedSeats.join(', ') : `${booking.numberOfSeats} Ticket(s)`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>TOTAL AMOUNT</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-green)' }}>
                  ₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', paddingTop: '1.2rem', borderTop: '1px dashed rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>SCAN AT EVENT ENTRANCE</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.8rem', letterSpacing: '6px', color: '#94a3b8' }} id="t-barcode">
                *{booking.bookingReference || `SF-${booking.id}`}*
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => window.print()}>
              <i className="fa-solid fa-download" /> Save / Download Ticket PDF
            </button>
            <button className="btn btn-secondary" onClick={onViewBookings}>
              View in My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserDetailModal({ user, onClose }) {
  return (
    <div className="modal-overlay active" id="userDetailModal">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div>
            <h3>User Profile Inspector</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Complete User Account & Ticket History</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'grid', placeItems: 'center', fontSize: '2rem', fontWeight: '900', color: 'white' }}>
              {user.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>{user.name}</h3>
              <div style={{ color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '0.9rem' }}>USR-{user.id || user.userId}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>{user.email}</div>
              <span style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800', marginTop: '0.4rem', display: 'inline-block' }}>
                Role: {user.role || 'USER'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ==================== HELPER COMPONENTS ==================== */
function MouseTooltip({ preview }) {
  if (!preview.active) return null
  return (
    <div id="mouse-image-preview" className="active" style={{ left: `${preview.x}px`, top: `${preview.y}px` }}>
      <img id="mouse-preview-img" src={preview.img} alt="Preview" />
      <div id="mouse-preview-label" className="preview-badge">{preview.label}</div>
    </div>
  )
}

function CustomCursor() {
  const cursorRef = useRef(null)
  const dotRef = useRef(null)

  useEffect(() => {
    const handleMove = e => {
      if (cursorRef.current) { cursorRef.current.style.left = `${e.clientX}px`; cursorRef.current.style.top = `${e.clientY}px`; }
      if (dotRef.current) { dotRef.current.style.left = `${e.clientX}px`; dotRef.current.style.top = `${e.clientY}px`; }
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <>
      <div ref={cursorRef} id="custom-cursor" />
      <div ref={dotRef} id="custom-cursor-dot" />
    </>
  )
}

function ParticlesCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let id

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      a: Math.random() * 0.5 + 0.2
    }))

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(236, 72, 153, ${p.a})`
        ctx.fill()
      })
      id = requestAnimationFrame(loop)
    }
    loop()

    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(id); }
  }, [])

  return <canvas ref={ref} id="particles-canvas" />
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <i className={`fa-solid ${t.type === 'success' ? 'fa-circle-check text-green-400' : t.type === 'error' ? 'fa-triangle-exclamation text-red-400' : 'fa-circle-info text-cyan-400'}`} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}