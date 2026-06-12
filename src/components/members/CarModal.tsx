'use client'

import { useState } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { GENERATIONS } from '@/types'
import { addGarageCar, updateGarageCar } from '@/lib/member-data'

interface CarForm {
  year: string
  model: string
  generation: string
  bodyStyle: string
  colorName: string
  colorCode: string
  mileage: string
  vinLast5: string
  isPrimary: boolean
}

interface ExistingCar {
  id: string
  year: number
  model: string
  generation: string
  body_style: string
  color_name: string
  color_code: string
  mileage?: string
  vin_last5?: string
  is_primary: boolean
}

interface Props {
  userId: string
  existing?: ExistingCar
  onClose: () => void
  onSaved: () => void
}

export function CarModal({ userId, existing, onClose, onSaved }: Props) {
  const [form, setForm] = useState<CarForm>({
    year: existing?.year?.toString() ?? '',
    model: existing?.model ?? '',
    generation: existing?.generation ?? '',
    bodyStyle: existing?.body_style ?? 'Sedan',
    colorName: existing?.color_name ?? '',
    colorCode: existing?.color_code ?? '',
    mileage: existing?.mileage ?? '',
    vinLast5: existing?.vin_last5 ?? '',
    isPrimary: existing?.is_primary ?? false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.year || isNaN(Number(form.year))) return setError('Please enter a valid year.')
    if (!form.model.trim()) return setError('Please enter the model.')
    if (!form.generation) return setError('Please select a generation.')
    if (!form.colorName.trim()) return setError('Please enter the color name.')

    setLoading(true)
    try {
      if (existing) {
        await updateGarageCar(existing.id, userId, {
          year: Number(form.year),
          model: form.model.trim(),
          generation: form.generation,
          bodyStyle: form.bodyStyle,
          colorName: form.colorName.trim(),
          colorCode: form.colorCode.trim(),
          mileage: form.mileage.trim() || undefined,
          vinLast5: form.vinLast5.trim() || undefined,
          isPrimary: form.isPrimary,
        })
      } else {
        await addGarageCar({
          userId,
          year: Number(form.year),
          model: form.model.trim(),
          generation: form.generation,
          bodyStyle: form.bodyStyle,
          colorName: form.colorName.trim(),
          colorCode: form.colorCode.trim(),
          mileage: form.mileage.trim() || undefined,
          vinLast5: form.vinLast5.trim() || undefined,
          isPrimary: form.isPrimary,
        })
      }
      onSaved()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">
            {existing ? 'Edit car' : 'Add a car to your garage'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3.5 py-3">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
              <input type="number" name="year" value={form.year} onChange={handleChange}
                placeholder="e.g. 2001" min="1988" max={new Date().getFullYear()}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Generation</label>
              <select name="generation" value={form.generation} onChange={handleChange}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
                <option value="">Select generation</option>
                {GENERATIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Model / trim</label>
              <input type="text" name="model" value={form.model} onChange={handleChange}
                placeholder="e.g. 530i"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Body style</label>
              <select name="bodyStyle" value={form.bodyStyle} onChange={handleChange}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
                <option value="Sedan">Sedan</option>
                <option value="Touring">Touring</option>
                <option value="M5">M5</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Color name</label>
              <input type="text" name="colorName" value={form.colorName} onChange={handleChange}
                placeholder="e.g. Titansilber Metallic"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Color code</label>
              <input type="text" name="colorCode" value={form.colorCode} onChange={handleChange}
                placeholder="e.g. 354"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current mileage</label>
              <input type="text" name="mileage" value={form.mileage} onChange={handleChange}
                placeholder="e.g. 162,400"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">VIN last 5 <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" name="vinLast5" value={form.vinLast5} onChange={handleChange}
                placeholder="e.g. GF80X" maxLength={5}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input type="checkbox" id="isPrimary" name="isPrimary"
              checked={form.isPrimary}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
            <label htmlFor="isPrimary" className="text-sm text-gray-700 cursor-pointer">
              Set as my primary car
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 mt-4">
            <button type="button" onClick={onClose}
              className="text-sm px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition-colors">
              {loading ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : existing ? 'Save changes' : 'Add to garage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
