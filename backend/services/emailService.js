// services/emailService.js
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransport();
  }

  async initializeTransport() {
    try {
      // Configuration based on EMAIL_SERVICE environment variable
      const service = process.env.EMAIL_SERVICE || 'gmail';
      
      let transportConfig = {};

      switch (service.toLowerCase()) {
        case 'gmail':
          transportConfig = {
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS // Use App Password for Gmail
            }
          };
          break;

        case 'outlook':
          transportConfig = {
            service: 'hotmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          };
          break;

        case 'yahoo':
          transportConfig = {
            service: 'yahoo',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          };
          break;

        case 'sendgrid':
          transportConfig = {
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
              user: 'apikey',
              pass: process.env.SENDGRID_API_KEY
            }
          };
          break;

        case 'mailgun':
          transportConfig = {
            host: 'smtp.mailgun.org',
            port: 587,
            secure: false,
            auth: {
              user: process.env.MAILGUN_SMTP_LOGIN,
              pass: process.env.MAILGUN_SMTP_PASSWORD
            }
          };
          break;

        case 'smtp':
        default:
          transportConfig = {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          };
          break;
      }

      this.transporter = nodemailer.createTransport(transportConfig);
      
      // Verify connection
      await this.transporter.verify();
      console.log('Email service connected successfully');
      
    } catch (error) {
      console.error('Email service initialization failed:', error.message);
      this.transporter = null;
    }
  }

  // Load email template
  async loadTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf8');
      
      // Replace variables in template
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, variables[key]);
      });
      
      return template;
    } catch (error) {
      console.error(`Failed to load email template ${templateName}:`, error.message);
      return this.getDefaultTemplate(templateName, variables);
    }
  }

  // Fallback template if file not found
  getDefaultTemplate(templateName, variables) {
    const defaultTemplates = {
      'welcome': `
        <h2>Welcome to Career Reach Hub!</h2>
        <p>Hi ${variables.userName},</p>
        <p>Welcome to Career Reach Hub! We're excited to have you on board.</p>
        <p>Start exploring opportunities and building your career today.</p>
        <a href="${variables.dashboardUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      `,
      'application-status': `
        <h2>Application Status Update</h2>
        <p>Hi ${variables.userName},</p>
        <p>Your application for <strong>${variables.resourceTitle}</strong> has been <strong>${variables.status}</strong>.</p>
        ${variables.reviewNotes ? `<p><strong>Notes:</strong> ${variables.reviewNotes}</p>` : ''}
        <a href="${variables.dashboardUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Application</a>
      `,
      'new-resource': `
        <h2>New Opportunity Available!</h2>
        <p>Hi ${variables.userName},</p>
        <p>A new ${variables.resourceType} opportunity has been posted: <strong>${variables.resourceTitle}</strong></p>
        <p>${variables.resourceDescription}</p>
        <a href="${variables.resourceUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Opportunity</a>
      `,
      'announcement': `
        <h2>${variables.announcementTitle}</h2>
        <p>Hi ${variables.userName},</p>
        <p>${variables.announcementContent}</p>
        <a href="${variables.dashboardUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      `
    };

    return defaultTemplates[templateName] || `<p>${variables.message || 'No content available'}</p>`;
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    if (!this.transporter) return { success: false, message: 'Email service not configured' };

    try {
      const variables = {
        userName: user.name,
        userEmail: user.email,
        dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@careerreachhub.com'
      };

      const html = await this.loadTemplate('welcome', variables);

      const mailOptions = {
        from: {
          name: 'Career Reach Hub',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER
        },
        to: user.email,
        subject: 'Welcome to Career Reach Hub! 🎉',
        html,
        text: `Welcome to Career Reach Hub, ${user.name}! Start exploring opportunities at ${variables.dashboardUrl}`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send welcome email:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Send application status update email
  async sendApplicationStatusEmail(application, status, reviewNotes = '') {
    if (!this.transporter) return { success: false, message: 'Email service not configured' };

    try {
      const variables = {
        userName: application.user.name,
        resourceTitle: application.resource.title,
        resourceType: application.resource.type,
        status: status.charAt(0).toUpperCase() + status.slice(1),
        reviewNotes,
        dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
        applicationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/applications/${application._id}`
      };

      const html = await this.loadTemplate('application-status', variables);
      
      const statusEmojis = {
        approved: '✅',
        rejected: '❌',
        under_review: '👀',
        pending: '⏳'
      };

      const mailOptions = {
        from: {
          name: 'Career Reach Hub',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER
        },
        to: application.user.email,
        subject: `Application ${variables.status} ${statusEmojis[status] || ''} - ${application.resource.title}`,
        html,
        text: `Hi ${application.user.name}, your application for ${application.resource.title} has been ${status}.`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Application status email sent successfully:', result.messageId);
      
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send application status email:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Send new resource notification email
  async sendNewResourceEmail(users, resource) {
    if (!this.transporter) return { success: false, message: 'Email service not configured' };
    
    const results = [];
    
    for (const user of users) {
      try {
        // Check if user has email notifications enabled
        if (!user.subscriptions?.newResources) continue;

        const variables = {
          userName: user.name,
          resourceTitle: resource.title,
          resourceType: resource.type,
          resourceDescription: resource.description,
          company: resource.details?.company || 'N/A',
          location: resource.details?.location || 'N/A',
          deadline: new Date(resource.applicationDeadline).toLocaleDateString(),
          resourceUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/resources/${resource._id}`,
          dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
        };

        const html = await this.loadTemplate('new-resource', variables);

        const mailOptions = {
          from: {
            name: 'Career Reach Hub',
            address: process.env.EMAIL_FROM || process.env.EMAIL_USER
          },
          to: user.email,
          subject: `New ${resource.type} opportunity: ${resource.title} 🚀`,
          html,
          text: `New ${resource.type} opportunity available: ${resource.title}. Apply at ${variables.resourceUrl}`
        };

        const result = await this.transporter.sendMail(mailOptions);
        results.push({ success: true, email: user.email, messageId: result.messageId });
        
      } catch (error) {
        console.error(`Failed to send new resource email to ${user.email}:`, error.message);
        results.push({ success: false, email: user.email, error: error.message });
      }
    }

    console.log(`New resource emails sent to ${results.filter(r => r.success).length}/${users.length} users`);
    return results;
  }

  // Send announcement email
  async sendAnnouncementEmail(users, announcement) {
    if (!this.transporter) return { success: false, message: 'Email service not configured' };
    
    const results = [];
    
    for (const user of users) {
      try {
        // Check if user has announcement notifications enabled
        if (!user.subscriptions?.announcements) continue;

        const variables = {
          userName: user.name,
          announcementTitle: announcement.title,
          announcementContent: announcement.content,
          priority: announcement.priority,
          dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
          announcementUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/announcements/${announcement._id}`
        };

        const html = await this.loadTemplate('announcement', variables);

        const priorityEmojis = {
          low: '📢',
          medium: '📣',
          high: '🚨',
          urgent: '🆘'
        };

        const mailOptions = {
          from: {
            name: 'Career Reach Hub',
            address: process.env.EMAIL_FROM || process.env.EMAIL_USER
          },
          to: user.email,
          subject: `${priorityEmojis[announcement.priority] || '📢'} ${announcement.title}`,
          html,
          text: `${announcement.title}\n\n${announcement.content}\n\nView at: ${variables.dashboardUrl}`
        };

        const result = await this.transporter.sendMail(mailOptions);
        results.push({ success: true, email: user.email, messageId: result.messageId });
        
      } catch (error) {
        console.error(`Failed to send announcement email to ${user.email}:`, error.message);
        results.push({ success: false, email: user.email, error: error.message });
      }
    }

    console.log(`Announcement emails sent to ${results.filter(r => r.success).length}/${users.length} users`);
    return results;
  }

  // Send bulk emails with rate limiting
  async sendBulkEmails(emails, delayMs = 100) {
    const results = [];
    
    for (let i = 0; i < emails.length; i++) {
      try {
        const result = await this.transporter.sendMail(emails[i]);
        results.push({ success: true, messageId: result.messageId, index: i });
        
        // Add delay to respect rate limits
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        console.error(`Bulk email ${i} failed:`, error.message);
        results.push({ success: false, error: error.message, index: i });
      }
    }
    
    return results;
  }

  // Test email configuration
  async testEmailConnection() {
    if (!this.transporter) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Send test email
  async sendTestEmail(toEmail) {
    if (!this.transporter) return { success: false, message: 'Email service not configured' };

    try {
      const mailOptions = {
        from: {
          name: 'Career Reach Hub',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER
        },
        to: toEmail,
        subject: 'Test Email - Career Reach Hub',
        html: `
          <h2>Email Test Successful! 🎉</h2>
          <p>This is a test email from Career Reach Hub.</p>
          <p>Your email service is configured correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        `,
        text: 'Email test successful! Career Reach Hub email service is working correctly.'
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;