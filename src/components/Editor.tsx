import React, { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { Facepile } from '@/components/Facepile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Globe, Lock, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Editor: React.FC = () => {
  const {
    getCurrentDocument,
    updateDocumentContent,
    updateDocument,
    currentDocumentId,
  } = useEditorStore()

  const document = getCurrentDocument()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (document) {
      setContent(document.content)
      setTitle(document.title)
      setIsPublic(document.isPublic)
    } else {
      setContent('')
      setTitle('')
      setIsPublic(false)
    }
  }, [document])

  const handleContentChange = () => {
    if (contentRef.current && currentDocumentId) {
      const newContent = contentRef.current.innerText || ''
      setContent(newContent)
      
      // Simulate auto-save with debouncing
      setIsSaving(true)
      setTimeout(() => {
        updateDocumentContent(currentDocumentId, newContent)
        setIsSaving(false)
      }, 500)
    }
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (currentDocumentId && newTitle.trim()) {
      updateDocument(currentDocumentId, { title: newTitle.trim() })
    }
  }

  const handleVisibilityChange = (newIsPublic: boolean) => {
    setIsPublic(newIsPublic)
    if (currentDocumentId) {
      updateDocument(currentDocumentId, { isPublic: newIsPublic })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle basic formatting
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      document.execCommand('insertLineBreak')
    }
  }

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-editor-text mb-2">
            No document selected
          </h2>
          <p className="text-editor-muted">
            Choose a document from the sidebar or create a new one
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-editor-background">
      {/* Header */}
      <div className="border-b border-editor-border bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-8">
              <Input
                ref={titleRef}
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-xl font-semibold border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Untitled document"
              />
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "p-1.5 rounded-md",
                  isPublic ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                )}>
                  {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={handleVisibilityChange}
                />
                <Label className="text-sm">
                  {isPublic ? 'Public' : 'Private'}
                </Label>
              </div>
              
              <Facepile />
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {isSaving ? (
                  <>
                    <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    <span>Saved</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="relative">
            <div
              ref={contentRef}
              className={cn(
                "editor-content min-h-[500px] outline-none",
                "prose prose-lg max-w-none",
                !content && "relative"
              )}
              contentEditable
              suppressContentEditableWarning
              onInput={handleContentChange}
              onKeyDown={handleKeyDown}
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
            />
            
            {!content && (
              <div className="editor-placeholder absolute top-0 left-0">
                Start writing your document...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}