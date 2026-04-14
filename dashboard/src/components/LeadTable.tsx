'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ExternalLink, Mail, Zap, CheckCircle, AlertCircle, Globe } from 'lucide-react'

export interface Lead {
  id: string
  business_name: string
  website_url: string
  email: string
  phone: string
  city: string
  state: string
  grade: string
  score: number
  brand_primary_color: string
  pagespeed_mobile: number
  tagline: string
}

export default function LeadTable() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeads() {
      const { data, error } = await supabase
        .from('roofing_leads')
        .select('*')
        .order('score', { ascending: false })
      
      if (data) setLeads(data)
      setLoading(false)
    }
    fetchLeads()
  }, [])

  const generateMailto = (lead: Lead) => {
    const subject = `Question regarding ${lead.business_name}'s website`
    const body = `Hi there,\n\nI was looking at your website and noticed your mobile performance score is ${lead.pagespeed_mobile || 'lower than ideal'}. I've put together a preview of what a faster, modern version of your site could look like for your market in ${lead.city}.\n\nAre you open to seeing the preview?\n\nBest,\nMichael`
    return `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  if (loading) return <div className="p-8 text-zinc-500 animate-pulse text-center">Loading Lead Pipeline...</div>

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-md shadow-2xl">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 font-medium uppercase tracking-wider text-xs">
          <tr>
            <th className="px-6 py-4">Business</th>
            <th className="px-4 py-4 text-center">Grade</th>
            <th className="px-4 py-4 text-center">Brand</th>
            <th className="px-4 py-4 text-center">Performance</th>
            <th className="px-6 py-4">Contact</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-zinc-900/40 transition-colors group">
              <td className="px-6 py-5">
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-100 flex items-center gap-2">
                    {lead.business_name}
                    {lead.grade === 'A' && <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  </span>
                  <span className="text-zinc-500 text-xs mt-0.5 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {lead.website_url ? lead.website_url.replace(/https?:\/\//, '') : 'No Website'}
                  </span>
                </div>
              </td>
              <td className="px-4 py-5 text-center">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ring-1 ${
                  lead.grade === 'A' ? 'bg-amber-500/10 text-amber-500 ring-amber-500/30' :
                  lead.grade === 'B' ? 'bg-blue-500/10 text-blue-500 ring-blue-500/30' :
                  'bg-zinc-800 text-zinc-500 ring-zinc-700'
                }`}>
                  {lead.grade}
                </span>
              </td>
              <td className="px-4 py-5 text-center">
                <div className="flex justify-center">
                  <div 
                    className="w-6 h-6 rounded-md shadow-inner border border-zinc-700" 
                    style={{ backgroundColor: lead.brand_primary_color || '#333' }}
                    title={lead.brand_primary_color || 'No Color Extracted'}
                  />
                </div>
              </td>
              <td className="px-4 py-5 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-xs font-mono font-bold ${
                    (lead.pagespeed_mobile || 0) > 80 ? 'text-emerald-500' :
                    (lead.pagespeed_mobile || 0) > 50 ? 'text-amber-500' :
                    'text-rose-500'
                  }`}>
                    {lead.pagespeed_mobile || '--'}
                  </span>
                  <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        (lead.pagespeed_mobile || 0) > 80 ? 'bg-emerald-500' :
                        (lead.pagespeed_mobile || 0) > 50 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}
                      style={{ width: `${lead.pagespeed_mobile || 0}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-300 text-xs truncate max-w-[150px]">{lead.email || 'No Email Found'}</span>
                  <span className="text-zinc-600 text-[10px]">{lead.phone || 'No Phone'}</span>
                </div>
              </td>
              <td className="px-6 py-5 text-right whitespace-nowrap">
                <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={lead.website_url} target="_blank" rel="noreferrer" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {lead.email ? (
                    <a href={generateMailto(lead)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-emerald-500 transition-all rounded-lg text-xs font-semibold text-white group/btn">
                      <Mail className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                      Send Outreach
                    </a>
                  ) : (
                    <button disabled className="px-3 py-2 bg-zinc-800 rounded-lg text-xs font-semibold text-zinc-500 cursor-not-allowed">
                      Need Email
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
