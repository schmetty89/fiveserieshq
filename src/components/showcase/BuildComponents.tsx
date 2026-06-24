'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface BuildComponent {
  id: string
  build_id: string
  section: 'powertrain' | 'suspension' | 'wheels_tires'
  name: string
  manufacturer: string | null
  supplier: string | null
  part_number: string | null
  cost: number | null
  quantity: number | null
  status: 'planned' | 'ordered' | 'installed' | 'removed'
  installed_date: string | null
  description: string | null
  sort_order: number
  created_at: string
}

interface FormState {
  section: string
  name: string
  manufacturer: string
  supplier: string
  part_number: string
  cost: string
  quantity: string
  status: string
  installed_date: string
  description: string
}

const EMPTY_FORM: FormState = {
  section: 'powertrain',
  name: '',
  manufacturer: '',
  supplier: '',
  part_number: '',
  cost: '',
  quantity: '',
  status: 'planned',
  installed_date: '',
  description: '',
}

interface Props {
  buildId: string
  isVerified: boolean
}

const SECTION_LABELS: Record<BuildComponent['section'], string> = {
  powertrain: 'Powertrain',
  suspension: 'Suspension',
  wheels_tires: 'Wheels & Tires',
}

const SECTION_STYLES: Record<BuildComponent['section'], string> = {
  powertrain: 'bg-blue-50 text-blue-700',
  suspension: 'bg-amber-50 text-amber-700',
  wheels_tires: 'bg-green-50 text-green-700',
}

const STATUS_STYLES: Record<BuildComponent['status'], string> = {
  planned: 'bg-gray-100 text-gray-600',
  ordered: 'bg-blue-100 text-blue-700',
  installed: 'bg-green-100 text-green-700',
  removed: 'bg-red-100 text-red-500',
}

