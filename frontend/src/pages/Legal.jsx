import React from 'react';

const SimplePage = ({ title, content }) => {
  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '800px', minHeight: '60vh' }}>
      <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        {title}
      </h1>
      <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export const Terms = () => {
  return <SimplePage title="Terms & Conditions" content={`
    <h3>1. Introduction</h3>
    <p>Welcome to Chronos. By accessing our website and purchasing our products, you agree to be bound by these Terms and Conditions.</p>
    <br/>
    <h3>2. Products & Pricing</h3>
    <p>All prices are subject to change without notice. We reserve the right to modify or discontinue any product at any time.</p>
    <br/>
    <h3>3. Payment</h3>
    <p>Currently, we only accept Cash on Delivery (COD) as a payment method for all orders.</p>
  `} />;
};

export const Privacy = () => {
  return <SimplePage title="Privacy Policy" content={`
    <h3>1. Information We Collect</h3>
    <p>We collect personal information that you provide to us, such as name, address, contact information, and payment details when you place an order.</p>
    <br/>
    <h3>2. How We Use Your Information</h3>
    <p>We use your information to process orders, communicate with you, and improve our services.</p>
    <br/>
    <h3>3. Data Protection</h3>
    <p>We implement appropriate security measures to protect your personal information against unauthorized access.</p>
  `} />;
};

export const Disclaimer = () => {
  return <SimplePage title="Disclaimer" content={`
    <p>The information provided by Chronos on this website is for general informational purposes only. All information on the Site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.</p>
    <br/>
    <p>This is a simulated e-commerce application created for demonstration purposes.</p>
  `} />;
};
