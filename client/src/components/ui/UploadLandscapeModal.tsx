import React, { useState, useRef } from 'react';
import { X, Upload, Image } from 'lucide-react';

interface UploadLandscapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: LandscapeUploadData) => void;
}

export interface LandscapeUploadData {
  title: string;
  image: File;
  description?: string;
  isAiEnhanced: boolean;
}

export default function UploadLandscapeModal({
  isOpen,
  onClose,
  onUpload
}: UploadLandscapeModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAiEnhanced, setIsAiEnhanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview the selected image
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
    
    setSelectedFile(file);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !selectedFile) return;
    
    setIsSubmitting(true);
    
    // Prepare upload data
    const uploadData: LandscapeUploadData = {
      title,
      image: selectedFile,
      description: description.trim() || undefined,
      isAiEnhanced
    };
    
    // Submit the form
    onUpload(uploadData);
    
    // Reset form
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsAiEnhanced(false);
    setIsSubmitting(false);
    
    // Close modal
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">Upload New Landscape</h2>
          <button 
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal__content">
          {/* Image upload */}
          <div className="form-group">
            <label className="form-label">Landscape Image</label>
            
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 btn-icon bg-black/50"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div 
                className="form-file w-full cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="form-file__input"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label className="form-file__label w-full h-48 flex flex-col items-center justify-center">
                  <Image className="h-8 w-8 mb-2 text-gray-400" />
                  <span className="text-sm">Click to upload image</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG, or WEBP (Max 5MB)</span>
                </label>
              </div>
            )}
          </div>
          
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              id="title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter landscape title"
              required
            />
          </div>
          
          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description (optional)</label>
            <textarea
              id="description"
              className="form-input min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter landscape description"
            />
          </div>
          
          {/* AI Enhancement Toggle */}
          <div className="animation-toggle">
            <span className="animation-toggle__label">Enable AI Enhancement</span>
            <label className="toggle ml-auto">
              <input
                type="checkbox"
                className="toggle__input"
                checked={isAiEnhanced}
                onChange={(e) => setIsAiEnhanced(e.target.checked)}
              />
              <span className="toggle__slider"></span>
            </label>
          </div>
          
          {/* Submit button */}
          <div className="modal__footer mt-lg">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!title || !selectedFile || isSubmitting}
            >
              <Upload className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Uploading...' : 'Upload Landscape'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}