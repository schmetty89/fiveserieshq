'use client'

import { useState } from 'react'
import { Plus, Star, Edit, Trash2, ExternalLink } from 'lucide-react'
import { GEN_COLORS } from '@/lib/forum-config'
import { Generation } from '@/types'
import { CarModal } from './CarModal'
import { deleteGarageCar, setPrimarycar } from '@/lib/member-data'

interface Car {
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
  build_id?: string
}

interface Props {
  cars: Car[]
  userId: string
  onRefresh: () => void
}

export function GarageTab({ cars, userId, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(carId: string) {
    if (!confirm('Remove this car from your garage?')) return
    setDeletingId(carId)
    try {
      await deleteGarageCar(carId, userId)
      onRefresh()
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSetPrimary(carId: string) {
    await setPrimarycar(carId, userId)
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{cars.length} car{cars.length !== 1 ? 's' : ''} in garage</p>
        <button
          onClick={() => { setEditingCar(undefined); setShowModal(true) }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus size={14} /> Add car
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cars.map(car => {
          const colors = GEN_COLORS[car.generation as Generation]
          return (
            <div
              key={car.id}
              className={`border rounded-xl overflow-hidden transition-colors ${
                car.is_primary ? 'border-blue-200 ring-1 ring-blue-200' : 'border-gray-100'
              }`}
            >
              {/* Car image placeholder */}
              <div className="h-28 bg-gray-50 flex items-center justify-center relative">
                <span className="text-5xl">🚗</span>
                {car.is_primary && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    <Star size={9} /> Primary
                  </div>
                )}
                <div
                  className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: colors?.bg, color: colors?.text }}
                >
                  {car.generation}
                </div>
              </div>

              {/* Car info */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {car.year} BMW 5 Series {car.model}
                </h3>
                <div className="space-y-1 mb-3">
                  <p className="text-xs text-gray-500">🎨 {car.color_name}{car.color_code ? ` (${car.color_code})` : ''}</p>
                  {car.mileage && <p className="text-xs text-gray-500">📍 {car.mileage} miles</p>}
                  {car.vin_last5 && <p className="text-xs text-gray-500">🔢 VIN: ···{car.vin_last5}</p>}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {car.build_id && (
                    <a href={`/builds/${car.build_id}`}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-700 transition-colors">
                      <ExternalLink size={11} /> View build
                    </a>
                  )}
                  {!car.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(car.id)}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Star size={11} /> Set primary
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingCar(car); setShowModal(true) }}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Edit size={11} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(car.id)}
                    disabled={deletingId === car.id}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-red-100 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={11} /> Remove
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add car card */}
        <button
          onClick={() => { setEditingCar(undefined); setShowModal(true) }}
          className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 py-10 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors min-h-[200px]"
        >
          <Plus size={22} />
          <span className="text-sm">Add another car</span>
        </button>
      </div>

      {showModal && (
        <CarModal
          userId={userId}
          existing={editingCar}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); onRefresh() }}
        />
      )}
    </div>
  )
}
