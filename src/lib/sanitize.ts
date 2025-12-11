/**
 * Input sanitization utilities
 * Provides defense-in-depth against XSS attacks
 *
 * Note: React already escapes strings by default, but this provides
 * additional security for user-generated content and edge cases.
 */

/**
 * Sanitize a string by removing potentially dangerous characters
 * @param input - Raw string input
 * @returns Sanitized string
 */
export function sanitizeString(input: string | null | undefined): string {
    if (!input) return '';

    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
        .trim();
}

/**
 * Sanitize user display name (username, first name, last name)
 * Allows letters, numbers, spaces, hyphens, apostrophes, and periods
 * @param input - Raw name input
 * @returns Sanitized name
 */
export function sanitizeName(input: string | null | undefined): string {
    if (!input) return '';

    // Allow only safe characters for names
    return input
        .replace(/[^a-zA-Z0-9\s\-'.]/g, '')
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim()
        .slice(0, 100); // Limit length
}

/**
 * Sanitize email address
 * @param input - Raw email input
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(input: string | null | undefined): string {
    if (!input) return '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = input.trim().toLowerCase().slice(0, 254);

    return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param input - Raw URL input
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(input: string | null | undefined): string {
    if (!input) return '';

    const trimmed = input.trim();

    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerCaseUrl = trimmed.toLowerCase();

    for (const protocol of dangerousProtocols) {
        if (lowerCaseUrl.startsWith(protocol)) {
            return '';
        }
    }

    // Only allow http, https, mailto, and relative URLs
    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('mailto:') ||
        trimmed.startsWith('/') ||
        trimmed.startsWith('#')
    ) {
        return trimmed;
    }

    // If no protocol, assume relative URL
    if (!trimmed.includes(':')) {
        return trimmed;
    }

    return '';
}

/**
 * Sanitize HTML by stripping all tags (use for plain text display)
 * @param input - Raw HTML input
 * @returns Plain text without HTML tags
 */
export function stripHtml(input: string | null | undefined): string {
    if (!input) return '';

    return input
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&lt;/g, '<') // Decode common entities
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .trim();
}

/**
 * Sanitize user profile data object
 * @param profile - Raw profile data
 * @returns Sanitized profile data
 */
export interface SanitizedUserProfile {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

export function sanitizeUserProfile(profile: {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
} | null | undefined): SanitizedUserProfile {
    if (!profile) return {
        username: '',
        email: '',
        first_name: '',
        last_name: ''
    };

    return {
        username: sanitizeName(profile.username),
        email: sanitizeEmail(profile.email),
        first_name: sanitizeName(profile.first_name),
        last_name: sanitizeName(profile.last_name),
    };
}

/**
 * Sanitize search query input
 * @param input - Raw search query
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(input: string | null | undefined): string {
    if (!input) return '';

    return input
        .replace(/[<>'"]/g, '') // Remove quotes and angle brackets
        .trim()
        .slice(0, 200); // Limit length
}

/**
 * Check if a string contains potentially malicious patterns
 * @param input - String to check
 * @returns true if suspicious patterns detected
 */
export function containsMaliciousPatterns(input: string): boolean {
    const maliciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<embed/i,
        /<object/i,
        /eval\(/i,
        /expression\(/i,
    ];

    return maliciousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Escape special characters for safe display
 * (React does this automatically, but useful for edge cases)
 * @param input - Raw string
 * @returns Escaped string
 */
export function escapeHtml(input: string | null | undefined): string {
    if (!input) return '';

    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}
