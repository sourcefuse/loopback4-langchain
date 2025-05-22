import {Entity} from '@loopback/repository'

// Mock entity type for testing
export class MockEntity implements Entity {
  id!: string

  content!: string

  embedding!: number[]

  metadata?: Record<string, any>

  constructor(data: Partial<MockEntity>) {
    Object.assign(this, data)
  }

  // Implement Entity interface methods
  getId() {
    return this.id
  }

  getIdObject() {
    return {id: this.id}
  }

  toJSON() {
    return {
      id: this.id,
      content: this.content,
      embedding: this.embedding,
      metadata: this.metadata,
    }
  }

  toObject() {
    return this.toJSON()
  }
}
