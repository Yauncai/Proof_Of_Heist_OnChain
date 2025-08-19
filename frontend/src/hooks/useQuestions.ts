import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'multiple' | 'boolean';
}

function sampleRandom<T>(items: T[], count: number): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.slice(0, Math.min(count, array.length));
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    question:
      "Which NFT marketplace was exploited in February 2022, allowing users to purchase high-value NFTs at outdated prices?",
    options: ["OpenSea", "LooksRare", "Foundation", "SuperRare"],
    correctAnswer: 0,
    type: 'multiple'
  },
  {
    id: 2,
    question:
      'The Bored Ape Yacht Club Instagram hack in 2022 resulted in the theft of NFTs worth approximately how much?',
    options: ["$1 million", "$3 million", "$500,000", "$2 million"],
    correctAnswer: 1,
    type: 'multiple'
  },
  {
    id: 3,
    question: 'Phishing attacks are the most common method used to steal NFTs from users.',
    options: ["True", "False"],
    correctAnswer: 0,
    type: 'boolean'
  },
  {
    id: 4,
    question: 'Which blockchain has reported the highest number of NFT thefts?',
    options: ["Ethereum", "Solana", "Polygon", "Binance Smart Chain"],
    correctAnswer: 0,
    type: 'multiple'
  },
  {
    id: 5,
    question: "The 'Premint' platform hack in 2022 was caused by a smart contract vulnerability.",
    options: ["True", "False"],
    correctAnswer: 1,
    type: 'boolean'
  }
];

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'firestore' | 'sample'>('sample');

  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      if (!db) {
        if (isMounted) {
          setQuestions(sampleRandom(sampleQuestions, 16));
          setSource('sample');
          setLoading(false);
        }
        return;
      }

      try {
        const q = query(collection(db, 'quizQuestions'));
        const snapshot = await getDocs(q);
        const fetched: Question[] = snapshot.docs
          .map((doc: any, index: number) => {
            const data: any = doc.data();
            const options: string[] = Array.isArray(data.options) ? data.options.map(String) : [];
            const answerText: string | undefined = data.answer ? String(data.answer) : undefined;
            let correctAnswerIndex = 0;
            if (answerText && options.length > 0) {
              const foundIndex = options.findIndex((opt) => opt === answerText);
              correctAnswerIndex = foundIndex >= 0 ? foundIndex : 0;
            }
            return {
              id: Number(data.id ?? index + 1),
              question: String(data.question ?? ''),
              options,
              correctAnswer: Number(data.correctAnswer ?? correctAnswerIndex),
              type: 'multiple'
            } as Question;
          })
          .filter((q: Question) => q.question && q.options.length > 0);

        if (isMounted) {
          if (fetched.length > 0) {
            setQuestions(sampleRandom(fetched, 16));
            setSource('firestore');
          } else {
            setQuestions(sampleRandom(sampleQuestions, 16));
            setSource('sample');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message ?? 'Failed to load questions');
          setQuestions(sampleRandom(sampleQuestions, 16));
          setSource('sample');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadQuestions();
    return () => {
      isMounted = false;
    };
  }, []);

  return { questions, loading, error, source };
}


