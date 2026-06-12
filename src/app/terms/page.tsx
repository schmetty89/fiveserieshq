import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'FiveSeriesHQ terms of use and community rules.',
}

const EFFECTIVE_DATE = 'June 12, 2025'

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-14">

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Terms of Use</h1>
          <p className="text-sm text-gray-400">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of terms</h2>
            <p>
              By accessing or using FiveSeriesHQ (&quot;the Site&quot;, &quot;we&quot;, &quot;us&quot;), located at fiveserieshq.com, you agree to be bound by these Terms of Use. If you do not agree to these terms, you may not use the Site. These terms apply to all visitors, members, and contributors.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Description of service</h2>
            <p>
              FiveSeriesHQ is an independent, community-driven platform for BMW 5 Series enthusiasts. We provide forums, technical documentation, a video library, a vendor directory, a build showcase, and events calendar. FiveSeriesHQ is not affiliated with, sponsored by, or endorsed by BMW AG or any of its subsidiaries.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Eligibility and account registration</h2>
            <p>
              You must be at least 13 years of age to create an account. By creating an account, you represent that you are at least 13 years old and that the information you provide is accurate and complete. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.
            </p>
            <p className="mt-3">
              You may not create an account using a false identity or impersonate another person. You may not transfer your account to another person without our express written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Community rules and conduct</h2>
            <p>FiveSeriesHQ is a community built on mutual respect and shared enthusiasm. By participating, you agree not to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Post content that is abusive, threatening, harassing, defamatory, or discriminatory on the basis of race, gender, religion, nationality, sexual orientation, disability, or any other characteristic</li>
              <li>Post spam, advertisements, or solicitations without prior approval from an administrator</li>
              <li>Post content that infringes on the intellectual property rights of others</li>
              <li>Share personal or private information of other members without their consent</li>
              <li>Impersonate other members, moderators, administrators, or any other person</li>
              <li>Post illegal content or content that promotes illegal activity</li>
              <li>Attempt to disrupt, hack, or otherwise interfere with the Site or its infrastructure</li>
              <li>Use the Site to distribute malware, viruses, or any other harmful software</li>
              <li>Create multiple accounts to evade a ban or suspension</li>
              <li>Engage in any commercial activity on the Site without prior authorization</li>
            </ul>
            <p className="mt-3">
              We reserve the right to remove any content and suspend or terminate any account that violates these rules, at our sole discretion, without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. User-submitted content</h2>
            <p>
              By submitting content to FiveSeriesHQ — including forum posts, replies, technical guides, videos, build documentation, vendor reviews, or any other material — you grant FiveSeriesHQ a non-exclusive, royalty-free, worldwide license to display, reproduce, and distribute that content on the Site and in promotional materials.
            </p>
            <p className="mt-3">
              You represent and warrant that you own or have the necessary rights to submit the content, and that your content does not violate any third-party rights. You retain ownership of your content. We do not claim ownership over what you post.
            </p>
            <p className="mt-3">
              Content submitted to the technical library, video library, or vendor directory is subject to review and approval before publication. We reserve the right to decline or remove any submission at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Vendor directory</h2>
            <p>
              Vendors listed in the FiveSeriesHQ directory have been reviewed by our administrators, but we do not endorse, guarantee, or take responsibility for the products, services, or conduct of any listed vendor. Community reviews reflect the opinions of individual members and not of FiveSeriesHQ.
            </p>
            <p className="mt-3">
              Any transactions between members and vendors are solely between those parties. FiveSeriesHQ is not a party to any such transaction and accepts no liability for disputes arising from them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Technical information disclaimer</h2>
            <p>
              The technical content on FiveSeriesHQ — including maintenance guides, service procedures, performance documentation, and wiring diagrams — is provided for informational purposes only. While we make reasonable efforts to ensure accuracy, we do not guarantee that any technical information is complete, current, or error-free.
            </p>
            <p className="mt-3">
              Working on a vehicle involves risk of personal injury and property damage. Always follow manufacturer specifications and consult a qualified mechanic before performing any repair or modification. FiveSeriesHQ accepts no liability for injury, damage, or loss resulting from reliance on any content published on the Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Intellectual property</h2>
            <p>
              The FiveSeriesHQ name, logo, design, and original content created by us are the intellectual property of FiveSeriesHQ and may not be used without our express written permission.
            </p>
            <p className="mt-3">
              BMW, M5, and related model names and designations are trademarks of BMW AG. FiveSeriesHQ is an independent enthusiast community and is not affiliated with BMW AG. Use of these names on this Site is for descriptive and nominative reference purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Privacy</h2>
            <p>
              Your use of FiveSeriesHQ is subject to our Privacy Policy, which is incorporated into these Terms of Use by reference. By using the Site, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>
            <p className="mt-3">
              We collect only the information necessary to operate the Site — your email address, username, and any content you voluntarily submit. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Moderation and enforcement</h2>
            <p>
              FiveSeriesHQ administrators and moderators have the authority to remove content, issue warnings, restrict account privileges, suspend accounts, or permanently ban accounts that violate these terms. Moderation decisions are made at our discretion. We are not obligated to provide reasons for moderation actions, though we will endeavor to do so where appropriate.
            </p>
            <p className="mt-3">
              If you believe a moderation decision was made in error, you may contact us to appeal. We will review appeals on a case-by-case basis. Our decision on appeal is final.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Disclaimer of warranties</h2>
            <p>
              FiveSeriesHQ is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. We do not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components. We make no warranty as to the accuracy, completeness, or reliability of any content on the Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, FiveSeriesHQ and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Site, even if we have been advised of the possibility of such damages. Our total liability for any claim arising from your use of the Site shall not exceed the amount you paid to use the Site in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless FiveSeriesHQ, its administrators, moderators, and contributors from any claim, liability, damage, or expense — including reasonable legal fees — arising from your use of the Site, your violation of these Terms, or your violation of any rights of another person.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">14. Changes to these terms</h2>
            <p>
              We reserve the right to update or modify these Terms of Use at any time. Changes will be posted on this page with an updated effective date. Your continued use of the Site after changes are posted constitutes your acceptance of the revised terms. We encourage you to review these terms periodically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">15. Governing law</h2>
            <p>
              These Terms of Use shall be governed by and construed in accordance with the laws of the United States and the State of Texas, without regard to conflict of law principles. Any disputes arising under these terms shall be resolved in the courts located in Texas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">16. Contact</h2>
            <p>
              If you have questions about these Terms of Use or need to report a violation, please contact us through the forums or reach out to an administrator directly on the Site.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}
