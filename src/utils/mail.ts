import { Resend } from 'resend'
import fs from 'fs'
import path from 'path'
import { envConfig } from '~/constants/config'

const resend = new Resend(envConfig.resendApiKey)
export const EmailTemplate = fs.readFileSync(path.resolve('src/templates/nolimit-email.html'), 'utf8')

export const sendVerifyRegisterEmail = async (
  toAddress: string,
  username: string,
  email_verify_token: string,
  template: string = EmailTemplate
) => {
  try {
    console.log('Sending email...')
    await resend.emails.send({
      from: envConfig.resendFromAddress,
      to: toAddress,
      subject: 'Verify your email',
      html: template
        .replace('{{customer_name}}', username)
        .replace('{{content_1}}', 'Thank you for subscribing to our service. We are delighted to welcome you.')
        .replace('{{content_2}}', 'Please confirm your email by clicking the button below.')
        .replace('{{button_text}}', 'Verify Email')
        .replace('{{button_link}}', `${envConfig.clientUrl}/verify-email?token=${email_verify_token}`)
    })
    console.log('Email sent successfully!')
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

export const sendForgotPassWordEmail = async (
  toAddress: string,
  username: string,
  forgot_password_token: string,
  template: string = EmailTemplate
) => {
  try {
    console.log('Sending email...')
    await resend.emails.send({
      from: envConfig.resendFromAddress,
      to: toAddress,
      subject: 'Reset your password',
      html: template
        .replace('{{customer_name}}', username)
        .replace(
          '{{content_1}}',
          'We received a request to reset your password. If you did not make this request, please ignore this email.'
        )
        .replace('{{content_2}}', 'To reset your password, please click the button below:')
        .replace('{{button_text}}', 'Reset Password')
        .replace('{{button_link}}', `${envConfig.clientUrl}/reset-password?token=${forgot_password_token}`)
    })
    console.log('Email sent successfully!')
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
