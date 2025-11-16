Privacy, Consent, and Data Handling Guidelines

Purpose
- This system is intended to improve delivery operations by allowing real-time visibility of courier locations during work. It must be used lawfully and with explicit, informed consent.

Key Principles
- Transparency: Clearly inform couriers about what data is collected (location, timestamp, optional speed/heading, optional battery), why, and for how long.
- Consent: Obtain explicit opt-in consent before starting tracking; allow couriers to stop sharing at any time.
- Minimization: Collect only what is needed; limit tracking to work hours or active jobs whenever possible.
- Security: Use HTTPS/WSS in production. Implement authentication and authorization to restrict access to location data.
- Retention: Define a retention period (e.g., 30–90 days) and automatically delete older data unless required for compliance.
- Access: Limit access to managers with a legitimate business need; log access for audit.
- No Call Interception: Do not intercept or record PSTN phone calls. If recording calls is required in your own VoIP app, obtain explicit consent from all parties and follow local laws.

Implementation Notes
- Mobile UI must include an always-available control to start/stop sharing.
- Android: use a visible Foreground Service for background tracking; show a persistent notification.
- iOS: if background tracking is needed, use appropriate Info.plist keys and background modes; show system indicators and in-app disclosures.
- Use server-side auth (e.g., OAuth2/JWT) and rotate credentials. Apply rate limits and input validation.
- Encrypt data at rest in production and backup securely with limited access.

Data Subjects’ Rights
- Provide mechanisms for couriers to request access, correction, or deletion of their personal data in accordance with applicable laws (e.g., GDPR/CCPA).



