"use client";

import React from "react";
import {
  Users,
  Target,
  Lightbulb,
  Shield,
  Heart,
  Award,
  CheckCircle,
  ArrowRight,
  MapPin,
  Clock,
  TrendingUp,
  Globe,
} from "lucide-react";

const AboutPage = () => {
  const values = [
    {
      icon: Users,
      title: "Community First",
      description:
        "We believe in empowering citizens to actively participate in city governance and improvement.",
    },
    {
      icon: Target,
      title: "Transparency",
      description:
        "Every issue reported is tracked, visible, and accountable to ensure public trust.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "Leveraging technology to make civic engagement simple, efficient, and effective.",
    },
    {
      icon: Shield,
      title: "Reliability",
      description:
        "A robust platform that citizens and authorities can depend on for civic issue resolution.",
    },
  ];

  const stats = [
    { label: "Active Citizens", value: "15,000+", icon: Users },
    { label: "Issues Resolved", value: "12,000+", icon: CheckCircle },
    { label: "Response Time", value: "48 Hours", icon: Clock },
    { label: "Satisfaction Rate", value: "98%", icon: Award },
  ];

  const features = [
    {
      title: "Real-time Issue Tracking",
      description:
        "Monitor the status of your reported issues with live updates and notifications.",
      icon: TrendingUp,
    },
    {
      title: "Smart Location Services",
      description:
        "Automatic GPS tagging and location-based issue categorization for faster resolution.",
      icon: MapPin,
    },
    {
      title: "Multi-channel Reporting",
      description:
        "Report issues through web, mobile app, or SMS - choose what works for you.",
      icon: Globe,
    },
    {
      title: "Community Engagement",
      description:
        "Connect with neighbors, share updates, and build a stronger community together.",
      icon: Heart,
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
              About Nagar-Connect
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Bridging the gap between citizens and city administration through
              technology-driven civic engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#2A64F5] font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                <MapPin className="h-5 w-5" />
                Explore Our Impact
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#2A64F5] transition-colors">
                <Users className="h-5 w-5" />
                Join Our Community
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                To create a seamless connection between citizens and city
                administration, making civic issue reporting and resolution
                transparent, efficient, and community-driven.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We envision a future where every citizen has a voice in city
                governance, where issues are resolved quickly and transparently,
                and where technology serves as a bridge between people and their
                government.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#2A64F5] rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Our Vision
                  </h3>
                  <p className="text-gray-600">
                    Smart cities with engaged citizens
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#2A64F5] to-blue-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Key Achievements</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>98% citizen satisfaction rate</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>Average 48-hour response time</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>15,000+ active community members</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>12,000+ issues successfully resolved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do and every decision we
              make.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-[#2A64F5] rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#2A64F5] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Impact by Numbers
            </h2>
            <p className="text-xl text-blue-100">
              Real results that make a difference in our community
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Nagar-Connect?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the features that make civic engagement simple,
              effective, and rewarding.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-[#2A64F5] rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#2A64F5] to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens who are actively improving Chhatrapati
            Sambhajinagar. Your voice matters, and together we can build a
            better city.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#2A64F5] font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              <Users className="h-5 w-5" />
              Join Our Community
            </button>
            <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#2A64F5] transition-colors">
              <ArrowRight className="h-5 w-5" />
              Get Started Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
