export interface Document {
  id: string
  title: string
  content: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface User {
  id: string
  name: string
  avatar?: string
  color: string
}

export interface Presence {
  userId: string
  user: User
  cursor?: {
    x: number
    y: number
  }
  selection?: {
    start: number
    end: number
  }
  lastSeen: Date
}

export interface DocumentState {
  document: Document | null
  presence: Presence[]
  isLoading: boolean
  error: string | null
}

export interface EditorStore {
  documents: Document[]
  currentDocumentId: string | null
  documentStates: Record<string, DocumentState>
  currentUser: User
  searchQuery: string
  
  // Actions
  createDocument: (title: string, isPublic?: boolean) => Document
  deleteDocument: (id: string) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  setCurrentDocument: (id: string) => void
  updateDocumentContent: (id: string, content: string) => void
  setSearchQuery: (query: string) => void
  
  // Collaboration
  updatePresence: (documentId: string, presence: Partial<Presence>) => void
  addPresence: (documentId: string, presence: Presence) => void
  removePresence: (documentId: string, userId: string) => void
  
  // Computed
  getFilteredDocuments: () => Document[]
  getCurrentDocument: () => Document | null
  getCurrentPresence: () => Presence[]
}