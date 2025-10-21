// Accessibility utilities for WCAG 2.1 AA compliance
// This file provides utilities to enhance accessibility across the application

/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

// Focus management utilities
export const focusManagement = {
  /**
   * Trap focus within a specific element (useful for modals)
   * @param {HTMLElement} container - The container to trap focus within
   * @param {HTMLElement} firstFocusable - First focusable element (optional)
   * @param {HTMLElement} lastFocusable - Last focusable element (optional)
   */
  trapFocus(container, firstFocusable = null, lastFocusable = null) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const first = firstFocusable || focusableElements[0]
    const last = lastFocusable || focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === last) {
            first.focus()
            e.preventDefault()
          }
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey)
    
    // Return cleanup function
    return () => container.removeEventListener('keydown', handleTabKey)
  },

  /**
   * Set focus to a specific element
   * @param {HTMLElement} element - Element to focus
   */
  setFocus(element) {
    if (element && typeof element.focus === 'function') {
      element.focus()
    }
  },

  /**
   * Get the first focusable element in a container
   * @param {HTMLElement} container - Container to search within
   * @returns {HTMLElement|null} First focusable element
   */
  getFirstFocusable(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    return focusableElements[0] || null
  }
}

// ARIA utilities
export const ariaUtils = {
  /**
   * Announce a message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - Priority level ('polite' or 'assertive')
   */
  announce(message, priority = 'polite') {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  },

  /**
   * Set ARIA attributes for a button
   * @param {HTMLElement} button - Button element
   * @param {Object} attributes - ARIA attributes to set
   */
  setButtonAria(button, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      button.setAttribute(`aria-${key}`, value)
    })
  },

  /**
   * Set ARIA attributes for a form field
   * @param {HTMLElement} field - Form field element
   * @param {Object} attributes - ARIA attributes to set
   */
  setFieldAria(field, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      field.setAttribute(`aria-${key}`, value)
    })
  }
}

// Keyboard navigation utilities
export const keyboardNavigation = {
  /**
   * Handle Enter key for buttons and links
   * @param {Event} event - Keyboard event
   * @param {Function} callback - Function to call on Enter key
   */
  handleEnterKey(event, callback) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback()
    }
  },

  /**
   * Handle Escape key
   * @param {Event} event - Keyboard event
   * @param {Function} callback - Function to call on Escape key
   */
  handleEscapeKey(event, callback) {
    if (event.key === 'Escape') {
      event.preventDefault()
      callback()
    }
  },

  /**
   * Handle arrow key navigation for lists
   * @param {Event} event - Keyboard event
   * @param {NodeList} items - List of items to navigate
   * @param {Function} onSelect - Function to call when item is selected
   */
  handleArrowKeys(event, items, onSelect) {
    const currentIndex = Array.from(items).indexOf(document.activeElement)
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        newIndex = Math.min(currentIndex + 1, items.length - 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        newIndex = Math.max(currentIndex - 1, 0)
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = items.length - 1
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (onSelect) onSelect(items[currentIndex])
        return
    }

    if (newIndex !== currentIndex && items[newIndex]) {
      items[newIndex].focus()
    }
  }
}

// Color contrast utilities
export const colorContrast = {
  /**
   * Calculate relative luminance of a color
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @returns {number} Relative luminance
   */
  getRelativeLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },

  /**
   * Calculate contrast ratio between two colors
   * @param {string} color1 - First color (hex or rgb)
   * @param {string} color2 - Second color (hex or rgb)
   * @returns {number} Contrast ratio
   */
  getContrastRatio(color1, color2) {
    const rgb1 = this.hexToRgb(color1)
    const rgb2 = this.hexToRgb(color2)
    
    const lum1 = this.getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
    const lum2 = this.getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)
    
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  },

  /**
   * Convert hex color to RGB
   * @param {string} hex - Hex color string
   * @returns {Object} RGB object
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },

  /**
   * Check if contrast ratio meets WCAG AA standards
   * @param {string} foreground - Foreground color
   * @param {string} background - Background color
   * @returns {Object} Contrast check result
   */
  checkWCAGCompliance(foreground, background) {
    const ratio = this.getContrastRatio(foreground, background)
    
    return {
      ratio: ratio.toFixed(2),
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
      level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail'
    }
  }
}

// Screen reader utilities
export const screenReader = {
  /**
   * Create a screen reader only element
   * @param {string} text - Text content
   * @param {string} className - Additional CSS class
   * @returns {HTMLElement} Screen reader only element
   */
  createScreenReaderOnly(text, className = '') {
    const element = document.createElement('span')
    element.className = `sr-only ${className}`.trim()
    element.textContent = text
    return element
  },

  /**
   * Hide element from screen readers
   * @param {HTMLElement} element - Element to hide
   */
  hideFromScreenReader(element) {
    element.setAttribute('aria-hidden', 'true')
  },

  /**
   * Show element to screen readers
   * @param {HTMLElement} element - Element to show
   */
  showToScreenReader(element) {
    element.removeAttribute('aria-hidden')
  }
}

// Form accessibility utilities
export const formAccessibility = {
  /**
   * Associate error message with form field
   * @param {HTMLElement} field - Form field
   * @param {HTMLElement} errorElement - Error message element
   */
  associateError(field, errorElement) {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    errorElement.id = errorId
    field.setAttribute('aria-describedby', errorId)
    field.setAttribute('aria-invalid', 'true')
  },

  /**
   * Remove error association from form field
   * @param {HTMLElement} field - Form field
   */
  removeError(field) {
    field.removeAttribute('aria-describedby')
    field.removeAttribute('aria-invalid')
  },

  /**
   * Set field as required with proper ARIA attributes
   * @param {HTMLElement} field - Form field
   * @param {boolean} required - Whether field is required
   */
  setRequired(field, required = true) {
    field.setAttribute('aria-required', required.toString())
    if (required) {
      field.setAttribute('required', 'required')
    } else {
      field.removeAttribute('required')
    }
  }
}

// Animation and motion utilities
export const motionAccessibility = {
  /**
   * Check if user prefers reduced motion
   * @returns {boolean} Whether user prefers reduced motion
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  /**
   * Apply reduced motion styles if user prefers it
   * @param {HTMLElement} element - Element to apply styles to
   */
  applyReducedMotion(element) {
    if (this.prefersReducedMotion()) {
      element.style.animationDuration = '0.01ms'
      element.style.animationIterationCount = '1'
      element.style.transitionDuration = '0.01ms'
    }
  }
}

// Validation utilities
export const validationAccessibility = {
  /**
   * Announce validation error to screen readers
   * @param {string} fieldName - Name of the field
   * @param {string} errorMessage - Error message
   */
  announceValidationError(fieldName, errorMessage) {
    ariaUtils.announce(`${fieldName} error: ${errorMessage}`, 'assertive')
  },

  /**
   * Announce validation success to screen readers
   * @param {string} fieldName - Name of the field
   */
  announceValidationSuccess(fieldName) {
    ariaUtils.announce(`${fieldName} is valid`, 'polite')
  }
}

// Export all utilities as default object
export default {
  focusManagement,
  ariaUtils,
  keyboardNavigation,
  colorContrast,
  screenReader,
  formAccessibility,
  motionAccessibility,
  validationAccessibility
}
