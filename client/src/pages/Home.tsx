import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OnboardingWizard from "@/components/onboarding-wizard";
import { Loader2, ArrowLeft, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [changeEmail, setChangeEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: changeEmail, currentPassword, newPassword }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Password change failed");
      }
      toast({ title: "Password Changed!", description: "You can now login with your new password" });
      setShowChangePassword(false);
      setChangeEmail("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Change Failed", description: error.message || "Could not change password", variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      toast({ title: "Welcome back!", description: "Redirecting to your dashboard..." });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message || "Invalid email or password", variant: "destructive" });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGetStarted = () => {
    setShowLogin(false);
    setShowSignupForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginPage = () => {
    setShowLogin(true);
    setShowSignupForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showSignupForm) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <button onClick={() => { setShowSignupForm(false); setShowLogin(false); setShowChangePassword(false); }} className="flex items-center gap-2 text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <span className="text-xl font-bold text-[#FF5A5F]">Linknow</span>
            <div className="w-16" />
          </div>
        </header>
        <main className="py-12 px-6">
          <div className="max-w-lg mx-auto">
            {showLogin ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-100">
                {showChangePassword ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Change Password</h2>
                    <p className="text-gray-500 mb-6">Enter your current password to set a new one.</p>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <Input type="email" value={changeEmail} onChange={(e) => setChangeEmail(e.target.value)} required className="mt-1.5 h-11" placeholder="you@example.com" data-testid="input-change-email" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Current Password</Label>
                        <div className="relative mt-1.5">
                          <Input type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="h-11 pr-10" data-testid="input-current-password" />
                          <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">New Password</Label>
                        <div className="relative mt-1.5">
                          <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="h-11 pr-10" data-testid="input-new-password" />
                          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Confirm Password</Label>
                        <div className="relative mt-1.5">
                          <Input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="h-11 pr-10" data-testid="input-confirm-password" />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" disabled={isChangingPassword} className="w-full h-11 bg-[#FF5A5F] hover:bg-[#E8515A] font-medium" data-testid="button-change-password">
                        {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                      </Button>
                    </form>
                    <button onClick={() => setShowChangePassword(false)} className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1">
                      <ArrowLeft className="w-3 h-3" /> Back to login
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
                    <p className="text-gray-500 mb-6">Sign in to your account</p>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="mt-1.5 h-11" placeholder="you@example.com" data-testid="input-login-email" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Password</Label>
                          <button type="button" onClick={() => setShowChangePassword(true)} className="text-xs text-[#FF5A5F] hover:underline" data-testid="link-change-password">Change password?</button>
                        </div>
                        <div className="relative mt-1.5">
                          <Input type={showLoginPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="h-11 pr-10" data-testid="input-login-password" />
                          <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" data-testid="toggle-login-password">
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" disabled={isLoggingIn} className="w-full h-11 bg-[#FF5A5F] hover:bg-[#E8515A] font-medium" data-testid="button-submit-login">
                        {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
                      </Button>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-500">
                      Don't have an account? <button onClick={() => setShowLogin(false)} className="text-[#FF5A5F] font-medium hover:underline">Create one</button>
                    </p>
                  </>
                )}
              </div>
            ) : (
              <OnboardingWizard />
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Pattern Interrupt Bar */}
      <div style={{ backgroundColor: '#101828' }} className="w-full flex items-center justify-center px-4 py-2" data-testid="pattern-interrupt-bar">
        <p className="text-white text-xs sm:text-sm font-bold tracking-wide">
          <span className="hidden sm:inline">Dubai Agents: Stop replying to "Hi". Start talking to buyers.</span>
          <span className="sm:hidden">Stop replying to "Hi". Start talking to buyers.</span>
        </p>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF5A5F] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#FF5A5F]">Linknow</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleLoginPage} className="text-sm font-medium text-gray-700 hover:text-gray-900" data-testid="button-login">
              Login
            </button>
            <button onClick={handleGetStarted} className="h-10 px-5 bg-[#FF5A5F] hover:bg-[#E8515A] text-white text-sm font-bold rounded-full transition-colors" data-testid="button-nav-cta">
              Create My Agent Link
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 sm:pt-32 lg:pt-40 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-[1.15] tracking-tight">
            <span className="block">Turn Instagram Traffic</span>
            <span className="block">Into Serious Property Buyers</span>
            <span className="block text-[#FF5A5F]">Not "Hi / Hello" Messages.</span>
          </h1>
          
          <p className="mt-6 sm:mt-8 text-[15px] sm:text-lg text-gray-600 leading-[1.75] sm:leading-[1.8] px-4 sm:px-2" style={{ maxWidth: '720px', margin: '24px auto 0' }}>
            Automatically qualify buyers, filter out time-wasters,
            <br className="hidden sm:inline" /> and walk into every conversation knowing budget,
            <br className="hidden sm:inline" /> timeline, and intent — before you even reply.
          </p>
          
          <div style={{ marginTop: '20px' }} className="sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <button onClick={handleGetStarted} className="w-full sm:w-auto px-8 sm:px-10 bg-[#FF5A5F] hover:bg-[#E8515A] text-white text-base font-bold rounded-full transition-all hover:shadow-lg" style={{ height: '56px', minWidth: '240px' }} data-testid="button-get-started">
              Create My Agent Link
            </button>
            <button onClick={() => window.open('https://linknow.live/zayn-shaa', '_blank')} className="w-full sm:w-auto px-8 sm:px-10 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-base font-semibold rounded-full transition-all flex items-center justify-center gap-2" style={{ height: '56px' }} data-testid="button-see-demo">
              <ExternalLink className="w-4 h-4" />
              See Live Demo
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-400">Founder-led setup. Live in minutes.</p>
        </div>
      </section>

      {/* Scarcity Bar */}
      <section className="px-4 sm:px-6" style={{ paddingTop: '24px', paddingBottom: '32px' }}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#FFF0F0] border border-[#FF5A5F]/20 rounded-2xl py-4 sm:py-5 px-6 sm:px-8 text-center" data-testid="scarcity-bar">
            <p className="text-[#FF5A5F] font-bold text-sm sm:text-base tracking-wider" style={{ textTransform: 'uppercase' }}>
              <span className="hidden sm:inline">ONLY 50 FOUNDING AGENT SPOTS IN DUBAI</span>
              <span className="sm:hidden">ONLY 50 FOUNDING AGENTS</span>
            </p>
            <p className="text-gray-600 text-xs sm:text-sm mt-1.5 font-medium">
              <span className="hidden sm:inline">Personal setup. Direct founder support. Priority feature access.</span>
              <span className="sm:hidden">Personal onboarding included.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Banner */}
      <section style={{ backgroundColor: '#101828' }} className="w-full py-12 sm:py-14 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p style={{ color: '#ffffff' }} className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">Founding Agent Offer — AED 299 for 3 Months</p>
          <p style={{ color: '#9CA3AF' }} className="text-sm sm:text-base font-normal">Just AED 99/month</p>
          <p style={{ color: '#6B7280' }} className="text-xs sm:text-sm mt-2">No tiers, no confusion — just results.</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why agents are switching</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto px-2">Stop chasing unqualified leads. Start closing deals.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-7">
            <div className="bg-white rounded-2xl p-7 sm:p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-rose-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-[#FF5A5F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pre-Qualify Buyers Automatically</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Know budget, timeline, and intent before you ever reply to a message.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-7 sm:p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-rose-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-[#FF5A5F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Send ONE Link That Sells You 24/7</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Properties, bio, contact — all in one professional hub that works while you sleep.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-7 sm:p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-rose-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-[#FF5A5F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Look Like a Top-1% Agent — Even If You're New</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Professional presence that builds instant credibility and trust.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Profile - Live Preview */}
      <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">See it in action</h2>
            <p className="text-base sm:text-lg text-gray-600 px-2">Real agent. Real results. Live preview below.</p>
          </div>
          
          <div className="flex flex-col items-center">
            {/* Mobile Phone Mockup - visible on mobile/tablet */}
            <div className="lg:hidden relative mx-auto">
              <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-10" />
                <div className="relative bg-white rounded-[2.5rem] overflow-hidden" style={{ width: '300px', height: '600px' }}>
                  <iframe 
                    src="https://linknow.live/zayn-shaa"
                    className="w-full h-full border-0"
                    title="Live Profile Preview Mobile"
                  />
                </div>
              </div>
            </div>

            {/* Desktop/Laptop Mockup - visible on desktop */}
            <div className="hidden lg:block relative mx-auto">
              <div className="relative">
                <div className="bg-gray-800 rounded-t-xl p-3 pb-0">
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-600 rounded-full" />
                  <div className="bg-white rounded-t-lg overflow-hidden shadow-inner" style={{ width: '800px', height: '500px' }}>
                    <iframe 
                      src="https://linknow.live/zayn-shaa"
                      className="w-full h-full border-0"
                      title="Live Profile Preview Desktop"
                    />
                  </div>
                </div>
                <div className="bg-gray-700 h-4 rounded-b-lg" style={{ width: '800px' }} />
                <div className="bg-gray-600 h-2 mx-auto rounded-b-xl" style={{ width: '300px' }} />
              </div>
            </div>
            
            {/* Persuasion Caption */}
            <div className="mt-8 sm:mt-10 text-center max-w-[280px] sm:max-w-[480px] mx-auto">
              <p className="text-gray-700 text-sm sm:text-base font-medium leading-relaxed mb-6">
                This profile converts cold Instagram visitors into serious buyers automatically.
              </p>
              <button onClick={handleGetStarted} className="w-full sm:w-auto px-8 sm:px-10 bg-[#FF5A5F] hover:bg-[#E8515A] text-white font-bold rounded-full transition-all hover:shadow-lg" style={{ height: '56px', minWidth: '240px' }} data-testid="button-demo-cta">
                Create My Agent Link
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Ready to convert more leads?</h2>
          <p className="text-gray-400 text-base sm:text-lg mb-8 sm:mb-10 px-2 max-w-md mx-auto">Join the agents who are closing more deals with less effort.</p>
          <button onClick={handleGetStarted} className="w-full sm:w-auto px-8 sm:px-10 bg-[#FF5A5F] hover:bg-[#E8515A] text-white font-bold rounded-full transition-all hover:shadow-lg" style={{ height: '56px', minWidth: '260px' }} data-testid="button-final-cta">
            Create My Agent Link
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 px-4 sm:px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gray-500 text-xs sm:text-sm">© 2026 Linknow. Built for Dubai agents.</p>
        </div>
      </footer>
    </div>
  );
}
