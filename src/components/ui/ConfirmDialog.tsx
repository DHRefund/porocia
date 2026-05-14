"use client"

import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'primary'
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "削除する",
  cancelText = "キャンセル",
  variant = 'destructive'
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop - Đậm hơn một chút để tập trung vào cảnh báo */}
      <div 
        className="absolute inset-0 bg-near-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm overflow-hidden bg-background rounded-[32px] border border-cream shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          {/* Icon Cảnh báo */}
          <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-terracotta/10 text-terracotta'}`}>
            <AlertTriangle size={28} />
          </div>

          <h3 className="mb-2 font-heading text-xl font-bold text-near-black">
            {title}
          </h3>
          <p className="text-sm text-stone leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex border-t border-cream">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-4 text-sm font-bold text-stone hover:bg-cream transition-colors border-r border-cream"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 px-6 py-4 text-sm font-bold transition-colors hover:opacity-90 active:scale-95 ${variant === 'destructive' ? 'text-destructive' : 'text-terracotta'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
