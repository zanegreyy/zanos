'use client'
import { useAccount } from "wagmi";
import Image from 'next/image';
import TravelAI from "@/components/TravelAI";
import Store from "@/components/Store";

export default function Home(){
  const {isConnected} = useAccount();
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600 shadow-xl backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image src="/Wander&Work.png" alt="Zanos Logo" width={40} height={40} className="mr-2" priority />
            <div className="hidden sm:inline text-xl font-bold text-white">Zanos - DN</div>
          </div>
          
          {/* Wallet Connection in Header */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {/* Web3Modal Button - Custom Element */}
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <w3m-button/>
            </div>
            {isConnected && (
              <div className="flex items-center">
                {/* Web3Modal Network Button - Custom Element */}
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                <w3m-network-button/>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-gray-700/50 shadow-2xl">
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
      Empowering Your Nomadic Lifestyle
      </h1>
      <p className="text-xl max-w-4xl mx-auto mb-8 text-gray-300 leading-relaxed">
      Navigating life as a digital nomad can be complex—especially with constantly shifting rules and regulations across the globe.
      Our <span className="text-blue-400 font-semibold">TravelAI</span> provides expert visa guidance and uses an advanced orchestrator-worker system for accommodation booking.
      <span className="text-blue-400 font-semibold"> Get started below →</span>
      </p>
      </section>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-8 py-12 space-y-12">
        {/* TravelAI Section */}
        <section className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-8 shadow-2xl border border-gray-600 hover:border-blue-500/50 transition-all duration-300 hover:shadow-blue-500/10">
          <h2 className="text-3xl font-bold mb-4 text-white flex items-center gap-2">
            🧠 TravelAI - Your Travel Assistant
          </h2>
          <p className="text-gray-300 mb-4 text-lg">Get expert advice on visas, regulations, and travel planning from our AI travel assistant.</p>
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">💬 AI Travel Advice</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Visa requirements & regulations</li>
              <li>• Tax compliance guidance</li>
              <li>• Travel routes & transportation</li>
              <li>• Restaurant recommendations</li>
            </ul>
          </div>
          <TravelAI/>
        </section>

        {/* Wireless E-sims Section */}
        <section className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-8 shadow-2xl border border-gray-600 hover:border-green-500/50 transition-all duration-300 hover:shadow-green-500/10">
          <h2 className="text-3xl font-bold mb-4 text-white flex items-center gap-2">
            📱 Wireless E-sims
          </h2>
          <p className="text-gray-300 mb-2 text-lg">Buy a sim for worldwide connectivity!</p>
          <p className="text-gray-400 mb-4">Wireless sim troubleshoot support offered by Zanos team</p>
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6">
            <p className="font-bold text-2xl text-green-400">Sim Price - €13</p>
            <p className="text-green-300 text-sm">One-time purchase • Global coverage</p>
          </div>
          
          <h3 className="text-xl font-semibold mb-4 text-white">Pricing Per Region - additional GB usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
              <p className="text-white font-semibold">USA: €2.50 per GB</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
              <p className="text-white font-semibold">Europe: €1.80 per GB</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
              <p className="text-white font-semibold">Asia: €3.20 per GB</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
              <p className="text-white font-semibold">Africa: €4.00 per GB</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
              <p className="text-white font-semibold">Oceania: €3.50 per GB</p>
            </div>
          </div>
        </section>

        {/* Store Section */}
        <Store />
      </div>

      {/* Footer */}
      <footer className="mt-24 bg-gradient-to-r from-gray-800 to-gray-700 border-t border-gray-600">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-4">
                <Image src="/Wander&Work.png" alt="Zanos Logo" width={32} height={32} className="mr-2" />
                <h3 className="text-xl font-bold text-white">Zanos - DN</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering the nomadic lifestyle with AI-powered travel assistance, Web3 integration, and global connectivity solutions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">TravelAI Assistant</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Digital Wallet</a></li>
                <li><a href="#" className="hover:text-white transition-colors">E-sim Services</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Legal & Contact */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Legal & Contact</h3>
              <ul className="space-y-2 text-gray-400 mb-4">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR Compliance</a></li>
              </ul>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  contact@zanos.io
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-600 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left">
              © 2024 Zanos Industries. All rights reserved. Empowering the nomadic lifestyle.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Powered by</span>
              <span className="text-blue-400 font-semibold">Claude AI</span>
              <span className="text-gray-400">•</span>
              <span className="text-purple-400 font-semibold">Web3</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}