'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { GENERATIONS } from '@/types'
import { ENGINES_BY_GENERATION } from '@/lib/technical-config'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { BuildComponents } from './BuildComponents'
import { BuildPhotos } from './BuildPhotos'

interface Props {
  buildId?: string
}

const EMPTY_FORM = {
  build_name: '',
  year: '',
  generation: '',
  model: '',
  engine: '',
  transmission: '',
  exterior_color: '',
  interior_color: '',
  mileage: '',
  vin: '',
  production_date: '',
  factory_options: '',
  build_description: '',
  build_goals: '',
  inspiration: '',
}

export function BuildSubmitForm({ buildId }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [engineCustom, setEngineCustom] = useState('')
  const [loadError, setLoadError] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [loadingBuild, setLoadingBuild] = useState(!!buildId)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'build_info' | 'components' | 'photos'>('build_info')

  useEffect(() => {
    if (!buildId || !user) { setLoadingBuild(false); return }
    async function load() {
      const { data, error } = await supabase
        .from('builds')
        .select('*')
        .eq('id', buildId)
        .eq('user_id', user!.id)
        .single()
      setLoadingBuild(false)
      if (error || !data) { setLoadError("Couldn't load this draft — it may not exist or belong to your account."); return }
      if (data.moderation_status === 'verified') setIsVerified(true)
      setForm({
        build_name: data.build_name ?? '',
        year: data.year?.toString() ?? '',
        generation: data.generation ?? '',
        model: data.model ?? '',
        engine: data.engine ?? '',
        transmission: data.transmission ?? '',
        exterior_color: data.exterior_color ?? '',
        interior_color: data.interior_color ?? '',
        mileage: data.mileage?.toString() ?? '',
        vin: data.vin ?? '',
        production_date: data.production_date ?? '',
        factory_options: data.factory_options ?? '',
        build_description: data.build_description ?? '',
        build_goals: data.build_goals ?? '',
        inspiration: data.inspiration ?? '',
      })
    }
    load()
  }, [buildId, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const engineOptions = form.generation ? (ENGINES_BY_GENERATION[form.generation] ?? []) : []

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    if (name === 'generation') {
      setForm(f => ({ ...f, generation: value, engine: '' }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
    setSaved(false)
    setSaveError('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError('')
    setSaved(false)

    if (!form.build_name.trim()) { setSaveError('Build name is required.'); return }
    if (!form.year) { setSaveError('Year is required.'); return }
    if (!form.generation) { setSaveError('Generation is required.'); return }
    if (!form.model.trim()) { setSaveError('Model is required.'); return }

    const engineValue = engineCustom.trim() || form.engine || ''

    const payload = {
      build_name: form.build_name.trim(),
      year: parseInt(form.year, 10),
      generation: form.generation,
      model: form.model.trim(),
      engine: engineValue || null,
      transmission: form.transmission.trim() || null,
      exterior_color: form.exterior_color.trim() || null,
      interior_color: form.interior_color.trim() || null,
      mileage: form.mileage ? parseInt(form.mileage, 10) : null,
      vin: form.vin.trim() || null,
      production_date: form.production_date.trim() || null,
      factory_options: form.factory_options.trim() || null,
      build_description: form.build_description.trim() || null,
      build_goals: form.build_goals.trim() || null,
      inspiration: form.inspiration.trim() || null,
    }

    setSaving(true)
    try {
      if (!buildId) {
        const { data, error } = await supabase
          .from('builds')
          .insert({ ...payload, user_id: user!.id })
          .select('id')
          .single()
        if (error || !data) throw error ?? new Error('No data returned')
        router.replace(`/builds/submit?id=${data.id}`)
      } else {
        const { error } = await supabase
          .from('builds')
          .update(payload)
          .eq('id', buildId)
        if (error) throw error
      }
      setSaved(true)
    } catch {
      setSaveError("Couldn't save — please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-14 border border-dashed border-gray-200 rounded-xl">
        <p className="text-sm font-medium text-gray-500 mb-1">Sign in to start a build</p>
        <p className="text-xs text-gray-400">You need to be logged in to create or edit a build.</p>
      </div>
    )
  }

  if (loadingBuild) {
    return <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />
  }

  if (loadError) {
    return (
      <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
        <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-600">{loadError}</p>
      </div>
    )
  }

  const disabled = isVerified || saving

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-100">
        <button
          type="button"
          onClick={() => setActiveTab('build_info')}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'build_info'
              ? 'text-gray-900 border-b-2 border-gray-900 -mb-px'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Build info
        </button>
        <button
          type="button"
          onClick={() => { if (buildId) setActiveTab('components') }}
          disabled={!buildId}
          title={!buildId ? 'Save your build info first to add components.' : undefined}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'components'
              ? 'text-gray-900 border-b-2 border-gray-900 -mb-px'
              : buildId
              ? 'text-gray-400 hover:text-gray-600'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          Components
        </button>
        <button
          type="button"
          onClick={() => { if (buildId) setActiveTab('photos') }}
          disabled={!buildId}
          title={!buildId ? 'Save your build info first to add photos.' : undefined}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'photos'
              ? 'text-gray-900 border-b-2 border-gray-900 -mb-px'
              : buildId
              ? 'text-gray-400 hover:text-gray-600'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          Photos
        </button>
      </div>

      {activeTab === 'build_info' && (
        <form onSubmit={handleSave} className="space-y-8">
          {isVerified && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-lg px-3.5 py-3">
              <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">This build has been verified and can no longer be edited.</p>
            </div>
          )}

          {/* ── Vehicle Information ── */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Vehicle information</h2>
            <div className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Year <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder="e.g. 2003"
                    min={1988}
                    max={2030}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Generation <span className="text-red-500">*</span></label>
                  <select
                    name="generation"
                    value={form.generation}
                    onChange={handleChange}
                    disabled={disabled}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">Select generation</option>
                    {GENERATIONS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Model <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  disabled={disabled}
                  placeholder="e.g. 530i, M5, 540i"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Engine <span className="text-gray-400 font-normal">(optional)</span></label>
                <select
                  name="engine"
                  value={form.engine}
                  onChange={handleChange}
                  disabled={disabled || !form.generation}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400 mb-2"
                >
                  <option value="">{form.generation ? 'Select engine (optional)' : 'Select a generation first'}</option>
                  {engineOptions.map(eng => (
                    <option key={`${eng.model}-${eng.full}`} value={eng.full}>
                      {eng.model} — {eng.full} ({eng.years})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={engineCustom}
                  onChange={e => { setEngineCustom(e.target.value); setSaved(false) }}
                  disabled={disabled}
                  placeholder="Engine not listed? Enter it manually (e.g. S54B32 swap)"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                />
                {engineCustom.trim() && (
                  <p className="text-xs text-gray-400 mt-1">Custom engine will be used instead of the dropdown selection.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Transmission <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    name="transmission"
                    value={form.transmission}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder="e.g. ZF 6-speed automatic"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mileage <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="number"
                    name="mileage"
                    value={form.mileage}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder="e.g. 87000"
                    min={0}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Exterior color <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    name="exterior_color"
                    value={form.exterior_color}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder="e.g. Avus Blue Metallic"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Interior color <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    name="interior_color"
                    value={form.interior_color}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder="e.g. Black Nappa leather"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">VIN <span className="text-gray-400 font-normal">(private, optional)</span></label>
                  <input
                    type="text"
                    name="vin"
                    value={form.vin}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder="Last 7 or full VIN"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Production date <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    name="production_date"
                    value={form.production_date}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder="e.g. 03/2003"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Factory options <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  name="factory_options"
                  value={form.factory_options}
                  onChange={handleChange}
                  disabled={disabled}
                  rows={3}
                  placeholder="Notable factory options, packages, or codes"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

            </div>
          </section>

          {/* ── Build Overview ── */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Build overview</h2>
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Build name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="build_name"
                  value={form.build_name}
                  onChange={handleChange}
                  disabled={disabled}
                  placeholder='e.g. "The Weekend Car" or "Project Alpina"'
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Build description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  name="build_description"
                  value={form.build_description}
                  onChange={handleChange}
                  disabled={disabled}
                  rows={4}
                  placeholder="Tell the story of this build — how you got the car, what it means to you, current state."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Build goals <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  name="build_goals"
                  value={form.build_goals}
                  onChange={handleChange}
                  disabled={disabled}
                  rows={3}
                  placeholder="What are you trying to achieve? Daily driver, track car, show car, full restore?"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Inspiration <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  name="inspiration"
                  value={form.inspiration}
                  onChange={handleChange}
                  disabled={disabled}
                  rows={3}
                  placeholder="What inspired this build? A reference car, a builder, a spec?"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

            </div>
          </section>

          {/* ── Save controls ── */}
          {saveError && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{saveError}</p>
            </div>
          )}

          {saved && (
            <div className="flex items-start gap-2.5 bg-green-50 border border-green-100 rounded-lg px-3.5 py-3">
              <CheckCircle size={15} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-700 font-medium">Draft saved.</p>
                <p className="text-xs text-green-600 mt-0.5">Next: switch to the Components tab to document your modifications.</p>
              </div>
            </div>
          )}

          {!isVerified && (
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              {saved && buildId && (
                <button
                  type="button"
                  onClick={() => setActiveTab('components')}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900 transition-colors"
                >
                  Go to Components →
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition-colors"
              >
                {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : buildId ? 'Save changes' : 'Save draft'}
              </button>
            </div>
          )}
        </form>
      )}

      {activeTab === 'components' && buildId && (
        <BuildComponents buildId={buildId} isVerified={isVerified} />
      )}

      {activeTab === 'photos' && buildId && (
        <BuildPhotos buildId={buildId} isVerified={isVerified} />
      )}
    </div>
  )
}
