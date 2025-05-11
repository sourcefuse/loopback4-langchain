import {Document} from '@langchain/core/documents';

/**
 * FaqRetriever class for retrieving answers from a FAQ knowledge base.
 *
 * This is a stub implementation that can be extended to provide actual FAQ retrieval
 * functionality. It provides a simple implementation for retrieving FAQ documents.
 */
export class FaqRetriever {
  /**
   * Constructor for the FaqRetriever
   *
   * @param faqs - Optional initial set of FAQs as {question, answer} pairs
   */
  constructor(private faqs: Array<{question: string; answer: string}> = []) {}

  /**
   * Add a new FAQ to the retriever
   *
   * @param question - The FAQ question
   * @param answer - The FAQ answer
   */
  addFaq(question: string, answer: string): void {
    this.faqs.push({question, answer});
  }

  /**
   * Get relevant documents based on a query.
   * This stub implementation simply returns all FAQs that contain the query string
   * in the question (case-insensitive).
   *
   * @param query - The query string to search for
   * @returns A promise that resolves to an array of Document objects
   */
  async getRelevantDocuments(query: string): Promise<Document[]> {
    // Simple implementation: return FAQs where the question contains the query string
    const normalizedQuery = query.toLowerCase();
    const relevantFaqs = this.faqs.filter(faq =>
      faq.question.toLowerCase().includes(normalizedQuery),
    );

    // Convert FAQs to Documents
    return relevantFaqs.map(
      faq =>
        new Document({
          pageContent: faq.answer,
          metadata: {
            question: faq.question,
            source: 'faq',
          },
        }),
    );
  }
}
