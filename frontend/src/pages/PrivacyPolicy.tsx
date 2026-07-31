import { useEffect } from 'react'
import { trackScreenView } from '../services/events'

export default function PrivacyPolicy() {
  useEffect(() => { trackScreenView('privacy-policy') }, [])
  return (
    <div className="privacy-page">
      <style>{`
        .privacy-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          font-size: 14px;
          line-height: 1.65;
          color: #1a1a1a;
          background: #ffffff;
          -webkit-font-smoothing: antialiased;
        }
        .privacy-page .page {
          max-width: 860px;
          margin: 0 auto;
          padding: 52px 48px 80px;
        }
        .privacy-page .page-title {
          font-size: 32px;
          font-weight: 700;
          color: #000;
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }
        .privacy-page .meta {
          font-size: 13px;
          color: #1a1a1a;
          margin-bottom: 2px;
        }
        .privacy-page .meta-dates {
          margin-bottom: 40px;
        }
        .privacy-page h2 {
          font-size: 16px;
          font-weight: 700;
          color: #000;
          margin: 36px 0 10px;
        }
        .privacy-page h3 {
          font-size: 14px;
          font-weight: 700;
          color: #000;
          margin: 22px 0 8px;
        }
        .privacy-page p {
          font-size: 14px;
          color: #1a1a1a;
          margin-bottom: 10px;
          line-height: 1.65;
        }
        .privacy-page ul {
          margin: 6px 0 10px 20px;
        }
        .privacy-page ul li {
          font-size: 14px;
          color: #1a1a1a;
          line-height: 1.65;
          margin-bottom: 3px;
          list-style-type: disc;
        }
        .privacy-page strong { font-weight: 700; }
        .privacy-page em { font-style: italic; }
        .privacy-page a { color: #1a1a1a; text-decoration: underline; }
        .privacy-page .section p + p { margin-top: 0; }
        .privacy-page .section p:last-child { margin-bottom: 0; }
        @media (max-width: 640px) {
          .privacy-page .page { padding: 28px 20px 56px; }
          .privacy-page .page-title { font-size: 26px; }
          .privacy-page h2 { font-size: 15px; }
        }
      `}</style>

      <div className="page">
        <h1 className="page-title">Privacy Policy</h1>
        <p className="meta">MarketCompare</p>
        <div className="meta-dates">
          <p className="meta">Effective Date: July 29, 2026</p>
          <p className="meta">Last Updated: July 29, 2026</p>
        </div>

        <div className="section">
          <h2>1. Introduction</h2>
          <p>Welcome to MarketCompare.</p>
          <p>We are committed to protecting the personal information of everyone who uses our platform. This Privacy Policy explains what information we collect, how we use it, who we share it with, and what rights you have over your data.</p>
          <p>MarketCompare is a crowd-sourced food price comparison platform that helps households, students, and shoppers compare food prices across nearby markets before they travel. We are currently operated as an unregistered platform based in Ibadan, Nigeria.</p>
          <p>By using MarketCompare, whether through our website, mobile application, or any related service, you agree to the terms of this Privacy Policy. If you do not agree, please stop using the platform.</p>
          <p>If you have any questions about this policy, contact us at: Email: info@marketcompare.ng Address: Ibadan, Nigeria</p>
        </div>

        <div className="section">
          <h2>2. Who This Policy Applies To</h2>
          <p>This policy applies to all users of the MarketCompare platform, including:</p>
          <ul>
            <li>Visitors who browse the platform without creating an account</li>
            <li>Registered users who submit prices, flag entries, or track items</li>
            <li>Any person who contacts us through our email or other channels</li>
          </ul>
          <p>MarketCompare is intended for users aged 10 years and above. If you are under 10, please do not use this platform without the direct supervision of a parent or guardian. We do not knowingly collect personal data from children under the age of 10. If we become aware that we have collected data from a child under 10 without verifiable parental consent, we will delete that data promptly. If you are a parent or guardian and believe your child has submitted personal data to us, please contact us at info@marketcompare.ng.</p>
        </div>

        <div className="section">
          <h2>3. What Information We Collect</h2>
          <p>We collect only the information necessary to provide and improve our service. We do not collect more than we need.</p>

          <h3>3.1 Information You Give Us Directly</h3>
          <p>When you create an account or interact with the platform, you may provide:</p>
          <ul>
            <li>Name — your display name or full name at registration</li>
            <li>Email address — used to create and manage your account</li>
            <li>Password — stored in encrypted form; we never store plain text passwords</li>
            <li>Price submissions — the food item, price, unit, market name, and any optional note you submit</li>
            <li>Flag reports — the reason you flag a price as incorrect</li>
            <li>Communications — any messages you send us by email</li>
          </ul>

          <h3>3.2 Location Information</h3>
          <p>MarketCompare does not collect your GPS location or real-time location data. Any market or city information on the platform is selected manually by you. We do not track where you are physically located.</p>

          <h3>3.3 Information We Do Not Collect</h3>
          <p>We do not collect:</p>
          <ul>
            <li>Payment card numbers or bank account details (the platform currently has no payment functionality)</li>
            <li>Government identification numbers</li>
            <li>Biometric data</li>
            <li>Sensitive personal data such as health information, religion, or ethnicity</li>
          </ul>
        </div>

        <div className="section">
          <h2>4. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul>
            <li>Account Basis Under Nigerian law, create and manage your account<strong>Contract</strong> — necessary to provide the service you requested To display price submissions on the platform<strong>Contract</strong> — your submissions are the core service To review flagged price reports<strong>Legitimate Interest</strong> — to maintain data accuracy To send you important account or notification<strong>Contract</strong> to send service alerts notifications (future paid feature)<strong>Consent</strong> — you will be asked to opt in separately To analyse platform usage and improve the service<strong>Legitimate Interest</strong> — to improve our product To detect fraud, abuse, or security threats<strong>Legitimate Interest</strong> — to protect users and the platform To comply with legal obligations<strong>Legal obligation</strong></li>
          </ul>
          <p>We will never use your personal data for purposes that are incompatible with the ones listed above without first notifying you and, where required, obtaining your consent.</p>
        </div>

        <div className="section">
          <h2>5. Price Submissions and Public Data</h2>
          <p>Please be aware that price submissions you make are publicly visible on the platform. Anyone visiting MarketCompare can see the food item, market, price, and any note you attach to a submission.</p>
          <p>Your name and email address are never shown publicly. Price submissions are displayed anonymously to other users.</p>
          <p>By submitting a price, you confirm that the information you are providing is accurate to the best of your knowledge.</p>
        </div>

        <div className="section">
          <h2>6. Third-Party Services We Use or Plan to Use</h2>
          <p>We use, or intend to use, the following third-party services that may process some of your data. Each is bound by their own privacy policy.</p>
          <p>Currently or Planned for Use</p>
          <p>Cloudflare We use or plan to use Cloudflare for infrastructure, security, and email delivery services. Cloudflare may process your IP address and device information as part of its security and network functions. Cloudflare's privacy policy is available at cloudflare.com/privacypolicy.</p>
          <p>Google Analytics We plan to use Google Analytics to understand how users interact with the platform. Google Analytics uses cookies and similar technologies to collect anonymised usage data. You can opt out of Google Analytics tracking using the Google Analytics Opt-Out browser add-on at tools.google.com/dlpage/gaoptout. Google's privacy policy is available at policies.google.com/privacy.</p>
          <p>Future Advertising Partners If we decide in the future to use advertising services to display relevant advertisements on the platform, if and when this is implemented, we will update this policy and notify users. You will be able to manage your advertising preferences through Google's Ad Settings at adssettings.google.com.</p>
          <p>What We Will Never Do:</p>
          <ul>
            <li>Sell your personal data to any third party</li>
            <li>Share your personal data with third parties for their own marketing purposes without your explicit consent</li>
            <li>Allow third parties to use your data in ways not described in this policy</li>
          </ul>
        </div>

        <div className="section">
          <h2>7. Price Alert Notifications (Future Feature)</h2>
          <p>We intend to add a feature that allows users to receive notifications when the price of a selected food item changes beyond a chosen threshold.</p>
          <p>If and when this feature is introduced:</p>
          <ul>
            <li>You will be asked to explicitly opt in before receiving any alerts</li>
            <li>You will be able to choose your preferred notification method (email or in-app)</li>
            <li>You can cancel your alerts or your subscription at any time</li>
            <li>Your alert preferences and tracked items will be stored securely and used only to deliver the alerts you have requested</li>
          </ul>
          <p>We will update this Privacy Policy before launching this feature and will notify registered users.</p>
        </div>

        <div className="section">
          <h2>8. Cookies and Similar Technologies</h2>
          <p>MarketCompare may use cookies and similar tracking technologies to:</p>
          <ul>
            <li>Keep you logged in to your account</li>
            <li>Remember your preferences (such as your selected market or food item)</li>
            <li>Collect anonymised analytics data to improve the platform</li>
          </ul>
          <p>Types of cookies we use:</p>
          <ul>
            <li>Essential cookies — required for the platform to function. Cannot be disabled.</li>
            <li>Analytics cookies — help us understand usage patterns. You can opt out.</li>
            <li>Advertising cookies — may be used in the future if advertising is introduced. You will be asked for consent before these are activated.</li>
          </ul>
          <p>You can control cookies through your browser settings. Disabling essential cookies may affect how the platform functions.</p>
        </div>

        <div className="section">
          <h2>9. Data Retention</h2>
          <p>We retain your personal data for as long as your account is active.</p>
          <ul>
            <li>If you delete your account, we will delete your personal data within 30 days of the deletion request, except where we are required to retain it by law.</li>
            <li>Price submissions you have made are community data and may be retained in anonymised form after your account is deleted, as they form part of the platform's historical price data.</li>
            <li>Flag reports and moderation records may be retained for up to 12 months after submission for platform integrity purposes.</li>
            <li>Technical logs (server logs, IP addresses) are automatically deleted after 90 days.</li>
          </ul>
          <p>If you would like your data deleted before your account is deleted, contact us at info@marketcompare.ng.</p>
        </div>

        <div className="section">
          <h2>10. Your Rights Under the Nigeria Data Protection Regulation (NDPR)</h2>
          <p>Under the 2019 NDPR, you have the following rights in relation to your personal data:</p>
          <ul>
            <li>Right to Access You have the right to request a copy of the personal data we hold about you.</li>
            <li>Right to Rectification You have the right to request that we correct any personal data that is inaccurate or incomplete.</li>
            <li>Right to Erasure You have the right to request that we delete your personal data. You can do this at any time by deleting your account or contacting us directly.</li>
            <li>Right to Restrict Processing You have the right to request that we limit how we use your personal data in certain circumstances.</li>
            <li>Right to Data Portability You have the right to receive your personal data in a structured, commonly used, machine-readable format.</li>
            <li>Right to Object You have the right to object to the processing of your personal data for purposes based on our legitimate interests. You also have an unconditional right to object to processing for direct marketing purposes at any time.</li>
            <li>Right to Withdraw Consent Where we rely on your consent to process your data (for example, for price alert notifications), you have the right to withdraw that consent at any time without affecting the lawfulness of processing carried out before the withdrawal.</li>
          </ul>
          <p>How to Exercise Your Rights: To exercise any of the above rights, contact us at info@marketcompare.ng. We will respond to your request within 30 days. We may need to verify your identity before processing your request.</p>
          <p>If you are unsatisfied with how we handle your request, you have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng.</p>
        </div>

        <div className="section">
          <h2>11. Data Security</h2>
          <p>We take the security of your personal data seriously. We implement the following measures to protect your information:</p>
          <ul>
            <li>All passwords are stored using strong encryption — we cannot read your password</li>
            <li>All data transmission between your device and our servers uses HTTPS encryption</li>
            <li>Access to user data is restricted to authorised personnel only</li>
            <li>We use Cloudflare's security infrastructure to protect against attacks and unauthorised access</li>
          </ul>
          <p>However, no system is completely secure. We cannot guarantee the absolute security of data transmitted over the internet. If you believe your account has been compromised, contact us immediately at info@marketcompare.ng.</p>
          <p>In the event of a data breach that is likely to result in a risk to your rights and freedoms, we will notify the relevant authority and affected users in accordance with our obligations under the NDPR.</p>
        </div>

        <div className="section">
          <h2>12. Links to Other Websites</h2>
          <p>MarketCompare may contain links to third-party websites. This Privacy Policy does not apply to those websites. We encourage you to read the privacy policies of any external sites you visit. We are not responsible for the content or privacy practices of third-party websites.</p>
        </div>

        <div className="section">
          <h2>13. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time as the platform grows and changes. When we make significant changes, we will:</p>
          <ul>
            <li>Update the "Last Updated" date at the top of this policy</li>
            <li>Notify registered users by email where the changes are material</li>
            <li>Display a notice on the platform for a reasonable period after the update</li>
          </ul>
          <p>Your continued use of MarketCompare after any changes to this policy constitutes your acceptance of the updated terms. If you do not agree with the changes, you should stop using the platform and delete your account.</p>
        </div>

        <div className="section">
          <h2>14. Contact Us</h2>
          <p>If you have any questions, concerns, or requests about this Privacy Policy or how we handle your personal data, please contact us:</p>
          <p>MarketCompare Email: info@marketcompare.ng Phone: +234 813 9444 569 Location: Ibadan, Nigeria</p>
          <p>We aim to respond to all privacy-related enquiries within 5 business days.</p>
          <p>This Privacy Policy is governed by and construed in accordance with the laws of the Federal Republic of Nigeria, including the Nigeria Data Protection Regulation (NDPR) 2019 and the Nigeria Data Protection Act 2023. Any disputes arising from this policy shall be subject to the jurisdiction of Nigerian courts.</p>
          <p>A few important notes before you publish this:</p>
          <ul>
            <li>Unregistered status — the policy currently lists MarketCompare as an unregistered platform. Once you register the business, update Section 1 with the full legal name and registration number. Under NDPR, registered businesses processing personal data above a certain threshold are required to file a data protection audit and engage a Data Protection Compliance Organisation (DPCO). Keep this in mind as you grow.</li>
            <li>The age — 10+ is a reasonable starting point but Nigerian law does not set a specific digital minimum age the way GDPR does for under-13. If you ever expand internationally you will need to revisit this.</li>
            <li>Google Ads — if you introduce Google Advertising, you will need to add a cookie consent banner to the platform before activating it. This policy already covers it in principle but the banner is the implementation piece.</li>
            <li>Want me to create a shorter, plain-language version of this for your website's cookie consent banner or a Terms of Use document to go alongside it?</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
