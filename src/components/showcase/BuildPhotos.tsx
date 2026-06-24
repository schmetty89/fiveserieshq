'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Loader2, AlertCircle, Upload, Star, Trash2, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface BuildPhoto {
  id: string
  build_id: string
  url: string
  caption: string | null
  is_cover: boolean
  sort_order: number
  created_at: string
}

interface UploadItem {
  tempId: string
  filename: string
  status: 'uploading' | 'error'
  file: File
}

interface Props {
  buildId: string
  isVerified: boolean
}

const MAX_PHOTOS = 20

export function BuildPhotos({ buildId, isVerified }: Props) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] = useState<BuildPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadWarning, setUploadWarning] = useState('')
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
  const [captions, setCaptions] = useState<Record<string, string>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDragOverZone, setIsDragOverZone] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  async function fetchPhotos() {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from('build_photos')
      .select('*')
      .eq('build_id', buildId)
      .order('sort_order', { ascending: true })
    setLoading(false)
    if (fetchError) { setError("Couldn't load photos."); return }
    const loaded = (data ?? []) as BuildPhoto[]
    setPhotos(loaded)
    const captionMap: Record<string, string> = {}
    loaded.forEach(p => { captionMap[p.id] = p.caption ?? '' })
    setCaptions(captionMap)
  }

  useEffect(() => { fetchPhotos() }, [buildId]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasCoverPhoto = photos.some(p => p.is_cover)
  const uploadingCount = uploadItems.filter(u => u.status === 'uploading').length
  const atLimit = photos.length + uploadingCount >= MAX_PHOTOS
  const hasPhotos = photos.length > 0 || uploadItems.length > 0

  // ── Upload ────────────────────────────────────────────────────────

  async function handleFileSelect(files: FileList) {
    setUploadWarning('')
    setError('')
    const fileArray = Array.from(files)
    const available = MAX_PHOTOS - photos.length

    if (available <= 0) return

    let filesToUpload = fileArray
    if (fileArray.length > available) {
      filesToUpload = fileArray.slice(0, available)
      setUploadWarning(
        `Only ${available} photo${available !== 1 ? 's were' : ' was'} uploaded — you've reached the 20 photo limit.`
      )
    }

    const valid: File[] = []
    for (const file of filesToUpload) {
      if (file.size > 50 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 50 MB size limit and was skipped.`)
      } else {
        valid.push(file)
      }
    }

    let currentLength = photos.length
    let hasCover = photos.some(p => p.is_cover)

    for (const file of valid) {
      const tempId = `tmp-${Date.now()}-${Math.random()}`
      setUploadItems(prev => [...prev, { tempId, filename: file.name, status: 'uploading', file }])

      const filePath = `${buildId}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`

      const { error: storageError } = await supabase.storage
        .from('build-media')
        .upload(filePath, file)

      if (storageError) {
        setUploadItems(prev => prev.map(u => u.tempId === tempId ? { ...u, status: 'error' } : u))
        continue
      }

      const { data: { publicUrl } } = supabase.storage.from('build-media').getPublicUrl(filePath)

      const setCoverPhoto = !hasCover

      const { data: inserted, error: insertError } = await supabase
        .from('build_photos')
        .insert({
          build_id: buildId,
          url: publicUrl,
          caption: null,
          is_cover: setCoverPhoto,
          sort_order: currentLength,
          media_type: 'photo',
        })
        .select('*')
        .single()

      if (insertError || !inserted) {
        setUploadItems(prev => prev.map(u => u.tempId === tempId ? { ...u, status: 'error' } : u))
        continue
      }

      if (setCoverPhoto) hasCover = true
      currentLength++

      const photo = inserted as BuildPhoto
      setPhotos(prev => [...prev, photo])
      setCaptions(prev => ({ ...prev, [photo.id]: photo.caption ?? '' }))
      setUploadItems(prev => prev.filter(u => u.tempId !== tempId))
    }
  }

  async function retryUpload(item: UploadItem) {
    setUploadItems(prev => prev.map(u => u.tempId === item.tempId ? { ...u, status: 'uploading' } : u))

    const filePath = `${buildId}/${Date.now()}-${item.file.name.replace(/\s+/g, '-')}`
    const hasCover = photos.some(p => p.is_cover)

    const { error: storageError } = await supabase.storage
      .from('build-media')
      .upload(filePath, item.file)

    if (storageError) {
      setUploadItems(prev => prev.map(u => u.tempId === item.tempId ? { ...u, status: 'error' } : u))
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('build-media').getPublicUrl(filePath)

    const { data: inserted, error: insertError } = await supabase
      .from('build_photos')
      .insert({
        build_id: buildId,
        url: publicUrl,
        caption: null,
        is_cover: !hasCover,
        sort_order: photos.length,
        media_type: 'photo',
      })
      .select('*')
      .single()

    if (insertError || !inserted) {
      setUploadItems(prev => prev.map(u => u.tempId === item.tempId ? { ...u, status: 'error' } : u))
      return
    }

    const photo = inserted as BuildPhoto
    setPhotos(prev => [...prev, photo])
    setCaptions(prev => ({ ...prev, [photo.id]: photo.caption ?? '' }))
    setUploadItems(prev => prev.filter(u => u.tempId !== item.tempId))
  }

  // ── Cover ─────────────────────────────────────────────────────────

  async function handleSetCover(photoId: string) {
    setPhotos(prev => prev.map(p => ({ ...p, is_cover: p.id === photoId })))

    await supabase
      .from('build_photos')
      .update({ is_cover: false })
      .eq('build_id', buildId)
      .eq('is_cover', true)

    await supabase
      .from('build_photos')
      .update({ is_cover: true })
      .eq('id', photoId)
  }

  // ── Caption ───────────────────────────────────────────────────────

  function handleCaptionChange(photoId: string, value: string) {
    setCaptions(prev => ({ ...prev, [photoId]: value }))
  }

  async function handleCaptionBlur(photoId: string) {
    const caption = captions[photoId] ?? ''
    await supabase
      .from('build_photos')
      .update({ caption: caption || null })
      .eq('id', photoId)
  }

  // ── Delete ────────────────────────────────────────────────────────

  async function handleDelete(photo: BuildPhoto) {
    const remaining = photos.filter(p => p.id !== photo.id)
    setPhotos(remaining)
    setCaptions(prev => { const next = { ...prev }; delete next[photo.id]; return next })
    setDeletingId(null)

    const urlParts = photo.url.split('/build-media/')
    if (urlParts[1]) {
      await supabase.storage.from('build-media').remove([urlParts[1]])
    }
    await supabase.from('build_photos').delete().eq('id', photo.id)

    if (photo.is_cover && remaining.length > 0) {
      setPhotos(prev => prev.map((p, i) => ({ ...p, is_cover: i === 0 })))
      await supabase
        .from('build_photos')
        .update({ is_cover: true })
        .eq('id', remaining[0].id)
    }
  }

  // ── Drag reorder ──────────────────────────────────────────────────

  function handlePhotoDragStart(index: number) {
    setDraggedIndex(index)
  }

  function handlePhotoDragOver(e: React.DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  function handlePhotoDrop(e: React.DragEvent<HTMLDivElement>, dropIndex: number) {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }
    const reordered = [...photos]
    const [moved] = reordered.splice(draggedIndex, 1)
    reordered.splice(dropIndex, 0, moved)
    setPhotos(reordered)
    setDraggedIndex(null)
    setDragOverIndex(null)
    updateSortOrder(reordered)
  }

  function handlePhotoDragEnd() {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  async function updateSortOrder(reordered: BuildPhoto[]) {
    for (const [index, photo] of reordered.entries()) {
      await supabase.from('build_photos').update({ sort_order: index }).eq('id', photo.id)
    }
  }

  // ── Upload zone drag ──────────────────────────────────────────────

  function handleUploadZoneDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (e.dataTransfer.types.includes('Files')) setIsDragOverZone(true)
  }

  function handleUploadZoneDragLeave() {
    setIsDragOverZone(false)
  }

  function handleUploadZoneDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOverZone(false)
    if (isVerified || atLimit) return
    const files = e.dataTransfer.files
    if (files.length > 0) handleFileSelect(files)
  }

  // ── Render ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="aspect-[4/3] bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
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

      {uploadWarning && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-lg px-3.5 py-3">
          <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">{uploadWarning}</p>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-gray-500">{photos.length} of {MAX_PHOTOS} photos</span>
        {hasCoverPhoto
          ? <span className="text-green-600 font-medium">Cover photo set ✓</span>
          : <span className="text-gray-400">No cover photo set</span>
        }
        {atLimit && <span className="text-amber-600 text-xs font-medium">Photo limit reached (20 max)</span>}
      </div>

      {/* Empty state — full-width drop zone */}
      {!hasPhotos && !isVerified && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleUploadZoneDragOver}
          onDragLeave={handleUploadZoneDragLeave}
          onDrop={handleUploadZoneDrop}
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors py-14 ${
            isDragOverZone ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Upload size={24} className="text-gray-400" />
          <p className="text-sm text-gray-500">Drop photos here or click to upload</p>
        </div>
      )}

      {/* Photo grid */}
      {hasPhotos && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              draggable={!isVerified}
              onDragStart={() => handlePhotoDragStart(index)}
              onDragOver={e => handlePhotoDragOver(e, index)}
              onDrop={e => handlePhotoDrop(e, index)}
              onDragEnd={handlePhotoDragEnd}
              className={`rounded-lg border transition-all ${
                draggedIndex === index ? 'opacity-50' : 'opacity-100'
              } ${
                dragOverIndex === index && draggedIndex !== index
                  ? 'border-l-4 border-l-blue-400 border-gray-200'
                  : 'border-gray-200'
              }`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-gray-100">
                <Image
                  src={photo.url}
                  alt={photo.caption ?? ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                {/* Cover star */}
                <div className="absolute top-1.5 left-1.5">
                  {photo.is_cover ? (
                    <span className="p-1 rounded-full bg-black/30 flex items-center justify-center">
                      <Star size={13} fill="currentColor" className="text-yellow-400" />
                    </span>
                  ) : !isVerified ? (
                    <button
                      type="button"
                      onClick={() => handleSetCover(photo.id)}
                      title="Set as cover photo"
                      className="p-1 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors"
                    >
                      <Star size={13} className="text-white" />
                    </button>
                  ) : null}
                </div>
                {/* Drag handle */}
                {!isVerified && (
                  <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/20 cursor-grab">
                    <GripVertical size={13} className="text-white" />
                  </div>
                )}
              </div>
              <div className="px-2 pt-1.5 pb-2">
                <input
                  type="text"
                  value={captions[photo.id] ?? ''}
                  onChange={e => handleCaptionChange(photo.id, e.target.value)}
                  onBlur={() => handleCaptionBlur(photo.id)}
                  disabled={isVerified}
                  placeholder="Add a caption…"
                  className="text-xs text-gray-600 w-full border-0 border-b border-gray-200 focus:outline-none focus:border-gray-400 bg-transparent py-1 disabled:text-gray-400"
                />
                {!isVerified && (
                  <div className="mt-1.5 flex justify-end">
                    {deletingId === photo.id ? (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        Delete?{' '}
                        <button type="button" onClick={() => handleDelete(photo)} className="underline">Yes</button>
                        {' '}/{' '}
                        <button type="button" onClick={() => setDeletingId(null)} className="underline">Cancel</button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingId(photo.id)}
                        className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors"
                        aria-label="Delete photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Upload placeholder / error cards */}
          {uploadItems.map(item => (
            <div key={item.tempId} className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="aspect-[4/3] flex flex-col items-center justify-center gap-2 bg-gray-50 px-3">
                {item.status === 'uploading' ? (
                  <>
                    <Loader2 size={20} className="text-gray-400 animate-spin" />
                    <p className="text-xs text-gray-400 text-center truncate w-full">{item.filename}</p>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => retryUpload(item)}
                    className="flex flex-col items-center gap-1 text-center w-full"
                  >
                    <AlertCircle size={18} className="text-red-400" />
                    <p className="text-xs text-red-500 truncate w-full">{item.filename}</p>
                    <p className="text-xs text-red-400">Upload failed — click to retry</p>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* "Add more photos" upload zone */}
      {hasPhotos && !isVerified && !atLimit && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleUploadZoneDragOver}
          onDragLeave={handleUploadZoneDragLeave}
          onDrop={handleUploadZoneDrop}
          className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl cursor-pointer transition-colors py-5 ${
            isDragOverZone ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Upload size={16} className="text-gray-400" />
          <p className="text-sm text-gray-500">Add more photos</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          if (e.target.files?.length) {
            handleFileSelect(e.target.files)
            e.target.value = ''
          }
        }}
      />
    </div>
  )
}
