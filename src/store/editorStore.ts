import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { EditorStore, Document, User, Presence, DocumentState } from '@/types/editor'

const PRESENCE_COLORS = [
  'hsl(var(--presence-1))',
  'hsl(var(--presence-2))',
  'hsl(var(--presence-3))',
  'hsl(var(--presence-4))',
  'hsl(var(--presence-5))',
]

// Generate mock users for collaboration demo
const generateMockUsers = (): User[] => [
  { id: 'user-1', name: 'Alice Smith', color: PRESENCE_COLORS[0] },
  { id: 'user-2', name: 'Bob Johnson', color: PRESENCE_COLORS[1] },
  { id: 'user-3', name: 'Carol Williams', color: PRESENCE_COLORS[2] },
  { id: 'user-4', name: 'David Brown', color: PRESENCE_COLORS[3] },
]

const mockUsers = generateMockUsers()

// Create initial documents
const createInitialDocuments = (currentUserId: string): Document[] => [
  {
    id: uuidv4(),
    title: 'Welcome to Your Collaborative Editor',
    content: `# Welcome to Your Collaborative Editor

This is a powerful, Notion-like collaborative text editor where you can:

## Features
- **Real-time collaboration** - See other users editing in real-time
- **Document management** - Create private and public documents
- **Search functionality** - Find documents quickly
- **Clean interface** - Minimal, distraction-free design

## Getting Started
1. Create new documents using the sidebar
2. Toggle between private and public visibility
3. Search through your documents
4. Collaborate with others in real-time

Start typing here to see the editor in action...`,
    isPublic: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    createdBy: currentUserId,
  },
  {
    id: uuidv4(),
    title: 'Project Planning',
    content: `# Project Planning

## Objectives
- Define project scope
- Identify key milestones
- Allocate resources

## Timeline
- Week 1: Research and planning
- Week 2: Implementation
- Week 3: Testing and refinement

## Team
- Project Manager
- Developers
- Designers`,
    isPublic: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date(),
    createdBy: currentUserId,
  },
  {
    id: uuidv4(),
    title: 'Meeting Notes',
    content: `# Team Meeting - January 15, 2024

## Attendees
- John Doe
- Jane Smith
- Mike Wilson

## Agenda
1. Review progress
2. Discuss challenges
3. Plan next steps

## Action Items
- [ ] Complete user research
- [ ] Design mockups
- [ ] Set up development environment`,
    isPublic: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date(),
    createdBy: currentUserId,
  },
]

export const useEditorStore = create<EditorStore>((set, get) => {
  const currentUser: User = {
    id: 'current-user',
    name: 'You',
    color: PRESENCE_COLORS[4],
  }

  const initialDocuments = createInitialDocuments(currentUser.id)
  
  return {
    documents: initialDocuments,
    currentDocumentId: initialDocuments[0]?.id || null,
    documentStates: {},
    currentUser,
    searchQuery: '',

    createDocument: (title: string, isPublic = false) => {
      const newDocument: Document = {
        id: uuidv4(),
        title,
        content: '',
        isPublic,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: currentUser.id,
      }

      set((state) => ({
        documents: [newDocument, ...state.documents],
        currentDocumentId: newDocument.id,
      }))

      return newDocument
    },

    deleteDocument: (id: string) => {
      set((state) => ({
        documents: state.documents.filter(doc => doc.id !== id),
        currentDocumentId: state.currentDocumentId === id ? 
          (state.documents.find(doc => doc.id !== id)?.id || null) : 
          state.currentDocumentId,
        documentStates: Object.fromEntries(
          Object.entries(state.documentStates).filter(([key]) => key !== id)
        ),
      }))
    },

    updateDocument: (id: string, updates: Partial<Document>) => {
      set((state) => ({
        documents: state.documents.map(doc =>
          doc.id === id 
            ? { ...doc, ...updates, updatedAt: new Date() }
            : doc
        ),
      }))
    },

    setCurrentDocument: (id: string) => {
      set({ currentDocumentId: id })
      
      // Simulate adding random presence for collaboration demo
      setTimeout(() => {
        const randomUsers = mockUsers.slice(0, Math.floor(Math.random() * 3) + 1)
        randomUsers.forEach(user => {
          get().addPresence(id, {
            userId: user.id,
            user,
            lastSeen: new Date(),
          })
        })
      }, 500)
    },

    updateDocumentContent: (id: string, content: string) => {
      get().updateDocument(id, { content })
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query })
    },

    updatePresence: (documentId: string, presenceUpdate: Partial<Presence>) => {
      set((state) => {
        const currentState = state.documentStates[documentId] || {
          document: null,
          presence: [],
          isLoading: false,
          error: null,
        }

        const updatedPresence = currentState.presence.map(p =>
          p.userId === presenceUpdate.userId
            ? { ...p, ...presenceUpdate, lastSeen: new Date() }
            : p
        )

        return {
          documentStates: {
            ...state.documentStates,
            [documentId]: {
              ...currentState,
              presence: updatedPresence,
            },
          },
        }
      })
    },

    addPresence: (documentId: string, presence: Presence) => {
      set((state) => {
        const currentState = state.documentStates[documentId] || {
          document: null,
          presence: [],
          isLoading: false,
          error: null,
        }

        const existingPresence = currentState.presence.find(p => p.userId === presence.userId)
        if (existingPresence) {
          return state // User already present
        }

        return {
          documentStates: {
            ...state.documentStates,
            [documentId]: {
              ...currentState,
              presence: [...currentState.presence, presence],
            },
          },
        }
      })
    },

    removePresence: (documentId: string, userId: string) => {
      set((state) => {
        const currentState = state.documentStates[documentId]
        if (!currentState) return state

        return {
          documentStates: {
            ...state.documentStates,
            [documentId]: {
              ...currentState,
              presence: currentState.presence.filter(p => p.userId !== userId),
            },
          },
        }
      })
    },

    getFilteredDocuments: () => {
      const { documents, searchQuery } = get()
      if (!searchQuery.trim()) return documents

      const query = searchQuery.toLowerCase()
      return documents.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query)
      )
    },

    getCurrentDocument: () => {
      const { documents, currentDocumentId } = get()
      return documents.find(doc => doc.id === currentDocumentId) || null
    },

    getCurrentPresence: () => {
      const { documentStates, currentDocumentId } = get()
      if (!currentDocumentId) return []
      
      const state = documentStates[currentDocumentId]
      return state?.presence || []
    },
  }
})