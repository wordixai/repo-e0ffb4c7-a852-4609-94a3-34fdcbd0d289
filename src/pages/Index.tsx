import React from 'react'
import { DocumentSidebar } from '@/components/DocumentSidebar'
import { Editor } from '@/components/Editor'

const Index = () => {
  return (
    <div className="h-screen flex bg-background">
      <DocumentSidebar />
      <Editor />
    </div>
  )
}

export default Index