export function BuildComponents({ buildId, isVerified }: Props) {
  const supabase = createClient()
  const [components, setComponents] = useState<BuildComponent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveFeedback, setSaveFeedback] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function fetchComponents() {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from('build_components')
      .select('*')
      .eq('build_id', buildId)
      .order('sort_order', { ascending: true })
    setLoading(false)
    if (fetchError) { setError("Couldn't load components."); return }
    setComponents(data ?? [])
  }

  useEffect(() => { fetchComponents() }, [buildId]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalCost = components.reduce((sum, c) => sum + (c.cost ?? 0) * (c.quantity ?? 1), 0)
  const installedCount = components.filter(c => c.status === 'installed').length
  const orderedCount = components.filter(c => c.status === 'ordered').length
  const plannedCount = components.filter(c => c.status === 'planned').length

  function openAdd() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setSaveError('')
    setShowForm(true)
  }

  function openEdit(c: BuildComponent) {
    setEditingId(c.id)
    setForm({
      section: c.section,
      name: c.name,
      manufacturer: c.manufacturer ?? '',
      supplier: c.supplier ?? '',
      part_number: c.part_number ?? '',
      cost: c.cost?.toString() ?? '',
      quantity: c.quantity?.toString() ?? '',
      status: c.status,
      installed_date: c.installed_date ?? '',
      description: c.description ?? '',
    })
    setSaveError('')
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setSaveError('')
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSaveComponent(e: React.FormEvent) {
    e.preventDefault()
    setSaveError('')
    if (!form.name.trim()) { setSaveError('Name is required.'); return }

    const payload = {
      section: form.section as BuildComponent['section'],
      name: form.name.trim(),
      manufacturer: form.manufacturer.trim() || null,
      supplier: form.supplier.trim() || null,
      part_number: form.part_number.trim() || null,
      cost: form.cost ? parseFloat(form.cost) : null,
      quantity: form.quantity ? parseInt(form.quantity, 10) : null,
      status: form.status as BuildComponent['status'],
      installed_date: form.installed_date || null,
      description: form.description.trim() || null,
    }

    setSaving(true)
    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from('build_components')
          .update(payload)
          .eq('id', editingId)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('build_components')
          .insert({ ...payload, build_id: buildId, sort_order: components.length })
        if (insertError) throw insertError
      }
      setSaveFeedback(true)
      setTimeout(() => {
        setSaveFeedback(false)
        cancelForm()
        fetchComponents()
      }, 2000)
    } catch {
      setSaveError("Couldn't save — please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const { error: deleteError } = await supabase
      .from('build_components')
      .delete()
      .eq('id', id)
    if (deleteError) { setError("Couldn't delete — please try again."); return }
    setDeletingId(null)
    fetchComponents()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map(i => <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-lg" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isVerified && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-lg px-3.5 py-3">
          <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">This build has been verified and can no longer be edited.</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Running total bar */}
      <div className="bg-gray-50 rounded-lg px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 items-center">
        <span className="text-sm font-semibold text-gray-900">
          Total: ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-xs text-gray-500">{installedCount} installed</span>
        <span className="text-xs text-gray-500">{orderedCount} ordered</span>
        <span className="text-xs text-gray-500">{plannedCount} planned</span>
        <span className="text-xs text-gray-400">{components.length} total</span>
      </div>

      {/* Component list */}
      {components.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl py-10 text-center">
          <p className="text-sm text-gray-500">No components added yet.</p>
          <p className="text-xs text-gray-400 mt-1">Use the form below to document your first modification.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {components.map(c => (
            <li key={c.id} className="py-3 flex items-start gap-3">
              <span className={`mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${SECTION_STYLES[c.section]}`}>
                {SECTION_LABELS[c.section]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{c.name}</p>
                {c.manufacturer && <p className="text-xs text-gray-500 mt-0.5">{c.manufacturer}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status]}`}>
                  {c.status}
                </span>
                {c.cost != null && (
                  <span className="text-sm text-gray-700">
                    ${((c.cost) * (c.quantity ?? 1)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                )}
                {!isVerified && (
                  <>
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    {deletingId === c.id ? (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        Sure?{' '}
                        <button type="button" onClick={() => handleDelete(c.id)} className="underline">Yes</button>
                        {' '}/{' '}
                        <button type="button" onClick={() => setDeletingId(null)} className="underline">Cancel</button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingId(c.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add button */}
      {!isVerified && !showForm && (
        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Add component
          </button>
        </div>
      )}

      {/* Inline add/edit form */}
      {showForm && (
        <form onSubmit={handleSaveComponent} className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">{editingId ? 'Edit component' : 'Add component'}</h3>

          {saveError && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{saveError}</p>
            </div>
          )}

          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Section <span className="text-red-500">*</span></label>
              <select
                name="section"
                value={form.section}
                onChange={handleFormChange}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="powertrain">Powertrain</option>
                <option value="suspension">Suspension</option>
                <option value="wheels_tires">Wheels &amp; Tires</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g. Dinan Stage 1 tune"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status <span className="text-red-500">*</span></label>
              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="planned">Planned</option>
                <option value="ordered">Ordered</option>
                <option value="installed">Installed</option>
                <option value="removed">Removed</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Manufacturer</label>
              <input
                type="text"
                name="manufacturer"
                value={form.manufacturer}
                onChange={handleFormChange}
                placeholder="e.g. Dinan"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Supplier</label>
              <input
                type="text"
                name="supplier"
                value={form.supplier}
                onChange={handleFormChange}
                placeholder="e.g. Turner Motorsport"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Part number</label>
              <input
                type="text"
                name="part_number"
                value={form.part_number}
                onChange={handleFormChange}
                placeholder="e.g. D100-1104"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cost per unit</label>
              <input
                type="number"
                name="cost"
                value={form.cost}
                onChange={handleFormChange}
                placeholder="0.00"
                min={0}
                step={0.01}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleFormChange}
                placeholder="1"
                min={1}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Installed date</label>
              <input
                type="date"
                name="installed_date"
                value={form.installed_date}
                onChange={handleFormChange}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Row 4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description / notes</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows={3}
              placeholder="Additional details about this modification"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Form actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={cancelForm}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || saveFeedback}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition-colors"
            >
              {saveFeedback
                ? 'Saved ✓'
                : saving
                ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                : 'Save component'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
