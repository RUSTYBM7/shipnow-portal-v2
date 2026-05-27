/**
 * AirPak Express - Landing Page
 * Matches exact design from reference URL
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, Globe, Zap, Truck, Shield, MapPin, Phone, Mail, Clock,
  MessageCircle, Send, X, ChevronDown, Star, Building2, Menu, X as CloseIcon
} from 'lucide-react';

// Floating AI Chat Widget
const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'ai' | 'user', text: string}>>([
    { role: 'ai', text: "Hi! I'm your AirPak AI assistant. How can I help you today? I can answer questions about shipping rates, tracking, services, and more!" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const userQuery = input;
    setInput('');

    setTimeout(() => {
      let response = "I'm here to help! For detailed information, please visit our services page or contact our support team.";

      if (userQuery.toLowerCase().includes('track')) {
        response = 'You can track your package by entering your tracking number in the search box above. Tracking numbers look like: APK20240525001234. Your package will show real-time location updates, estimated delivery time, and complete shipment history.';
      } else if (userQuery.toLowerCase().includes('price') || userQuery.toLowerCase().includes('cost') || userQuery.toLowerCase().includes('rate')) {
        response = 'Our shipping rates start from $15 for economy delivery. Express options are available from $45. Rates vary based on destination, weight, and service level.';
      } else if (userQuery.toLowerCase().includes('delivery') || userQuery.toLowerCase().includes('time')) {
        response = 'We offer multiple delivery options: Economy (7-14 days), Standard (5-10 days), and Express (2-4 days). Express delivery includes same-day pickup and priority customs clearance.';
      } else if (userQuery.toLowerCase().includes('service')) {
        response = 'We provide: International Shipping to 150+ countries, Express Delivery with next-day options, Warehousing with climate control, and Insurance coverage. All services include real-time tracking!';
      } else if (userQuery.toLowerCase().includes('contact') || userQuery.toLowerCase().includes('support')) {
        response = 'You can reach us 24/7 via email at support@airpak-express.com, phone at +65 6340 1234, or through this chat.';
      } else if (userQuery.toLowerCase().includes('insurance')) {
        response = 'We offer comprehensive insurance coverage for all shipments. Claims are processed within 48 hours. Coverage includes loss, damage, and delay protection.';
      } else if (userQuery.toLowerCase().includes('sign') || userQuery.toLowerCase().includes('account') || userQuery.toLowerCase().includes('register')) {
        response = "Creating an account is free! Click 'Sign Up' in the top right corner to register. You'll get access to discounted rates, shipment history, and exclusive rewards.";
      }

      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-[#222] to-[#383838] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform group"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          AI Assistant
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white border border-[#e5e5e5] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#222] to-[#383838] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AirPak AI Assistant</h3>
                <p className="text-xs text-white/80">Powered by MiniMax - 24/7 Support</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-[#f8f8f8]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl ${
                  msg.role === 'ai'
                    ? 'bg-white text-[#222] border border-[#e5e5e5]'
                    : 'bg-[#222] text-white'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto bg-white">
            {['Track Package', 'Shipping Rates', 'Get a Quote', 'Contact Us'].map((action) => (
              <button
                key={action}
                onClick={() => setInput(action)}
                className="text-xs bg-[#f8f8f8] hover:bg-[#e5e5e5] text-[#383838] px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#e5e5e5] bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about shipping, tracking, rates..."
                className="flex-1 bg-[#f8f8f8] border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-[#222] text-sm placeholder-[#999] focus:outline-none focus:border-[#222]"
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 bg-[#222] rounded-xl flex items-center justify-center hover:bg-[#383838] transition-colors"
              >
                <Send size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/portal/tracking?search=${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! Our team will get back to you within 24 hours.');
    setContactForm({ name: '', email: '', message: '' });
  };

  const services = [
    {
      icon: Globe,
      title: 'International Shipping',
      desc: 'Ship to over 150 countries with competitive rates and fast delivery times.',
      features: ['Express 2-5 days', 'Economy 7-14 days', 'Door-to-door service']
    },
    {
      icon: Zap,
      title: 'Express Delivery',
      desc: 'Urgent shipments? Our express service ensures next-day delivery to major cities.',
      features: ['Same day pickup', 'Priority customs', 'Real-time updates']
    },
    {
      icon: Truck,
      title: 'Warehousing',
      desc: 'Store your packages in our secure facilities before shipping worldwide.',
      features: ['Climate controlled', '48hr free storage', 'Inventory management']
    },
    {
      icon: Shield,
      title: 'Insurance & Security',
      desc: 'Protect your valuable shipments with our comprehensive insurance options.',
      features: ['Full coverage', 'Claims in 48hrs', 'Package protection']
    }
  ];

  const benefits = [
    { icon: Phone, title: '24/7 Support', desc: 'Round-the-clock assistance' },
    { icon: Globe, title: '150+ Countries', desc: 'Global coverage network' },
    { icon: Shield, title: 'Secure & Insured', desc: 'Full shipment protection' },
    { icon: Zap, title: 'Quality Assured', desc: 'ISO certified operations' },
  ];

  const companyStats = [
    { value: '15+', label: 'Years Experience' },
    { value: '500+', label: 'Team Members' },
    { value: '50+', label: 'Global Hubs' },
    { value: '98%', label: 'Customer Satisfaction' },
  ];

  const testimonials = [
    {
      quote: 'AirPak Express has transformed our international shipping. Fast, reliable, and the tracking system is amazing!',
      name: 'Sarah Chen',
      role: 'E-commerce Owner',
      initials: 'SC'
    },
    {
      quote: 'Best shipping service I have ever used. Their express delivery saved my business deal multiple times.',
      name: 'Michael Wong',
      role: 'Business Executive',
      initials: 'MW'
    },
    {
      quote: 'Love how easy it is to track my packages. Customer support is always helpful and responsive.',
      name: 'Emma Thompson',
      role: 'Frequent Shipper',
      initials: 'ET'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#222] rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-[#222]">AirPak Express</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-[#383838] hover:text-[#222] font-medium transition-colors">Home</a>
            <a href="#services" className="text-[#383838] hover:text-[#222] font-medium transition-colors">Services</a>
            <a href="#tracking" className="text-[#383838] hover:text-[#222] font-medium transition-colors">Track</a>
            <a href="#about" className="text-[#383838] hover:text-[#222] font-medium transition-colors">About</a>
            <a href="#contact" className="text-[#383838] hover:text-[#222] font-medium transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-[#383838] hover:text-[#222] font-medium transition-colors">Sign In</Link>
            <Link
              to="/signup"
              className="bg-[#222] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#383838] transition-colors"
            >
              Sign Up
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#383838]"
            >
              {mobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#e5e5e5] px-4 py-4">
            <nav className="flex flex-col gap-3">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-[#383838] hover:text-[#222] font-medium py-2">Home</a>
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-[#383838] hover:text-[#222] font-medium py-2">Services</a>
              <a href="#tracking" onClick={() => setMobileMenuOpen(false)} className="text-[#383838] hover:text-[#222] font-medium py-2">Track</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-[#383838] hover:text-[#222] font-medium py-2">About</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-[#383838] hover:text-[#222] font-medium py-2">Contact</a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-[#383838] hover:text-[#222] font-medium py-2">Sign In</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative pt-24 pb-20 px-4 bg-gradient-to-b from-white to-[#f8f8f8]">
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8FD1FF]/20 border border-[#8FD1FF]/30 rounded-full mb-6">
              <Zap className="w-4 h-4 text-[#222]" />
              <span className="text-sm text-[#222] font-medium">Express Delivery Worldwide</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#222] mb-6 leading-tight">
              Fast & Reliable<br />
              <span className="text-[#383838]">International Shipping</span>
            </h1>

            <p className="text-lg md:text-xl text-[#666] mb-10 max-w-2xl mx-auto">
              Send packages anywhere in the world with AirPak Express. Fast customs clearance, real-time tracking, and secure delivery guaranteed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#tracking"
                className="w-full sm:w-auto bg-[#222] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#383838] transition-all shadow-lg shadow-[#222]/10"
              >
                Track Your Shipment
              </a>
              <a
                href="#services"
                className="w-full sm:w-auto bg-white text-[#222] px-8 py-4 rounded-xl font-bold hover:bg-[#f0f0f0] transition-all shadow-lg border border-[#e5e5e5]"
              >
                Our Services
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 text-center">
            {[
              { value: '150+', label: 'Countries Served' },
              { value: '1M+', label: 'Packages Delivered' },
              { value: '99.8%', label: 'On-Time Delivery' },
            ].map((stat, i) => (
              <div key={i} className="relative">
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#222]">{stat.value}</p>
                <p className="text-sm md:text-base text-[#999] mt-2">{stat.label}</p>
                {i < 2 && <div className="hidden sm:block absolute top-1/2 -right-4 w-8 h-px bg-[#e5e5e5]" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracking Section */}
      <section id="tracking" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222] mb-4">Track Your Package</h2>
            <p className="text-[#666] max-w-xl mx-auto">
              Enter your tracking number to get instant updates on your shipment location and estimated delivery time.
            </p>
          </div>

          <form onSubmit={handleTrack} className="max-w-2xl mx-auto flex gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full pl-12 pr-4 py-4 bg-[#f8f8f8] border border-[#e5e5e5] rounded-xl text-[#222] placeholder-[#999] focus:outline-none focus:border-[#222] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-[#222] text-white rounded-xl font-semibold hover:bg-[#383838] transition-colors flex items-center gap-2"
            >
              Track
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            <span className="text-sm text-[#999]">Popular Tracking Numbers</span>
            {['APK20240525001234', 'APK20240524001233'].map((num) => (
              <button
                key={num}
                onClick={() => setTrackingNumber(num)}
                className="text-sm text-[#222] hover:text-[#383838] transition-colors font-medium underline"
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-[#f8f8f8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222] mb-4">Our Services</h2>
            <p className="text-[#666] max-w-2xl mx-auto">
              From express delivery to international freight, we offer a full range of logistics services tailored to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <div key={i} className="group bg-white border border-[#e5e5e5] rounded-2xl p-6 hover:shadow-lg hover:border-[#8FD1FF]/30 transition-all duration-300">
                <div className="w-14 h-14 bg-[#8FD1FF]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <service.icon className="w-7 h-7 text-[#222]" />
                </div>
                <h3 className="text-xl font-bold text-[#222] mb-3">{service.title}</h3>
                <p className="text-[#666] text-sm mb-4">{service.desc}</p>
                <ul className="space-y-2">
                  {service.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-[#666]">
                      <span className="text-[#8FD1FF]">•</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Track Button */}
          <div className="mt-12 text-center">
            <a
              href="#tracking"
              className="inline-flex items-center gap-2 bg-white hover:bg-[#f0f0f0] border border-[#e5e5e5] text-[#222] px-6 py-3 rounded-xl font-medium transition-all"
            >
              <MapPin className="w-5 h-5" />
              Track Shipment
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#222] mb-6">
                Your Trusted Partner in Global Logistics
              </h2>
              <p className="text-[#666] mb-4 leading-relaxed">
                Founded with a mission to make international shipping accessible and reliable, AirPak Express has grown to become a leading name in the logistics industry. We combine cutting-edge technology with personalized service to deliver exceptional shipping experiences.
              </p>
              <p className="text-[#666] mb-8 leading-relaxed">
                Our network spans across 150+ countries, supported by strategically located hubs and partnerships with major airlines and freight carriers. This enables us to offer flexible shipping solutions that meet the unique needs of individuals and businesses alike.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#8FD1FF]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-[#222]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#222]">{benefit.title}</h4>
                      <p className="text-xs text-[#999]">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {companyStats.map((stat, i) => (
                <div key={i} className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-2xl p-6 text-center hover:border-[#8FD1FF]/30 transition-colors">
                  <p className="text-3xl md:text-4xl font-bold text-[#222] mb-1">{stat.value}</p>
                  <p className="text-sm text-[#999]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-[#f8f8f8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222] mb-4">What Our Customers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white border border-[#e5e5e5] rounded-2xl p-6 hover:shadow-lg transition-colors">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-[#222] fill-[#222]" />
                  ))}
                </div>
                <p className="text-[#666] mb-6 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#222] rounded-full flex items-center justify-center text-white font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#222]">{t.name}</h4>
                    <p className="text-sm text-[#999]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222] mb-4">Get in Touch</h2>
            <p className="text-[#666]">Have questions or need assistance? Our team is ready to help you with any inquiries.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#8FD1FF]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-[#222]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#222] mb-1">Headquarters</h4>
                  <p className="text-[#666] text-sm">Singapore Changi Airport<br />Cargo Terminal, Singapore 918146</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#8FD1FF]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#222]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#222] mb-1">Phone</h4>
                  <p className="text-[#666] text-sm">+65 6340 1234<br />+65 6340 5678</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#8FD1FF]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-[#222]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#222] mb-1">Email</h4>
                  <p className="text-[#666] text-sm">support@airpak-express.com<br />sales@airpak-express.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#8FD1FF]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-[#222]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#222] mb-1">Business Hours</h4>
                  <p className="text-[#666] text-sm">Mon - Fri: 9:00 AM - 6:00 PM<br />Sat - Sun: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleContactSubmit} className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#383838] mb-2">Full Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-[#222] placeholder-[#999] focus:outline-none focus:border-[#222] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#383838] mb-2">Email Address</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-[#222] placeholder-[#999] focus:outline-none focus:border-[#222] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#383838] mb-2">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="How can we help you?"
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-xl text-[#222] placeholder-[#999] focus:outline-none focus:border-[#222] transition-colors resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-[#222] text-white font-semibold rounded-xl hover:bg-[#383838] transition-colors flex items-center justify-center gap-2"
              >
                Send Message
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#222] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#222]" />
                </div>
                <span className="text-lg font-bold text-white">AirPak Express</span>
              </div>
              <p className="text-[#999] text-sm leading-relaxed">
                Fast, reliable, and secure international shipping services connecting you to over 150 countries worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-[#999]">
                <li><a href="#tracking" className="hover:text-white transition-colors">Track Shipment</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#999]">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">News</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[#999]">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#383838] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#999]">© 2024 AirPak Express. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-[#999]">
              <span>Created by MiniMax Agent</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
};

export default LandingPage;