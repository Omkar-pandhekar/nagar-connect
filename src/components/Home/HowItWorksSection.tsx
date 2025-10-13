"use client";

import {
  Camera,
  Send,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("how");
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      icon: Camera,
      title: "Spot & Snap",
      desc: "See an issue like a pothole or broken streetlight? Take a quick photo with your smartphone.",
      details:
        "Use your phone's camera to capture clear images of civic issues. Our AI helps identify the problem type automatically.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      features: [
        "AI-powered issue detection",
        "GPS location tagging",
        "Photo quality optimization",
      ],
    },
    {
      icon: Send,
      title: "Report & Track",
      desc: "Submit the report with location. Track status on the live map in real-time.",
      details:
        "Your report is instantly submitted to the relevant department with precise location data and priority classification.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      features: [
        "Real-time status updates",
        "Department routing",
        "Priority classification",
      ],
    },
    {
      icon: ShieldCheck,
      title: "Resolved & Notified",
      desc: "Authorities resolve it. You get notified when the job is done with before/after photos.",
      details:
        "Receive instant notifications when your reported issue is resolved, complete with verification photos and resolution details.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      features: [
        "Resolution verification",
        "Before/after photos",
        "Satisfaction feedback",
      ],
    },
  ];

  const benefits = [
    { icon: Clock, text: "Average 48-hour resolution time" },
    { icon: Users, text: "15,000+ active community members" },
    { icon: Zap, text: "98% issue resolution rate" },
    { icon: MapPin, text: "City-wide coverage" },
  ];

  return (
    <section className="py-16 sm:py-20" id="how">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Smartphone className="h-6 w-6 text-[#2A64F5]" />
            <span className="text-sm font-semibold text-[#2A64F5] uppercase tracking-wide">
              Simple Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            See It. Snap It. Solved.
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transform your city with just three simple steps. Our streamlined
            process makes civic engagement effortless and effective.
          </p>
        </div>

        {/* Steps with enhanced design */}
        <div className="relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-purple-200" />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`group relative ${
                  isVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${idx * 200}ms` }}
                onMouseEnter={() => setActiveStep(idx)}
              >
                {/* Step number */}
                <div className="absolute -top-4 left-6 z-10">
                  <div
                    className={`w-8 h-8 rounded-full ${step.bgColor} border-4 border-white flex items-center justify-center`}
                  >
                    <span className="text-sm font-bold text-gray-700">
                      {idx + 1}
                    </span>
                  </div>
                </div>

                {/* Main card */}
                <div
                  className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                    activeStep === idx
                      ? "border-[#2A64F5] shadow-xl scale-105"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                  } bg-white p-8`}
                >
                  {/* Background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />

                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon className={`h-8 w-8 ${step.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {step.desc}
                  </p>

                  {/* Detailed description */}
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    {step.details}
                  </p>

                  {/* Features list */}
                  <div className="space-y-2">
                    {step.features.map((feature, featureIdx) => (
                      <div key={featureIdx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Arrow for desktop */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits section */}
        <div className="mt-20 bg-gradient-to-r from-[#2A64F5] to-blue-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">
              Why Choose Nagar-Connect?
            </h3>
            <p className="text-blue-100">
              Experience the power of community-driven civic engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 mb-4 group-hover:bg-white/30 transition-colors duration-300">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-blue-100 group-hover:text-white transition-colors duration-300">
                  {benefit.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Make a Difference?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of citizens who are actively improving Chhatrapati
              Sambhajinagar. Download the app and start reporting issues today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center justify-center px-6 py-3 bg-[#2A64F5] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300">
                <Smartphone className="h-5 w-5 mr-2" />
                Download App
              </button>
              <button className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#2A64F5] text-[#2A64F5] font-semibold rounded-lg hover:bg-[#2A64F5] hover:text-white transition-colors duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
