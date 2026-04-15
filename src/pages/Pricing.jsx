import React from 'react';
import './Pricing.css';
import { Check, X, Info } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "0",
      desc: "Perfect for hobbyists and individual creators.",
      buttonText: "Start for Free",
      isPopular: false,
    },
    {
      name: "Starter",
      price: "2700",
      desc: "Scale your reach with essential automation tools.",
      buttonText: "Get Starter",
      isPopular: true,
    },
    {
      name: "Creator",
      price: "3700",
      desc: "For pro creators demanding maximum performance.",
      buttonText: "Go Creator",
      isPopular: false,
    },
  ];

  const categories = [
    {
      name: "Core Video & Creation",
      features: [
        { name: "Upload Video Minutes", values: ["90 / Month", "900 / Month", "1800 / Month"] },
        { name: "Upload video", values: [true, true, true] },
        { name: "Live stream input (Twitch)", values: ["30 mins", "2 Hours/Day (30 Hours)", "4 Hours/Day (50 Hours)"] },
        { name: "Watermark removal", values: [false, true, true] },
        { name: "Upload length (per video)", values: ["20 mins", "60 mins", "60 mins"] },
        { name: "Upload size", values: ["1 GB", "2 GB", "3 GB"] },
        { name: "Export quality", values: ["480p", "720p", "1080p"] },
        { name: "Video Retention", values: ["3 Days", "45 Days", "90 Days"] },
      ]
    },
    {
      name: "Editing, Captions & Transcripts",
      features: [
        { name: "Custom captions", values: [false, true, true] },
        { name: "Custom outros", values: [false, true, true] },
        { name: "Editor page (titles & styles)", values: [true, true, true] },
      ]
    },
    {
      name: "Publishing, Sharing & Distribution",
      features: [
        { name: "Export clips", values: ["5 Videos", "30 Videos", "90 Videos"] },
        { name: "Direct social publishing", values: [false, "Limit 5/Day", "Limit 10/Day"] },
        { name: "Auto posting", values: [false, false, false] },
        { name: "Manual posting", values: [false, true, true] },
        { name: "Social media accounts", values: [false, "1 Account", "1 Account"] },
      ]
    },
    {
      name: "Support",
      features: [
        { name: "Email support", values: [false, "24 Hours", "48 Hours"] },
      ]
    }
  ];

  const renderValue = (val) => {
    if (val === true) return <Check className="check-icon" />;
    if (val === false) return <X className="x-icon" />;
    return <span className="value-text">{val}</span>;
  };

  return (
    <div className="pricing-page">
      <div className="pricing-hero">
        <h1 className="text-gradient">Choose Your Speed</h1>
        <p>From casual clips to viral machines. Scale as you grow.</p>
      </div>

      <div className="plans-grid container">
        {plans.map((plan, idx) => (
          <div key={idx} className={`plan-card ${plan.isPopular ? 'popular' : ''}`}>
            {plan.isPopular && <div className="popular-badge">Most Popular</div>}
            <h3>{plan.name}</h3>
            <div className="price">
              <span className="currency">₹</span>
              <span className="amount">{plan.price}</span>
              <span className="period">/mo</span>
            </div>
            <p className="plan-desc">{plan.desc}</p>
            <button className={plan.isPopular ? 'btn-primary' : 'btn-secondary'}>
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="comparison-section container">
        <div className="comparison-header">
          <h2>Detailed Comparison</h2>
          <p>Everything you need to know about our plans.</p>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature Category</th>
                {plans.map(p => <th key={p.name}>{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, catIdx) => (
                <React.Fragment key={catIdx}>
                  <tr className="category-row">
                    <td colSpan="4">{cat.name}</td>
                  </tr>
                  {cat.features.map((feature, fIdx) => (
                    <tr key={fIdx}>
                      <td className="feature-name">
                        {feature.name}
                        <Info size={14} className="info-icon" />
                      </td>
                      {feature.values.map((val, vIdx) => (
                        <td key={vIdx}>{renderValue(val)}</td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
