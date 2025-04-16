import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      text,
      html: html || text,
    });
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function getReservationStatusEmailContent(status: string, equipment: string) {
  const statusMessages = {
    APPROVED: {
      subject: 'Reservation Approved',
      text: `Your reservation for ${equipment} has been approved. You can now use the equipment during your scheduled time.`,
    },
    REJECTED: {
      subject: 'Reservation Rejected',
      text: `Your reservation for ${equipment} has been rejected. Please contact the administrator for more information.`,
    },
    ONGOING: {
      subject: 'Reservation Started',
      text: `Your reservation for ${equipment} is now active. Please follow all equipment usage guidelines.`,
    },
    FINISHED: {
      subject: 'Reservation Completed',
      text: `Your reservation for ${equipment} has been completed. Thank you for using our service.`,
    },
  };

  return statusMessages[status as keyof typeof statusMessages] || {
    subject: 'Reservation Update',
    text: `Your reservation for ${equipment} status has been updated to ${status}.`,
  };
}
