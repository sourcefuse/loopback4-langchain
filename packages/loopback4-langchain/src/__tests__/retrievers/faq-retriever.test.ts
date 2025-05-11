import {describe, it, expect, beforeEach} from 'vitest'
import {Document} from '@langchain/core/documents'
import {FaqRetriever} from '../../retrievers/faq-retriever'

describe('FaqRetriever', () => {
  let retriever: FaqRetriever

  // Sample FAQs for testing
  const sampleFaqs = [
    {
      question: 'What is LangChain?',
      answer:
        'LangChain is a framework for developing applications powered by language models.',
    },
    {
      question: 'How do I install LangChain?',
      answer: 'You can install LangChain using npm: npm install langchain',
    },
    {
      question: 'What is LoopBack?',
      answer:
        'LoopBack is a highly extensible Node.js and TypeScript framework for building APIs and microservices.',
    },
  ]

  beforeEach(() => {
    // Create a new retriever with sample FAQs for each test
    retriever = new FaqRetriever(sampleFaqs)
  })

  it('should be defined', () => {
    expect(retriever).toBeDefined()
  })

  it('should initialize with provided FAQs', () => {
    // Test that the retriever was initialized with the sample FAQs
    // by checking if it returns the correct documents for a query
    const query = 'LangChain'
    return retriever.getRelevantDocuments(query).then(docs => {
      expect(docs).toHaveLength(2) // Should match the first two FAQs
      expect(docs[0].pageContent).toBe(sampleFaqs[0].answer)
      expect(docs[1].pageContent).toBe(sampleFaqs[1].answer)
    })
  })

  it('should add new FAQs', () => {
    // Add a new FAQ
    const newQuestion = 'What is a retriever?'
    const newAnswer =
      'A retriever is a component that fetches relevant documents from a data source.'
    retriever.addFaq(newQuestion, newAnswer)

    // Check if the new FAQ is retrievable
    const query = 'retriever'
    return retriever.getRelevantDocuments(query).then(docs => {
      expect(docs).toHaveLength(1)
      expect(docs[0].pageContent).toBe(newAnswer)
      expect(docs[0].metadata.question).toBe(newQuestion)
    })
  })

  it('should return empty array for no matches', () => {
    const query = 'something that does not exist'
    return retriever.getRelevantDocuments(query).then(docs => {
      expect(docs).toHaveLength(0)
    })
  })

  it('should be case-insensitive', () => {
    const query = 'langchain' // lowercase
    return retriever.getRelevantDocuments(query).then(docs => {
      expect(docs).toHaveLength(2) // Should still match the first two FAQs
    })
  })

  it('should include metadata with the question', () => {
    const query = 'LangChain'
    return retriever.getRelevantDocuments(query).then(docs => {
      expect(docs[0]).toBeInstanceOf(Document)
      expect(docs[0].metadata).toHaveProperty(
        'question',
        sampleFaqs[0].question,
      )
      expect(docs[0].metadata).toHaveProperty('source', 'faq')
    })
  })
})
