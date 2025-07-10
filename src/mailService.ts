const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:3001' : '/api');

export class EmailService {
    static async sendEmail(emailData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send email');
            }

            return result;
        } catch (error) {
            console.error('Email service error:', error);
            throw error;
        }
    }
}