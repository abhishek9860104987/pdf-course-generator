import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, FileText, X } from 'lucide-react'
import Button from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import Navigation from '../components/Navigation'
import { courseService } from '../services/courseService'
import toast from 'react-hot-toast'

function CourseUploadPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf'
    )
    setFiles((prev) => [...prev, ...droppedFiles])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(
      (file) => file.type === 'application/pdf'
    )
    setFiles((prev) => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one PDF file')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const pdf = await courseService.uploadPDF(files[i])
        setUploadProgress(((i + 1) / files.length) * 100)
        
        // Auto-generate course after upload
        await courseService.generateCourse(pdf.id)
      }

      toast.success('Courses generated successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Upload PDF</h1>
          <p className="text-muted-foreground">Transform your PDF into an interactive course</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Upload PDF Files</CardTitle>
            <CardDescription>
              Drag and drop your PDF files here or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('file-input')?.click()}
              whileHover={{ scale: 1.02 }}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Drop your PDF files here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </motion.div>

            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-2"
              >
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-accent rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                      className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {uploading && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              className="w-full mt-6"
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              loading={uploading}
            >
              {uploading ? 'Processing...' : 'Generate Course'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default CourseUploadPage
