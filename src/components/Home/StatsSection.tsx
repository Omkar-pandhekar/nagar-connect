"use client";

import {
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

export default function StatsSection() {
  const [animatedStats, setAnimatedStats] = useState([
    {
      value: 0,
      label: "Issues Resolved This Month",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+12%",
    },
    {
      value: 0,
      label: "Active Issues Being Addressed",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "-8%",
    },
    {
      value: 0,
      label: "New Reports Today",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+5%",
    },
    {
      value: 0,
      label: "Average Resolution Time",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "-15%",
    },
  ]);

  const targetValues = useMemo(() => [1248, 93, 26, 48], []);

  useEffect(() => {
    const animateNumbers = () => {
      setAnimatedStats((prev) =>
        prev.map((stat, index) => {
          const target = targetValues[index];
          const increment = target / 50;
          const newValue = Math.min(stat.value + increment, target);

          return {
            ...stat,
            value: Math.floor(newValue),
          };
        })
      );
    };

    const interval = setInterval(animateNumbers, 30);
    return () => clearInterval(interval);
  }, [targetValues]);

  return (
    <section className="py-16 sm:py-20" id="pulse">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-[#2A64F5]" />
            <span className="text-sm font-semibold text-[#2A64F5] uppercase tracking-wide">
              Real-time Data
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Live City Pulse
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track the heartbeat of civic engagement in Chhatrapati
            Sambhajinagar. See how our community is actively improving the city.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {animatedStats.map((stat, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} mb-4`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>

              {/* Value and trend */}
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-3xl font-extrabold text-gray-900">
                  {stat.value.toLocaleString()}
                  {idx === 3 && (
                    <span className="text-lg font-medium text-gray-500 ml-1">
                      hrs
                    </span>
                  )}
                </p>
                <span
                  className={`text-sm font-semibold ${
                    stat.trend.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.trend}
                </span>
              </div>

              {/* Label */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {stat.label}
              </p>

              {/* Progress bar */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-1000 ${
                    stat.color.includes("green")
                      ? "bg-green-500"
                      : stat.color.includes("orange")
                      ? "bg-orange-500"
                      : stat.color.includes("blue")
                      ? "bg-blue-500"
                      : "bg-purple-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (stat.value / targetValues[idx]) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Additional insights */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-[#2A64F5]" />
            <h3 className="text-lg font-semibold text-gray-900">
              Community Impact
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2A64F5]">15,000+</p>
              <p className="text-sm text-gray-600">Active Citizens</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">98%</p>
              <p className="text-sm text-gray-600">Satisfaction Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">24/7</p>
              <p className="text-sm text-gray-600">Support Available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
