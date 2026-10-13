import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Linkedin, Twitter, Youtube, Heart } from "lucide-react";
import ButterflyLogo from "./public/ButterflyLogo";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
          {/* Brand & Socials on Left */}
          <div className="md:col-span-6 lg:col-span-5 space-y-4">
            <Link to="/" className="inline-block">
              <ButterflyLogo size="md" />
            </Link>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              A community-driven platform for students and faculty to connect, share, and grow together.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-50 hover:bg-[#F5F1FF] text-slate-600 hover:text-[#7540F5] border border-slate-100 flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <Instagram size={17} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-50 hover:bg-[#F5F1FF] text-slate-600 hover:text-[#7540F5] border border-slate-100 flex items-center justify-center transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin size={17} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-50 hover:bg-[#F5F1FF] text-slate-600 hover:text-[#7540F5] border border-slate-100 flex items-center justify-center transition-all"
                aria-label="X / Twitter"
              >
                <Twitter size={17} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-50 hover:bg-[#F5F1FF] text-slate-600 hover:text-[#7540F5] border border-slate-100 flex items-center justify-center transition-all"
                aria-label="YouTube"
              >
                <Youtube size={17} />
              </a>
            </div>
          </div>

          {/* Navigation Column 1 */}
          <div className="md:col-span-3 lg:col-span-3">
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link to="/" className="text-slate-600 hover:text-[#7540F5] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-slate-600 hover:text-[#7540F5] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-slate-600 hover:text-[#7540F5] transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Support / Guidelines Column 2 */}
          <div className="md:col-span-3 lg:col-span-4">
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <a href="#help" className="hover:text-[#7540F5] transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#guidelines" className="hover:text-[#7540F5] transition-colors">
                  Community Guidelines
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-[#7540F5] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-[#7540F5] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#7540F5] transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} VIBE. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={13} className="text-red-500 fill-current" /> for students and faculty.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
