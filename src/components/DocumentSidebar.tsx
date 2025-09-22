import React, { useState } from 'react'
import { Search, Plus, FileText, Lock, Globe, MoreHorizontal, Trash2 } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface NewDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NewDocumentDialog: React.FC<NewDocumentDialogProps> = ({ open, onOpenChange }) => {
  const [title, setTitle] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const createDocument = useEditorStore((state) => state.createDocument)

  const handleCreate = () => {
    if (title.trim()) {
      createDocument(title.trim(), isPublic)
      setTitle('')
      setIsPublic(false)
      onOpenChange(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              placeholder="Enter document title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public" className="text-sm">
              Make this document public
            </Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim()}>
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const DocumentSidebar: React.FC = () => {
  const [showNewDocDialog, setShowNewDocDialog] = useState(false)
  
  const {
    searchQuery,
    setSearchQuery,
    getFilteredDocuments,
    currentDocumentId,
    setCurrentDocument,
    deleteDocument,
    updateDocument,
  } = useEditorStore()

  const documents = getFilteredDocuments()

  const handleDocumentClick = (documentId: string) => {
    setCurrentDocument(documentId)
  }

  const handleDeleteDocument = (documentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteDocument(documentId)
  }

  const toggleDocumentVisibility = (documentId: string, currentIsPublic: boolean, e: React.MouseEvent) => {
    e.stopPropagation()
    updateDocument(documentId, { isPublic: !currentIsPublic })
  }

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-sidebar-foreground">Documents</h1>
          <Dialog open={showNewDocDialog} onOpenChange={setShowNewDocDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <NewDocumentDialog 
              open={showNewDocDialog} 
              onOpenChange={setShowNewDocDialog} 
            />
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-sidebar-accent/50 border-sidebar-border"
          />
        </div>
      </div>

      {/* Document List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-sidebar-foreground/60">
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </div>
          ) : (
            <div className="space-y-1">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className={cn(
                    "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                    "hover:bg-sidebar-accent",
                    currentDocumentId === document.id && "bg-sidebar-accent border border-sidebar-border"
                  )}
                  onClick={() => handleDocumentClick(document.id)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={cn(
                      "p-1.5 rounded-md",
                      document.isPublic ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {document.isPublic ? (
                        <Globe className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sidebar-foreground truncate">
                        {document.title}
                      </h3>
                      <p className="text-xs text-sidebar-foreground/60">
                        {document.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => toggleDocumentVisibility(document.id, document.isPublic, e)}
                      >
                        {document.isPublic ? (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Make Private
                          </>
                        ) : (
                          <>
                            <Globe className="mr-2 h-4 w-4" />
                            Make Public
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteDocument(document.id, e)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}