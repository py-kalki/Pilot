import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Ecosystem } from './components/Ecosystem';
import { RealWorldExpertise } from './components/RealWorldExpertise';
import { NetworkOfHumanTaste } from './components/NetworkOfHumanTaste';
import { FeedbackShowcase } from './components/FeedbackShowcase';
import { ModelArenaWidget } from './components/ModelArenaWidget';
import { LeverageQuote } from './components/LeverageQuote';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';

export function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fbfaf6] text-[#2b2b29] font-sans-custom relative flex flex-col selection:bg-[#c8e1dd] selection:text-[#2b2b29]">
      {/* Navigation Header */}
      <Navbar onOpenContact={() => setIsContactOpen(true)} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero onOpenContact={() => setIsContactOpen(true)} />
        <Ecosystem onOpenContact={() => setIsContactOpen(true)} />
        <RealWorldExpertise />
        <NetworkOfHumanTaste />
        <FeedbackShowcase />
        <ModelArenaWidget />
        <LeverageQuote />
      </main>

      {/* Footer Section */}
      <Footer onOpenContact={() => setIsContactOpen(true)} />

      {/* Contact Partnership Modal */}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}

export default App;
