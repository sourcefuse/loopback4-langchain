import {BaseRetriever} from '@langchain/core/retrievers';
import {Document} from '@langchain/core/documents';
import {DefaultCrudRepository, Entity} from '@loopback/repository';

/**
 * Base VectorRetriever abstract class that wraps any LoopBack Repository with vectorSearch.
 *
 * This class extends the LangChain BaseRetriever and provides a way to use LoopBack
 * repositories as vector stores for retrieval operations. It handles the conversion
 * between LoopBack repository entities and LangChain Document objects.
 *
 * @typeParam T - The entity type of the repository
 * @typeParam ID - The ID type of the entity
 */
export abstract class BaseVectorRetriever<
  T extends Entity,
  ID,
> extends BaseRetriever {
  /**
   * Constructor for the BaseVectorRetriever
   *
   * @param repository - The LoopBack repository to use for vector search
   */
  constructor(protected repository: DefaultCrudRepository<T, ID, {}>) {
    super();
  }

  /**
   * The getRelevantDocuments method that must be implemented by subclasses.
   * This method performs a vector search on the repository and returns the results
   * as LangChain Document objects.
   *
   * @param query - The query string to search for
   * @returns A promise that resolves to an array of Document objects
   */
  abstract getRelevantDocuments(query: string): Promise<Document[]>;

  /**
   * Convert a repository entity to a LangChain Document
   *
   * @param entity - The entity to convert
   * @returns A Document object
   */
  protected abstract entityToDocument(entity: T): Document;

  /**
   * Perform a vector search on the repository
   *
   * @param query - The query vector or string
   * @param options - Options for the vector search
   * @returns A promise that resolves to an array of entities
   */
  protected abstract vectorSearch(
    query: number[] | string,
    options?: {
      k?: number;
      filter?: object;
      [key: string]: unknown;
    },
  ): Promise<T[]>;
}
