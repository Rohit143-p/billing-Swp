import emailjs from '@emailjs/browser';

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

const EMAIL_CONFIG_KEY = 'revenueflow_emailjs_config';

/**
 * Load EmailJS configuration from LocalStorage or Environment Variables
 */
export function getEmailConfig(): EmailJSConfig {
  try {
    const raw = localStorage.getItem(EMAIL_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.serviceId && parsed.templateId && parsed.publicKey) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load email config from localStorage:', err);
  }

  // Fallback to environment variables or default keys
  return {
    serviceId: (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID || 'service_jcq4xa2',
    templateId: (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID || 'template_pgq4888',
    publicKey: (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY || 'vXjTfF462hHjb6c40'
  };
}

/**
 * Save EmailJS configuration
 */
export function saveEmailConfig(config: EmailJSConfig): void {
  try {
    localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save email config:', err);
  }
}

/**
 * Checks if EmailJS service is configured
 */
export function isEmailServiceConfigured(): boolean {
  const config = getEmailConfig();
  return Boolean(config.serviceId && config.templateId && config.publicKey);
}

/**
 * Dispatches a Welcome Email to newly registered users
 */
export async function sendWelcomeEmail(user: {
  name: string;
  email: string;
  businessName: string;
}): Promise<{ success: boolean; error?: string }> {
  const config = getEmailConfig();

  if (!config.serviceId || !config.templateId || !config.publicKey) {
    console.log(
      `[EmailService] Welcome email for ${user.email} simulated. To enable live inbox delivery, configure EmailJS in Settings.`
    );
    return {
      success: false,
      error: 'EmailJS credentials not configured. Please add Service ID, Template ID, and Public Key in Settings.'
    };
  }

  try {
    const templateParams = {
      to_name: user.name,
      to_email: user.email,
      recipient_email: user.email,
      business_name: user.businessName,
      app_name: 'RevenueFlow Invoicing & Billing',
      login_url: window.location.origin,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      message: `Welcome to RevenueFlow, ${user.name}! Your business workspace "${user.businessName}" has been successfully created. You can now generate GST/standard invoices, track expenses, and manage client settlements.`
    };

    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams,
      config.publicKey
    );

    console.log('[EmailService] Welcome email sent successfully:', response.status, response.text);
    return { success: true };
  } catch (err: any) {
    console.warn('[EmailService] Error sending welcome email:', err);
    return {
      success: false,
      error: err?.text || err?.message || 'Failed to dispatch welcome email.'
    };
  }
}

/**
 * Sends a test verification email to confirm EmailJS setup
 */
export async function sendTestEmail(targetEmail: string): Promise<{ success: boolean; message: string }> {
  const config = getEmailConfig();

  if (!config.serviceId || !config.templateId || !config.publicKey) {
    return {
      success: false,
      message: 'Please fill in Service ID, Template ID, and Public Key before testing.'
    };
  }

  try {
    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      {
        to_name: 'Valued User',
        to_email: targetEmail,
        recipient_email: targetEmail,
        business_name: 'Your Company',
        app_name: 'RevenueFlow Invoicing',
        login_url: window.location.origin,
        date: new Date().toLocaleDateString(),
        message: 'This is a test notification verifying that your RevenueFlow email delivery service is connected and operational.'
      },
      config.publicKey
    );

    return {
      success: true,
      message: `Test email successfully dispatched to ${targetEmail} (Status: ${response.status})`
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.text || err?.message || 'Failed to send test email. Please check your credentials.'
    };
  }
}
