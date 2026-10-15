import React from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Heart,
  Smartphone,
  ShieldCheck,
  Download,
} from "lucide-react";
import VibeLogo from "./public/VibeLogo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Trigger PWA install prompt if available
  const triggerInstall = () => {
    const installBtn = document.getElementById("install-button");
    if (installBtn) {
      installBtn.click();
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-[#111B5E]">
      <div className="max-w-7xl mx-auto">
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-14 border-b border-slate-100">
          {/* Brand & Socials Column (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block group">
              <VibeLogo size="md" />
            </Link>
            <p className="text-sm text-[#5A6482] max-w-sm leading-relaxed">
              VIBE (Verified Internship & Mentorship) connects students with certified faculty mentors and real industry opportunities in a trusted, transparent ecosystem.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-50 hover:bg-[#F5F1FF] text-slate-600 hover:text-[#7540F5] border border-slate-200/80 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-50 hover:bg-[#F5F1FF] text-slate-600 hover:text-[#7540F5] border border-slate-200/80 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-50 hover:bg-[#F5F1FF] text-slate-600 hover:text-[#7540F5] border border-slate-200/80 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                aria-label="X / Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-50 hover:bg-[#F5F1FF] text-slate-600 hover:text-[#7540F5] border border-slate-200/80 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>

            {/* App Install Badges */}
            <div className="pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#5A6482] mb-3">
                Experience VIBE on Mobile
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {/* App Store Badge Style */}
                <button
                  type="button"
                  onClick={triggerInstall}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 transition-all hover:-translate-y-0.5 text-left shadow-xs"
                >
                  <Smartphone size={18} className="text-slate-300" />
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400 leading-none">
                      Available as
                    </span>
                    <span className="block text-xs font-bold leading-tight">
                      Web App / PWA
                    </span>
                  </div>
                </button>

                {/* Google Play Badge Style */}
                <button
                  type="button"
                  onClick={triggerInstall}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-[#F5F1FF] border border-slate-200 text-[#111B5E] flex items-center gap-2 transition-all hover:-translate-y-0.5 text-left shadow-xs"
                >
                  <Download size={18} className="text-[#7540F5]" />
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-[#5A6482] leading-none">
                      Install Now
                    </span>
                    <span className="block text-xs font-bold leading-tight">
                      All Devices
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Column 1: Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111B5E] mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  About VIBE
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Features & Tools
                </Link>
              </li>
              <li>
                <a href="#careers" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Careers <span className="text-[10px] bg-[#F5F1FF] text-[#7540F5] px-1.5 py-0.5 rounded-full font-bold ml-1">We're hiring</span>
                </a>
              </li>
              <li>
                <a href="#press" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Press & Media
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111B5E] mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#guidelines" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Community Guidelines
                </a>
              </li>
              <li>
                <a href="#student-handbook" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Student Handbook
                </a>
              </li>
              <li>
                <a href="#mentor-toolkit" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Mentor Toolkit
                </a>
              </li>
              <li>
                <a href="#taskmania-guide" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  TaskMania Rules
                </a>
              </li>
              <li>
                <a href="#blog" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Campus Stories & Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111B5E] mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#help" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#verification-faq" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Verification FAQ
                </a>
              </li>
              <li>
                <a href="#trust-safety" className="text-[#5A6482] hover:text-[#7540F5] transition-colors flex items-center gap-1">
                  <ShieldCheck size={14} className="text-[#16A34A]" /> Trust & Safety
                </a>
              </li>
              <li>
                <a href="#terms" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111B5E] mb-4">
              Community
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/signup/student" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Student Chapters
                </Link>
              </li>
              <li>
                <Link to="/signup/faculty" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Faculty Circle
                </Link>
              </li>
              <li>
                <Link to="/signup/industry" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Industry Network
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  College Partnerships
                </Link>
              </li>
              <li>
                <a href="#events" className="text-[#5A6482] hover:text-[#7540F5] transition-colors">
                  Webinars & Hackathons
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5A6482] gap-4">
          <p>© {currentYear} VIBE ("Verified Internship & Mentorship"). All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium">
            <span>Built with care for learners & educators</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#111B5E]">
              <ShieldCheck size={13} className="text-[#16A34A]" /> 100% Verified Community
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
