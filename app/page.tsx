"use client";

import React from "react";
import {
  ArrowRight,
  Bot,
  Zap,
  Search,
  FileText,
  Cloud,
  DollarSign,
  Globe,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
     
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full  bg-blue-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">JARVIS 0.5</span>
            </div>
            <Link href="/chat">
              <button className="px-4 py-2 bg-blue-100 hover:bg-blue-700 rounded-full text-sm font-semibold transition border-[#ffffff] border-2">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      
      <section className="max-w-[1200px] mx-auto px-4 py-20">
        <div className="text-center max-w-[700px] mx-auto">
         
          <div className="flex justify-center mb-6">
            <Image
              src="/images.png"
              alt="Bot Text"
              width={301}
              height={301}
              className="select-none"
              priority
            />
          </div>

        
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight "  style={{ textShadow: "0 0 12px rgba(167, 139, 250, 0.35)" }}>
            Meet <span style={{ color: "#2E1065" }}>J</span>
            <span style={{ color: "#3B1A7A" }}>A</span>
            <span style={{ color: "#4C1D95" }}>R</span>
            <span style={{ color: "#5B21B6" }}>V</span>
            <span style={{ color: "#7C3AED" }}>I</span>
            <span style={{ color: "#A78BFA" }}>S</span>
            <span className="hidden md:inline" style={{ color: "#A78BFA" }}> 0.5</span>
            
          </h1>

        
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Your intelligent AI assistant. Upload documents, search the web,
            check weather, convert currencies, and more—all in one place.
          </p>

          
          <Link href="/chat">
            <button className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-100 hover:bg-blue-600 rounded-full text-lg font-semibold transition shadow-lg shadow-blue-500/20  border-[#ffffff] border-2">
              <Zap className="w-5 h-5" />
              <span>Start Chatting</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}

      {/* Stats Section */}
      {/* <section className="max-w-[1200px] mx-auto px-4 py-12 border-t border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <StatCard number="6+" label="Integrated Tools" />
          <StatCard number="24/7" label="Availability" />
          <StatCard number="∞" label="Conversations" />
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="max-w-[1200px] mx-auto px-4 py-20 border-t border-gray-800">
        <div className="text-center max-w-[600px] mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of users using JARVIS to get things done faster
          </p>
          <Link href="/chat">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-semibold transition">
              Start Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-12">
        <div className="max-w-[1200px] mx-auto px-4 text-center text-sm text-gray-500">
          <p>Built with Next.js, LangChain, and Groq</p>
          <p className="mt-2">© 2025 JARVIS.Made for Practices.</p>
        </div>
      </footer>
    </div>
  );
}


function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 border border-gray-800 rounded-2xl hover:border-gray-700 hover:bg-white/[0.02] transition cursor-pointer">
      <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center mb-4 text-blue-500">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-blue-500 mb-2">{number}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}
