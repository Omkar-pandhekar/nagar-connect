"use client";

import React, { useState } from "react";
import {
  Camera,
  Send,
  ShieldCheck,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Globe,
  Bell,
  TrendingUp,
  Heart,
} from "lucide-react";

const HowItWorksPage = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      title: "Spot & Snap",
      subtitle: "Report Issues Instantly",
      icon: Camera,
      description:
        "See a civic issue? Take a photo and report it in seconds. Our smart camera integration automatically captures location and categorizes the problem.",
      features: [
        "GPS location tagging",
        "Smart issue categorization",
        "Photo quality optimization",
        "Offline reporting capability",
      ],
      color: "from-blue-500 to-blue-600",
    },
    {
      number: "02",
      title: "Report & Track",
      subtitle: "Submit & Monitor Progress",
      icon: Send,
      description:
        "Submit your report with detailed information. Track the issue status in real-time and receive updates on resolution progress.",
      features: [
        "Real-time status updates",
        "Progress notifications",
        "Issue priority assignment",
        "Department routing",
      ],
      color: "from-green-500 to-green-600",
    },
    {
      number: "03",
      title: "Resolved & Notified",
      subtitle: "Get Confirmation & Feedback",
      icon: ShieldCheck,
      description:
        "Receive confirmation when your issue is resolved. Rate the resolution and help improve our services for the community.",
      features: [
        "Resolution confirmation",
        "Before/after photos",
        "Satisfaction rating",
        "Community impact tracking",
      ],
      color: "from-purple-500 to-purple-600",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Quick Response",
      description: "Average 48-hour response time for urgent issues",
      stat: "48 Hours",
    },
    {
      icon: Users,
      title: "Community Impact",
      description: "Join 15,000+ active citizens making a difference",
      stat: "15,000+",
    },
    {
      icon: TrendingUp,
      title: "High Success Rate",
      description: "98% of reported issues get resolved",
      stat: "98%",
    },
    {
      icon: Heart,
      title: "Community Satisfaction",
      description: "Rated 4.8/5 by our community members",
      stat: "4.8/5",
    },
  ];

  const platforms = [
    {
      icon: Smartphone,
      title: "Mobile App",
      description: "Download our iOS and Android app for on-the-go reporting",
      features: [
        "Push notifications",
        "Offline mode",
        "Camera integration",
        "GPS tracking",
      ],
    },
    {
      icon: Globe,
      title: "Web Platform",
      description: "Access from any browser with full functionality",
      features: [
        "Desktop interface",
        "Map integration",
        "Bulk reporting",
        "Analytics dashboard",
      ],
    },
    {
      icon: Bell,
      title: "SMS Service",
      description: "Report issues via SMS for accessibility",
      features: [
        "Text-based reporting",
        "Simple commands",
        "No internet required",
        "Voice-to-text support",
      ],
    },
  ];

  const faqs = [
    {
      question: "How long does it take to resolve an issue?",
      answer:
        "Most issues are resolved within 48-72 hours. Urgent issues like water leaks or road hazards are prioritized and typically resolved within 24 hours.",
    },
    {
      question: "Can I report issues anonymously?",
      answer:
        "Yes, you can choose to report issues anonymously. However, providing contact information helps us send you updates on the resolution progress.",
    },
    {
      question: "What types of issues can I report?",
      answer:
        "You can report various civic issues including potholes, streetlight problems, garbage collection issues, water leaks, drainage problems, and traffic signal malfunctions.",
    },
    {
      question: "How do I track the status of my report?",
      answer:
        "You'll receive email/SMS notifications at each stage. You can also log into your account to view the real-time status of all your reports.",
    },
  ];

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-[#2A64F5] to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 pt-32">
              How It Works
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Transform your city in three simple steps. From spotting an issue
              to seeing it resolved - we make civic engagement effortless.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#2A64F5] font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                <Camera className="h-5 w-5" />
                Start Reporting
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#2A64F5] transition-colors">
                <Users className="h-5 w-5" />
                Join Community
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Three Simple Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From issue discovery to resolution - see how easy it is to make a
              difference in your city.
            </p>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex space-x-4">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    activeStep === index
                      ? "bg-[#2A64F5] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Step {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Active Step Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${steps[activeStep].color} rounded-full flex items-center justify-center`}
                >
                  {React.createElement(steps[activeStep].icon, {
                    className: "h-8 w-8 text-white",
                  })}
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Step {steps[activeStep].number}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {steps[activeStep].subtitle}
                  </p>
                </div>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                {steps[activeStep].description}
              </p>
              <div className="space-y-3">
                {steps[activeStep].features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div
                className={`bg-gradient-to-br ${steps[activeStep].color} rounded-2xl p-8 text-white`}
              >
                <div className="text-center">
                  {React.createElement(steps[activeStep].icon, {
                    className: "h-16 w-16 mx-auto mb-4",
                  })}
                  <h4 className="text-2xl font-bold mb-2">
                    {steps[activeStep].title}
                  </h4>
                  <p className="text-blue-100">{steps[activeStep].subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why It Works So Well
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform is designed for efficiency, transparency, and
              community impact.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-[#2A64F5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {benefit.stat}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Multiple Ways to Report
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the platform that works best for you. All methods lead to
              the same efficient resolution process.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-[#2A64F5] rounded-lg flex items-center justify-center mb-4">
                  <platform.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {platform.title}
                </h3>
                <p className="text-gray-600 mb-4">{platform.description}</p>
                <div className="space-y-2">
                  {platform.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about using Nagar-Connect
            </p>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#2A64F5] to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens who are already making a difference in
            Chhatrapati Sambhajinagar. Your first report takes less than 2
            minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#2A64F5] font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              <Camera className="h-5 w-5" />
              Report Your First Issue
            </button>
            <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#2A64F5] transition-colors">
              <ArrowRight className="h-5 w-5" />
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
