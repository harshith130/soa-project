const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const error = await response.json()
      message = error.message || message
    } catch {
      if (response.status === 404) message = 'That resource could not be found.'
      if (response.status === 409) message = 'That email is already registered.'
      if (response.status === 401) message = 'The email or password is incorrect.'
      if (response.status === 400) message = 'Please check the details and try again.'
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return response.status === 204 ? null : response.json()
}

export const login = (credentials) => request('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
})

export const registerUser = (user) => request('/api/users', {
  method: 'POST',
  body: JSON.stringify(user),
})

export const forgotPassword = (email) => request('/api/auth/forgot-password', {
  method: 'POST',
  body: JSON.stringify({ email }),
})

export const resetPassword = (data) => request('/api/auth/reset-password', {
  method: 'POST',
  body: JSON.stringify(data),
})

export const changePassword = (data) => request('/api/auth/change-password', {
  method: 'POST',
  body: JSON.stringify(data),
})

export const getUsers = () => request('/api/users')
export const getUser = (id) => request(`/api/users/${id}`)
export const getUserByEmail = (email) => request(`/api/users/email/${encodeURIComponent(email)}`)
export const updateUserProfile = (id, data) => request(`/api/users/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
})

export const getEvents = () => request('/api/events')
export const getEvent = (id) => request(`/api/events/${id}`)
export const createEvent = (eventData) => request('/api/events', {
  method: 'POST',
  body: JSON.stringify(eventData),
})
export const updateEvent = (id, eventData) => request(`/api/events/${id}`, {
  method: 'PUT',
  body: JSON.stringify(eventData),
})
export const deleteEvent = (id) => request(`/api/events/${id}`, {
  method: 'DELETE',
})

export const getAllBookings = () => request('/api/bookings')
export const getBookingsByEvent = (eventId) => request(`/api/bookings/event/${eventId}`)
export const createBooking = (booking) => request('/api/bookings', {
  method: 'POST',
  body: JSON.stringify(booking),
})
export const getBookingsByUser = (userId) => request(`/api/bookings/user/${userId}`)
export const cancelBooking = (id) => request(`/api/bookings/${id}/cancel`, { method: 'PUT' })

export const createNotification = (data) => request('/api/notifications', {
  method: 'POST',
  body: JSON.stringify(data),
})
export const getUserNotifications = (userId) => request(`/api/notifications/user/${userId}`)
export const getAdminNotifications = () => request('/api/notifications/admin')
export const markNotificationRead = (id) => request(`/api/notifications/${id}/read`, { method: 'PUT' })
export const markAllUserNotificationsRead = (userId) => request(`/api/notifications/user/${userId}/read-all`, { method: 'PUT' })
export const markAllAdminNotificationsRead = () => request('/api/notifications/admin/read-all', { method: 'PUT' })
