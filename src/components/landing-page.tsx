"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Train, 
  Search, 
  Bell, 
  ArrowRight, 
  TrendingUp, 
  HelpCircle,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  const [pnr, setPnr] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pnr.trim()) {
      window.location.href = `/dashboard?pnr=${pnr.trim()}`;
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-radial from-slate-50 to-slate-100 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-50">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[600px] w-[600px] translate-x-1/2 rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-slate-50/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/80">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-md shadow-orange-500/20">
              <Train className="h-5 w-5 text-white" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              Ixigo-Live PNR Tracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors dark:text-slate-300 dark:hover:text-amber-500">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors dark:text-slate-300 dark:hover:text-amber-500">
              How it Works
            </a>
            <a href="#faqs" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors dark:text-slate-300 dark:hover:text-amber-500">
              FAQs
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hover:text-orange-600 dark:hover:text-amber-500">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-medium shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 hover:scale-[1.02]">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 md:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-6 md:hidden dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4">
              <a 
                href="#features" 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium text-slate-600 dark:text-slate-300"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium text-slate-600 dark:text-slate-300"
              >
                How it Works
              </a>
              <a 
                href="#faqs" 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium text-slate-600 dark:text-slate-300"
              >
                FAQs
              </a>
              <hr className="border-slate-200 dark:border-slate-800" />
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="container mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left side: Heading */}
            <div className="flex flex-col items-start space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 px-4 py-1.5 text-sm font-semibold text-orange-700 shadow-xs dark:border-orange-900/30 dark:bg-orange-950/30 dark:text-orange-400">
                <Sparkles className="h-4 w-4 animate-pulse" />
                Live PNR Track & Smart Notifications
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                Track your Indian Railways{" "}
                <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                  PNR Status
                </span>{" "}
                Live.
              </h1>

              <p className="max-w-2xl text-lg text-slate-600 md:text-xl dark:text-slate-300">
                Never miss an update. Monitor seat confirmation probabilities, live train running schedules, platform changes, and get automated alerts directly.
              </p>

              {/* PNR Search Card */}
              <Card className="w-full max-w-xl border-slate-200 bg-white/70 shadow-xl shadow-slate-100/50 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
                <CardContent className="p-4">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Enter 10-Digit PNR Number"
                        maxLength={10}
                        pattern="\d{10}"
                        value={pnr}
                        onChange={(e) => setPnr(e.target.value.replace(/\D/g, ""))}
                        className="pl-10 h-12 bg-white/50 border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 dark:bg-slate-950/50 dark:border-slate-800"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="h-12 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white px-6 font-semibold shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300"
                    >
                      Track Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    By submitting, you can inspect instant seat configuration, coach details, and route predictions.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right side: App Mockup */}
            <div className="relative lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[400px] overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-2xl shadow-slate-200/80 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                <div className="rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 p-6 text-white">
                  
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
                        <Train className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">PNR Status Tracker</div>
                        <div className="text-sm font-semibold">12626 / Kerala Express</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                      Confirmed
                    </span>
                  </div>

                  {/* Mockup Details */}
                  <div className="py-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">NDLS</div>
                        <div className="text-lg font-bold">New Delhi</div>
                        <div className="text-[10px] text-slate-400">Platform 3 • 20:10</div>
                      </div>
                      <div className="flex flex-col items-center flex-1 px-4">
                        <span className="text-[10px] text-orange-400 font-semibold mb-1">30 hrs 15 mins</span>
                        <div className="w-full h-0.5 bg-slate-800 relative">
                          <div className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-50" />
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1">Daily Run</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">TVC</div>
                        <div className="text-lg font-bold">Trivandrum</div>
                        <div className="text-[10px] text-slate-400">Platform 1 • 06:25</div>
                      </div>
                    </div>

                    {/* Booking status vs current status */}
                    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Passenger 1 (S9, 42)</span>
                        <span className="text-emerald-400 font-medium">CNF (S9/42)</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-emerald-500" />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Passenger 2 (S9, 45)</span>
                        <span className="text-amber-400 font-medium">WL 4 → CNF</span>
                      </div>
                    </div>
                  </div>

                  {/* Notification toast */}
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-xs text-orange-200">
                    <Bell className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-orange-300">Live Notification</div>
                      <div>Your chart is prepared. Coach S9, Berth 42 (Upper).</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-slate-100/50 py-20 dark:bg-slate-900/30">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Track Smartly, Travel Peacefully
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                Experience the next-gen railway utility loaded with features designed to take stress out of your journey.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform dark:bg-orange-950/50 dark:text-orange-400">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold">1-Click PNR Lookup</h3>
                <p className="mt-3 text-slate-600 dark:text-slate-300">
                  Get details about your train, booking status, berth allocation, coach layout, and chart status instantly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform dark:bg-amber-950/50 dark:text-amber-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold">Confirmation Probability</h3>
                <p className="mt-3 text-slate-600 dark:text-slate-300">
                  Know the odds of your waitlisted tickets getting confirmed, calculated using historical train trends.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform dark:bg-blue-950/50 dark:text-blue-400">
                  <Bell className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold">Instant Notifications</h3>
                <p className="mt-3 text-slate-600 dark:text-slate-300">
                  Recieve notifications for chart preparation status, delays, and departure updates automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Start Tracking?
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                Three simple steps to keep your travel status updated on-the-go.
              </p>
            </div>

            <div className="grid gap-12 md:grid-cols-3 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200/50 -translate-y-1/2 hidden md:block dark:bg-slate-800/50" />
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-500/20">
                  1
                </div>
                <h3 className="mt-6 text-lg font-bold">Enter PNR</h3>
                <p className="mt-2 text-sm text-slate-600 max-w-xs dark:text-slate-400">
                  Type in your 10-digit Passenger Name Record number located on your ticket.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-500/20">
                  2
                </div>
                <h3 className="mt-6 text-lg font-bold">Analyze Status</h3>
                <p className="mt-2 text-sm text-slate-600 max-w-xs dark:text-slate-400">
                  Check confirmation levels, coach details, platform predictions, and routes.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-500/20">
                  3
                </div>
                <h3 className="mt-6 text-lg font-bold">Set Alerts</h3>
                <p className="mt-2 text-sm text-slate-600 max-w-xs dark:text-slate-400">
                  Subscribe to push notifications or checks for instant real-time changes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faqs" className="bg-slate-100/50 py-20 dark:bg-slate-900/30">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h4 className="flex items-center gap-3 text-lg font-bold">
                  <HelpCircle className="h-5 w-5 text-orange-600 shrink-0" />
                  What is a PNR number and where is it located?
                </h4>
                <p className="mt-3 text-slate-600 pl-8 dark:text-slate-300">
                  PNR stands for Passenger Name Record. It is a 10-digit number unique to each booking. On physical tickets, it is printed at the top-left corner. On e-tickets/SMS, it is clearly labelled as PNR.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h4 className="flex items-center gap-3 text-lg font-bold">
                  <HelpCircle className="h-5 w-5 text-orange-600 shrink-0" />
                  How accurate is the confirmation probability estimation?
                </h4>
                <p className="mt-3 text-slate-600 pl-8 dark:text-slate-300">
                  The probability is generated using historical data profiles for identical routes, seasons, and trains. While highly predictive, it serves as a guidance forecast and is not a confirmation guarantee.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h4 className="flex items-center gap-3 text-lg font-bold">
                  <HelpCircle className="h-5 w-5 text-orange-600 shrink-0" />
                  Is my personal travel information secure?
                </h4>
                <p className="mt-3 text-slate-600 pl-8 dark:text-slate-300">
                  Yes, your data safety is our highest priority. We do not store passenger credentials or name details permanently, complying strictly with data privacy protocols.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="container mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
              <Train className="h-4 w-4 text-white" />
            </div>
            <span className="font-sans font-bold text-lg bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              Ixigo
            </span>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Ixigo. All rights reserved. Created for Kalvium Railways.
          </p>

          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-orange-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
