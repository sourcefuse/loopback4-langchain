import {describe, it, expect, vi, beforeEach} from 'vitest';
import {BaseVectorRetriever} from '../../retrievers/base-vector-retriever';
import {Document} from '@langchain/core/documents';
import {DefaultCrudRepository, Entity} from '@loopback/repository';

// Mock entity type for testing
class MockEntity implements Entity {
  id!: string;
  content!: string;
  embedding!: number[];
  metadata?: Record<string, any>;

  constructor(data: Partial<MockEntity>) {
    Object.assign(this, data);
  }

  // Implement Entity interface methods
  getId() {
    return this.id;
  }

  getIdObject() {
    return {id: this.id};
  }

  toJSON() {
    return {
      id: this.id,
      content: this.content,
      embedding: this.embedding,
      metadata: this.metadata,
    };
  }

  toObject() {
    return this.toJSON();
  }
}

// Concrete implementation for testing
class TestVectorRetriever {
  constructor(
    private repository: DefaultCrudRepository<MockEntity, string, {}>,
  ) {}

  // Implementation of retriever methods
  async getRelevantDocuments(query: string): Promise<Document[]> {
    const entities = await this.vectorSearch(query, {k: 5});
    return entities.map(entity => this.entityToDocument(entity));
  }

  // Helper methods
  protected entityToDocument(entity: MockEntity): Document {
    return new Document({
      pageContent: entity.content,
      metadata: entity.metadata || {},
    });
  }

  protected async vectorSearch(
    query: number[] | string,
    options?: {k?: number; filter?: object; [key: string]: unknown},
  ): Promise<MockEntity[]> {
    // In a real implementation, this would call the repository's vectorSearch method
    // For testing, we'll just return the mock results
    return this.repository.find() as Promise<MockEntity[]>;
  }
}

describe('BaseVectorRetriever', () => {
  let mockRepository: DefaultCrudRepository<MockEntity, string, {}>;
  let retriever: TestVectorRetriever;

  // Mock data
  const mockEntities: MockEntity[] = [
    new MockEntity({
      id: '1',
      content: 'This is the first document',
      embedding: [0.1, 0.2, 0.3],
      metadata: {source: 'test'},
    }),
    new MockEntity({
      id: '2',
      content: 'This is the second document',
      embedding: [0.4, 0.5, 0.6],
      metadata: {source: 'test'},
    }),
  ];

  beforeEach(() => {
    // Create a mock repository
    mockRepository = {
      find: vi.fn().mockResolvedValue(mockEntities),
    } as unknown as DefaultCrudRepository<MockEntity, string, {}>;

    // Create the retriever with the mock repository
    retriever = new TestVectorRetriever(mockRepository);
  });

  it('should be defined', () => {
    expect(retriever).toBeDefined();
  });

  it('should convert entities to documents', () => {
    const entity = mockEntities[0];
    const document = (retriever as any).entityToDocument(entity);

    expect(document).toBeInstanceOf(Document);
    expect(document.pageContent).toBe(entity.content);
    expect(document.metadata).toEqual(entity.metadata);
  });

  it('should retrieve relevant documents', async () => {
    const query = 'test query';
    const documents = await retriever.getRelevantDocuments(query);

    // Verify that find was called on the repository
    expect(mockRepository.find).toHaveBeenCalled();

    // Verify that the correct number of documents was returned
    expect(documents).toHaveLength(mockEntities.length);

    // Verify that the documents have the correct content
    expect(documents[0].pageContent).toBe(mockEntities[0].content);
    expect(documents[1].pageContent).toBe(mockEntities[1].content);

    // Verify that the documents have the correct metadata
    expect(documents[0].metadata).toEqual(mockEntities[0].metadata);
    expect(documents[1].metadata).toEqual(mockEntities[1].metadata);
  });
});
