import React, { useState } from "react";
import "./WhatsAppWidget.css"; // This link must match the filename above

const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Update with your actual WhatsApp info
  const phoneNumber = "1234567890";
  const message = encodeURIComponent(
    "Hey! I'm reaching out from the website regarding my order.",
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="wa-widget-container">
      {/* Pop-up UI */}
      {isOpen && (
        <div className="wa-popup">
          <button className="wa-close" onClick={() => setIsOpen(false)}>
            ×
          </button>
          <div className="wa-popup-content">
            <p>
              <strong>Hey there 👋</strong>
              Welcome! Track your order status or contact us for support.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="wa-chat-btn"
            >
              Start Chat
            </a>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        className="wa-floating-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact support"
      >
        {/* WhatsApp Logo */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
        />
        {/* The "Light Glance" Shimmer Layer */}
        <div className="wa-shimmer"></div>
      </button>
    </div>
  );
};

export default WhatsAppWidget;
