import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ayur-green/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-ayur-accent/10 rounded-full blur-3xl pointer-events-none" />

      <h1 className="font-outfit text-5xl md:text-7xl font-bold text-ayur-green-dark mb-6 tracking-tight relative z-10">
        Personalized Ayurvedic Care,<br className="hidden md:block"/> Connected.
      </h1>
      <p className="text-lg md:text-xl text-ayur-muted max-w-2xl mb-10 relative z-10">
        Connect with top practitioners, manage your therapies, and achieve holistic wellness with our advanced, integrated platform.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        <Link href="/register">
          <Button size="lg" className="w-full sm:w-auto text-lg px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            Start Your Journey
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white/50 backdrop-blur-sm">
            I already have an account
          </Button>
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full relative z-10">
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-ayur-green/10 rounded-full flex items-center justify-center mb-4 text-ayur-green">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Expert Practitioners</h3>
          <p className="text-ayur-muted text-sm">Find and connect with certified Ayurvedic specialists tailored to your needs.</p>
        </div>
        
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-ayur-accent/10 rounded-full flex items-center justify-center mb-4 text-ayur-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Structured Plans</h3>
          <p className="text-ayur-muted text-sm">Follow personalized therapy templates and schedules with progress tracking.</p>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Seamless Communcation</h3>
          <p className="text-ayur-muted text-sm">Stay in touch with your practitioner, receive real-time notifications, and give feedback.</p>
        </div>
      </div>
    </div>
  );
}
