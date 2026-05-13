"use client";
import Image from "next/image";
import { useState } from "react";

type PolicyType = "terms" | "privacy" | "shipping" | "refund" | null;

function PolicyModal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-700 cursor-pointer"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <div className="px-6 py-5 overflow-y-auto text-sm text-neutral-700 leading-relaxed space-y-4 policy-content">
          {children}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-neutral-900 text-[15px] mt-2">{children}</h3>;
}

export default function Footer() {
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  return (
    <>
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <Image src="/logo-mobile.svg" alt="SpendWise" width={150} height={50} className="h-14 w-auto object-contain mb-2" />
              <p className="text-xs text-neutral-500 mt-2 max-w-xs leading-relaxed">
                AI infrastructure spend optimization tool. Find discounts on AI and cloud credits from companies that overforecasted.
              </p>
              <a href="mailto:connect.with.karam25@gmail.com" className="text-xs text-neutral-400 mt-3">connect.with.karam25@gmail.com</a>
            </div>
            <div className="flex gap-12">
              <div className="flex flex-col gap-2.5">
                <span className="font-medium text-neutral-900 uppercase tracking-wider text-[11px] mb-1">Product</span>
                <a href="#audit" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">Run Audit</a>
                <a href="#how-it-works" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">How it Works</a>
                <a href="#platforms" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">Platforms</a>
                <a href="#guarantee" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">Guarantee</a>
                <a href="#faq" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">FAQ</a>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="font-medium text-neutral-900 uppercase tracking-wider text-[11px] mb-1">Company</span>
                <a href="#" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">SpendWise</a>
                <a href="#" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">Buy Credits</a>
                <a href="#" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">Sell Credits</a>
              </div>
            </div>
            <div>
              <span className="font-medium text-neutral-900 uppercase tracking-wider text-[11px] mb-2 block">Location</span>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-neutral-700">Remote</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400">
            <p>&copy; {new Date().getFullYear()} SpendWise</p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <button onClick={() => setActivePolicy("terms")} className="hover:text-neutral-700 transition-colors cursor-pointer bg-transparent border-none p-0 text-[11px] text-neutral-400">Terms &amp; Conditions</button>
              <span className="text-neutral-300">•</span>
              <button onClick={() => setActivePolicy("privacy")} className="hover:text-neutral-700 transition-colors cursor-pointer bg-transparent border-none p-0 text-[11px] text-neutral-400">Privacy</button>
              <span className="text-neutral-300">•</span>
              <button onClick={() => setActivePolicy("shipping")} className="hover:text-neutral-700 transition-colors cursor-pointer bg-transparent border-none p-0 text-[11px] text-neutral-400">Shipping Policy</button>
              <span className="text-neutral-300">•</span>
              <button onClick={() => setActivePolicy("refund")} className="hover:text-neutral-700 transition-colors cursor-pointer bg-transparent border-none p-0 text-[11px] text-neutral-400">Refund Policy</button>
              <a href="https://www.linkedin.com/in/karam46" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700 transition-colors">
               <Image src="linkedin-svgrepo-com.svg" alt="LinkedIn" width={20} height={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <PolicyModal open={activePolicy === "terms"} onClose={() => setActivePolicy(null)} title="Terms & Conditions">
        <p>Welcome to SpendWise! These Terms and Conditions (&quot;Agreement&quot;) govern your access to and use of our services, including the purchase and transfer of unused cloud, AI Model credits and other SaaS platforms (e.g., OpenAI, Claude, AWS, GCP) from verified sources. By using our website and services, you agree to be bound by these terms.</p>

        <SectionTitle>1. Acceptance of Terms</SectionTitle>
        <p>By accessing or using the SpendWise website and services, you (&quot;User&quot;, &quot;Customer&quot;, &quot;Buyer&quot;, or &quot;Seller&quot;) agree to comply with these Terms and Conditions. If you do not agree with any part of these terms, do not use the services.</p>

        <SectionTitle>2. Services Provided</SectionTitle>
        <p>SpendWise operates as a verified marketplace for unused cloud, AI Model credits and other SaaS platforms. We facilitate the transfer of unused, verified credits from sellers to buyers at a discounted rate. Our services include:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Buying unused credits from verified companies and startups.</li>
          <li>Selling verified credits at discounted rates.</li>
          <li>Transferring ownership or credentials for the purchased credits.</li>
        </ul>

        <SectionTitle>3. Eligibility</SectionTitle>
        <p>You must be at least 18 years old and legally capable of entering into binding contracts to use our services.</p>

        <SectionTitle>4. Account Ownership and Transfer</SectionTitle>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Ownership Transfer:</strong> The account associated with the credits will be transferred to the email address or admin account specified by you.</li>
          <li><strong>Credential Transfer:</strong> Once ownership is transferred, you can change passwords and set up two-factor authentication (2FA) for additional security.</li>
        </ul>
        <p>SpendWise ensures the legitimacy of the credits being transferred but is not liable for any misuses post-transfer.</p>

        <SectionTitle>5. Data Access and Confidentiality</SectionTitle>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>No Data Collection Post-Transfer:</strong> SpendWise does not retain any rights to or access to data within transferred accounts once ownership transfer is complete.</li>
          <li><strong>Confidential Data:</strong> After ownership transfer, all data is solely under your control and responsibility.</li>
          <li><strong>Confidentiality:</strong> SpendWise agrees to maintain confidentiality of proprietary information as outlined in the NDA.</li>
        </ul>

        <SectionTitle>6. Pricing and Payment</SectionTitle>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Prices:</strong> Prices vary depending on the type and quantity of credits. They may change without prior notice.</li>
          <li><strong>Payment:</strong> Payments are made through available payment methods. Users must ensure payment details are correct and up to date.</li>
        </ul>

        <SectionTitle>7. Delivery and Timelines</SectionTitle>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Delivery:</strong> Ownership of credits will be transferred within one week after payment and paperwork completion.</li>
          <li><strong>Refund and Replacement:</strong> If credits become inaccessible, SpendWise will replace or refund the unused portion with valid proof.</li>
        </ul>

        <SectionTitle>8. User Responsibilities</SectionTitle>
        <p>Once the ownership of the credits has been transferred, the user assumes full responsibility for the credits, including:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ensuring the proper use of credits in accordance with the terms of the respective credit providers (e.g., OpenAI, AWS).</li>
          <li>Securing their accounts, including passwords and 2FA settings.</li>
        </ul>

        <SectionTitle>9. Limitation of Liability</SectionTitle>
        <p>SpendWise is not liable for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Any loss or damage caused by the use or inability to use the credits.</li>
          <li>Any third-party claims or issues arising from the use of credits.</li>
          <li>Any unauthorized access to accounts or breaches of security after the transfer.</li>
        </ul>
        <p>SpendWise&apos;s liability is limited to the amount paid for the credits.</p>

        <SectionTitle>10. Indemnification</SectionTitle>
        <p>Users agree to indemnify and hold harmless SpendWise, its affiliates, directors, officers, and employees from any claims, damages, or liabilities arising from their use of services or violation of these Terms.</p>

        <SectionTitle>11. Governing Law and Dispute Resolution</SectionTitle>
        <p>This Agreement will be governed by the laws of the Dubai International Financial Centre (DIFC). Any disputes will be resolved through binding arbitration under the rules of the Dubai International Arbitration Centre (DIAC) Rules 2022, with venue and seat in DIFC, Dubai, United Arab Emirates.</p>

        <SectionTitle>12. Changes to Terms</SectionTitle>
        <p>SpendWise reserves the right to modify or amend these Terms at any time. Updates will be posted on this page, and it is your responsibility to review them periodically.</p>

        <SectionTitle>13. Termination</SectionTitle>
        <p>SpendWise reserves the right to suspend or terminate access to its services for any user who violates these Terms and Conditions.</p>
      </PolicyModal>


      <PolicyModal open={activePolicy === "privacy"} onClose={() => setActivePolicy(null)} title="Privacy Policy">
        <p>At SpendWise, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy explains how we collect, use, and safeguard your personal data when you use our website and services.</p>

        <SectionTitle>1. Information We Collect</SectionTitle>
        <p>We collect two types of information:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Personal Information:</strong> When you sign up for our services or make a purchase, we collect personal details such as name, email address, company name, billing information, and transaction details.</li>
          <li><strong>Non-Personal Information:</strong> We also collect information about how you interact with our website, such as IP addresses, browser type, and browsing activity.</li>
        </ul>

        <SectionTitle>2. How We Use Your Information</SectionTitle>
        <p>We use your information for the following purposes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>To facilitate credit purchases, transfers, and account management.</li>
          <li>To communicate with you regarding your transactions, account status, and any customer support inquiries.</li>
          <li>To send you marketing communications (only if you have opted in).</li>
        </ul>

        <SectionTitle>3. Sharing Your Information</SectionTitle>
        <p>We do not sell your personal information. We may share your data with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Service Providers:</strong> Third-party companies that assist in processing payments or providing customer support.</li>
          <li><strong>Legal Obligations:</strong> We may disclose your information to comply with legal obligations or protect our rights.</li>
        </ul>

        <SectionTitle>4. Data Security</SectionTitle>
        <p>We employ industry-standard security measures, such as encryption and secure servers, to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

        <SectionTitle>5. Cookies</SectionTitle>
        <p>Our website uses cookies to enhance your user experience. Cookies are small data files stored on your device that help us remember your preferences and track your usage patterns.</p>

        <SectionTitle>6. Your Rights</SectionTitle>
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access, correct, or delete your personal information.</li>
          <li>Opt out of receiving marketing communications from us.</li>
          <li>Request data portability, where applicable.</li>
        </ul>
        <p>To exercise any of these rights, please contact us at <a href="mailto:connect.with.karam25@gmail.com" className="text-sky-600 hover:underline">connect.with.karam25@gmail.com</a></p>

        <SectionTitle>7. Data Retention</SectionTitle>
        <p>We will retain your personal data only for as long as necessary for the purposes outlined in this Privacy Policy, or as required by law.</p>

        <SectionTitle>8. Changes to This Policy</SectionTitle>
        <p>SpendWise reserves the right to update or modify this Privacy Policy at any time. We will notify you of any significant changes by posting an updated version on our website.</p>

        <SectionTitle>9. Contact Information</SectionTitle>
        <p>If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact us at <a href="mailto:connect.with.karam25@gmail.com" className="text-sky-600 hover:underline">connect.with.karam25@gmail.com</a></p>
      </PolicyModal>

      <PolicyModal open={activePolicy === "shipping"} onClose={() => setActivePolicy(null)} title="Shipping & Delivery Policy">
        <SectionTitle>1. Delivery Timelines</SectionTitle>
        <p>For digital products, transfers are completed via secure digital means.</p>
        <p>Ownership or credentials of purchased credits will be transferred to the buyer&apos;s registered email or platform account within 0–7 days of confirmed payment, as per our Terms &amp; Conditions (Section 7).</p>
        <p>Delivery timelines may vary depending on verification processes, platform policies (e.g., OpenAI, AWS, GCP), and order volume.</p>

        <SectionTitle>2. Delivery Confirmation</SectionTitle>
        <p>Upon successful transfer, customers will receive a confirmation email and supporting documentation or invoice from SpendWise.</p>
        <p>For physical correspondence (if applicable), orders will be shipped through registered courier or postal services, with tracking details shared upon dispatch.</p>

        <SectionTitle>3. Delays &amp; Liability</SectionTitle>
        <p>SpendWise ensures timely handover of all digital assets to customers but is not responsible for delays caused by third-party service providers or platform restrictions (used for payments, bills, etc.).</p>
        <p>Our liability is limited to the value of the purchased order.</p>

        <SectionTitle>4. Contact Information</SectionTitle>
        <p>For order status, delivery, or refund inquiries, please contact our customer support team:</p>
        <p>📧 <a href="mailto:connect.with.karam25@gmail.com" className="text-sky-600 hover:underline">connect.with.karam25@gmail.com</a></p>
      </PolicyModal>

  
      <PolicyModal open={activePolicy === "refund"} onClose={() => setActivePolicy(null)} title="Cancellation & Refund Policy">
        <p>SpendWise believes in helping its customers as much as possible and follows a transparent and fair cancellation and refund policy.</p>

        <SectionTitle>1. Order Cancellation</SectionTitle>
        <p>Cancellation requests will be accepted within 7 days of placing the order, provided the transfer or processing has not yet begun.</p>
        <p>Once the ownership transfer of credits or accounts has been initiated (as per Section 4 of our Terms &amp; Conditions), cancellation requests cannot be accommodated.</p>
        <p>For digital products or services such as cloud credits, AI model credits, or SaaS platform access, cancellations are not applicable once the transfer has been completed due to the nature of digital ownership.</p>

        <SectionTitle>2. Refunds</SectionTitle>
        <p>Refunds may be issued in the following cases:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>If the purchased credits become inaccessible or invalid within the validity period.</li>
          <li>If there is a technical failure during transfer that cannot be resolved.</li>
          <li>If the customer provides verifiable proof that the delivered credits do not match the description or are defective in nature.</li>
        </ul>
        <p>Refund or replacement requests must be submitted to <a href="mailto:connect.with.karam25@gmail.com" className="text-sky-600 hover:underline">connect.with.karam25@gmail.com</a> within 7 days of delivery.</p>
        <p>Once approved, refunds will be processed within 12–15 working days and credited to the original payment method.</p>
        <p>No refunds will be issued for services already utilized, partially consumed credits, or in cases of user negligence post-transfer.</p>

        <SectionTitle>3. Non-Refundable Items</SectionTitle>
        <ul className="list-disc pl-5 space-y-1">
          <li>Orders involving customized offers, discounted credits, or limited-time promotions are non-refundable.</li>
          <li>Refunds are not applicable to perishable or time-sensitive digital services that have been activated or transferred.</li>
        </ul>

        <SectionTitle>4. Disputes</SectionTitle>
        <p>In case of disputes related to refunds, the decision of SpendWise will be final, in accordance with applicable DIFC and DIAC arbitration rules.</p>
      </PolicyModal>
    </>
  );
}
