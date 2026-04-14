import LeadTable from '@/components/LeadTable'
import { LayoutDashboard, Users, Zap, MailCheck } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 p-6 md:p-12 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-widest text-xs">
              <Zap className="w-4 h-4 fill-blue-500" />
              <span>Wood Fired Designs</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Lead <span className="text-zinc-500 italic font-medium">Command</span>
            </h1>
            <p className="text-zinc-500 text-lg">Real-time roofer outreach engine & pipeline tracking.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800">
             <div className="px-6 py-3 border-r border-zinc-800 text-center">
                <span className="block text-2xl font-black text-white">59</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Grade A</span>
             </div>
             <div className="px-6 py-3 border-r border-zinc-800 text-center">
                <span className="block text-2xl font-black text-zinc-400">100</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Harvested</span>
             </div>
             <div className="px-6 py-3 text-center">
                <span className="block text-2xl font-black text-emerald-500">Active</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Pipeline</span>
             </div>
          </div>
        </header>

        {/* Dashboard Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-all group">
            <LayoutDashboard className="w-8 h-8 text-zinc-600 mb-4 group-hover:text-blue-500 transition-colors" />
            <h3 className="text-lg font-bold mb-1">Pipeline Health</h3>
            <p className="text-sm text-zinc-500">Monitoring 102 target territories across the East Coast.</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-all group">
            <Users className="w-8 h-8 text-zinc-600 mb-4 group-hover:text-emerald-500 transition-colors" />
            <h3 className="text-lg font-bold mb-1">Enrichment Status</h3>
            <p className="text-sm text-zinc-500">Contact finding powered by Anymail Finder & Firecrawl.</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-all group">
            <MailCheck className="w-8 h-8 text-zinc-600 mb-4 group-hover:text-amber-500 transition-colors" />
            <h3 className="text-lg font-bold mb-1">Outreach Ready</h3>
            <p className="text-sm text-zinc-500">Verified emails are ready for personalized Outlook sending.</p>
          </div>
        </section>

        {/* Main Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Recent Harvest
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px] uppercase font-black uppercase">Live</span>
            </h2>
          </div>
          <LeadTable />
        </section>

        {/* Footer */}
        <footer className="pt-12 pb-6 text-center border-t border-zinc-900">
           <p className="text-zinc-600 text-xs tracking-tighter uppercase font-medium">&copy; 2026 Wood Fired Designs &bull; Salisbury, MD HQ</p>
        </footer>

      </div>
    </main>
  )
}
