import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Swords, Trophy, Shield, Code2, Coins,
  ChevronRight, ArrowRight, Star, Users, Timer
} from 'lucide-react';

/**
 * LandingPage — Hero section + features + how it works
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-arena-bg overflow-hidden">
      {/* === Top Nav === */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-arena-accent flex items-center justify-center">
            <Zap className="w-6 h-6 text-arena-bg" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            <span className="text-arena-accent">CODE</span>
            <span className="text-white">ARENA</span>
          </span>
        </div>
        <Link to="/auth" className="btn-neon text-sm">
          Enter Arena <ArrowRight className="w-4 h-4 inline ml-1" />
        </Link>
      </nav>

      {/* === Hero Section === */}
      <section className="relative pt-20 pb-32 px-6">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-arena-accent/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-arena-accent2/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-arena-accent/30 bg-arena-accent/5 mb-8">
              <div className="w-2 h-2 bg-arena-success rounded-full animate-pulse" />
              <span className="text-sm font-mono text-arena-accent">POWERED BY STELLAR BLOCKCHAIN</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none mb-6">
              <span className="text-white">CODE.</span>
              <br />
              <span className="gradient-text">COMPETE.</span>
              <br />
              <span className="text-white">CONQUER.</span>
            </h1>

            <p className="text-lg sm:text-xl text-arena-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Stake XLM, battle head-to-head in algorithmic challenges, and claim your opponent's stake. 
              The ultimate fusion of competitive coding and crypto.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth" className="btn-solid text-lg group flex items-center gap-2">
                Start Fighting
                <Swords className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>
              <a href="#how-it-works" className="btn-neon-pink text-lg flex items-center gap-2">
                How It Works
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: 'Active Battles', value: '2,847', icon: Swords },
              { label: 'Total Players', value: '18.5K', icon: Users },
              { label: 'XLM Distributed', value: '425K', icon: Coins },
              { label: 'Avg. Battle Time', value: '12min', icon: Timer },
            ].map(({ label, value, icon: Icon }, i) => (
              <div key={label} className="brutal-card p-4 text-center">
                <Icon className="w-6 h-6 text-arena-accent mx-auto mb-2" />
                <div className="font-display font-bold text-2xl text-white">{value}</div>
                <div className="text-xs text-arena-muted uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* === How It Works === */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-arena-muted max-w-xl mx-auto">
              Three simple steps to enter the arena and start earning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect & Stake',
                desc: 'Connect your Freighter wallet and deposit XLM. Choose your stake amount and find an opponent.',
                icon: Coins,
                color: 'arena-accent',
              },
              {
                step: '02',
                title: 'Battle',
                desc: 'Race against your opponent to solve algorithmic challenges. Code in Python, C++, Java, or JavaScript.',
                icon: Code2,
                color: 'arena-accent2',
              },
              {
                step: '03',
                title: 'Win & Collect',
                desc: 'Smart contracts automatically release the pooled stake to the winner. No middleman. No delays.',
                icon: Trophy,
                color: 'arena-accent3',
              },
            ].map(({ step, title, desc, icon: Icon, color }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative group"
              >
                <div className="brutal-card p-6 h-full">
                  <div className={`text-6xl font-display font-black text-${color}/20 mb-4`}>
                    {step}
                  </div>
                  <div className={`w-12 h-12 bg-${color}/10 border border-${color}/30 flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${color}`} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-white mb-3">{title}</h3>
                  <p className="text-arena-muted text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === Features Grid === */}
      <section className="py-24 px-6 bg-arena-surface/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              Built for <span className="gradient-text-warm">Champions</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Anti-Cheat System', desc: 'Tab switching detection, copy-paste disabled, and code plagiarism checks.' },
              { icon: Zap, title: 'Real-time Updates', desc: 'See your opponent typing, submitting, and testing in real-time via WebSockets.' },
              { icon: Code2, title: 'Monaco Editor', desc: 'Full VS Code experience with syntax highlighting, autocomplete, and multi-language support.' },
              { icon: Coins, title: 'Smart Contract Escrow', desc: 'Funds locked in Soroban smart contracts. Automatic, trustless payouts.' },
              { icon: Trophy, title: 'Elo Rating', desc: 'Skill-based matchmaking with a competitive rating system.' },
              { icon: Star, title: 'NFT Badges', desc: 'Earn unique badges for achievements and winning streaks.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 hover:border-arena-accent/30 transition-colors group"
              >
                <Icon className="w-8 h-8 text-arena-accent mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-display font-bold text-white mb-2">{title}</h3>
                <p className="text-arena-muted text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA Section === */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-arena-accent/5 rounded-full blur-[200px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-display font-black text-4xl md:text-6xl text-white mb-6">
            Ready to <span className="gradient-text">Fight</span>?
          </h2>
          <p className="text-arena-muted text-lg mb-8">
            The arena awaits. Connect your wallet and prove your skills.
          </p>
          <Link to="/auth" className="btn-solid text-lg inline-flex items-center gap-2">
            Enter the Arena
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* === Footer === */}
      <footer className="border-t border-arena-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-arena-accent" />
            <span className="font-display font-bold text-sm text-arena-muted">
              CODEARENA © 2026
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-arena-muted">
            <span>Powered by Stellar</span>
            <span>•</span>
            <span>Soroban Smart Contracts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
