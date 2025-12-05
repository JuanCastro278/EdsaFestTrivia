
export type Question = {
  id: string;
  text: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  timer: number;
  points: number;
};

export type Trivia = {
  id: string;
  name: string;
  questions: Question[];
};

export type UserAnswers = {
    [triviaId: string]: {
        [questionId: string]: boolean;
    };
};

export type User = {
    id?: string; // Firestore document ID
    legajo: string;
    username: string;
    password?: string;
    role: 'user' | 'admin';
    userType: 'empleado' | 'invitado';
    score: number;
    seniorityScore?: number;
    peladoScore?: number;
    raffleScore?: number;
    lastLogin: string | null;
    completedTrivias?: string[];
    answers?: UserAnswers;
    raffleNumber?: number | null;
};

export type Player = {
    id?: string;
    username: string;
    score: number;
    answers?: UserAnswers;
    previousScore?: number;
    completedTrivias?: string[];
    raffleNumber?: number | null;
};

export type Prize = {
    id: string;
    src: string;
    alt: string;
    description: string;
    cost: number;
    productUrl?: string;
    'data-ai-hint'?: string;
    type?: string;
}

export type GlobalConfig = {
    activeTriviaIds: string[];
    raffleEnabled: boolean;
    prizeUrlsEnabled: boolean;
    triviaPointsLimit: number | null;
}
