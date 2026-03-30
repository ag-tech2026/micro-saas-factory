import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPaymentConfirmationEmail(
  to: string,
  userName: string,
  productName: string,
  amount: number
) {
  try {
    await resend.emails.send({
      from: `${productName} <onboarding@resend.dev>`,
      to,
      subject: `Payment Confirmed - ${productName}`,
      html: `
        <h1>Payment Confirmed 🎉</h1>
        <p>Hi ${userName},</p>
        <p>Your payment of $${(amount / 100).toFixed(2)} has been processed successfully.</p>
        <p>Your subscription is now active. You can continue using ${productName} without interruptions.</p>
        <p>Thank you for your support!</p>
        <p>— The ${productName} Team</p>
      `
    })
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error)
    throw error
  }
}

export async function sendAnalysisCompleteEmail(
  to: string,
  userName: string,
  productName: string,
  analysisId: string
) {
  try {
    await resend.emails.send({
      from: `${productName} <onboarding@resend.dev>`,
      to,
      subject: `Your analysis is ready - ${productName}`,
      html: `
        <h1>Analysis Complete</h1>
        <p>Hi ${userName},</p>
        <p>Your analysis is ready! View the results here:</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/analysis/${analysisId}">View Analysis</a></p>
        <p>— The ${productName} Team</p>
      `
    })
  } catch (error) {
    console.error('Failed to send analysis complete email:', error)
    throw error
  }
}

export async function sendLowCreditsEmail(
  to: string,
  userName: string,
  productName: string,
  creditsRemaining: number
) {
  try {
    await resend.emails.send({
      from: `${productName} <onboarding@resend.dev>`,
      to,
      subject: `Your ${productName} credits are running low`,
      html: `
        <h1>Low Credits Alert</h1>
        <p>Hi ${userName},</p>
        <p>You have ${creditsRemaining} credits remaining in your ${productName} account.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Purchase more credits</a> to continue using the service.</p>
        <p>— The ${productName} Team</p>
      `
    })
  } catch (error) {
    console.error('Failed to send low credits email:', error)
    throw error
  }
}
