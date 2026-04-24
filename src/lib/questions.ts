export type GameFormat = "quiz" | "truefalse" | "flashcard" | "fillblank" | "matching";

export interface QuizQuestion {
  format: "quiz";
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface TrueFalseQuestion {
  format: "truefalse";
  question: string;
  correct: boolean;
  explanation?: string;
}

export interface FlashcardQuestion {
  format: "flashcard";
  front: string;
  back: string;
}

export interface FillBlankQuestion {
  format: "fillblank";
  sentence: string;
  answer: string;
  hint?: string;
  explanation?: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface MatchingQuestion {
  format: "matching";
  pairs: MatchingPair[];
}

export type Question = QuizQuestion | TrueFalseQuestion | FlashcardQuestion | FillBlankQuestion | MatchingQuestion;

const quizQuestions: QuizQuestion[] = [
  {
    format: "quiz",
    question: "Какой газ составляет бо́льшую часть атмосферы Земли?",
    options: ["Кислород", "Азот", "Углекислый газ", "Аргон"],
    correct: 1,
  },
  {
    format: "quiz",
    question: "Сколько планет в Солнечной системе?",
    options: ["7", "8", "9", "10"],
    correct: 1,
  },
  {
    format: "quiz",
    question: "Кто написал «Войну и мир»?",
    options: ["Достоевский", "Пушкин", "Чехов", "Толстой"],
    correct: 3,
  },
  {
    format: "quiz",
    question: "Чему равна сумма углов треугольника?",
    options: ["90°", "180°", "270°", "360°"],
    correct: 1,
  },
  {
    format: "quiz",
    question: "В каком году произошла Октябрьская революция в России?",
    options: ["1905", "1914", "1917", "1921"],
    correct: 2,
  },
];

const trueFalseQuestions: TrueFalseQuestion[] = [
  {
    format: "truefalse",
    question: "Австралия — одновременно страна и континент.",
    correct: true,
  },
  {
    format: "truefalse",
    question: "Молния никогда не бьёт дважды в одно место.",
    correct: false,
  },
  {
    format: "truefalse",
    question: "Скорость света в вакууме составляет около 300 000 км/с.",
    correct: true,
  },
  {
    format: "truefalse",
    question: "ДНК расшифровывается как «дезоксирибонуклеиновая кислота».",
    correct: true,
  },
  {
    format: "truefalse",
    question: "Великая Китайская стена видна из космоса невооружённым глазом.",
    correct: false,
  },
];

const flashcardQuestions: FlashcardQuestion[] = [
  { format: "flashcard", front: "Фотосинтез", back: "Процесс, при котором растения преобразуют солнечный свет в питательные вещества с помощью хлорофилла" },
  { format: "flashcard", front: "Митоз", back: "Тип деления клеток, при котором образуются две генетически идентичные дочерние клетки" },
  { format: "flashcard", front: "Пифагор", back: "Древнегреческий математик, автор теоремы: a² + b² = c²" },
  { format: "flashcard", front: "Осмос", back: "Движение воды через полупроницаемую мембрану из области с низкой концентрацией в область с высокой концентрацией" },
  { format: "flashcard", front: "Метафора", back: "Литературный приём: перенос свойств одного явления на другое на основе сходства" },
];

const banks: Record<GameFormat, Question[]> = {
  quiz: quizQuestions,
  truefalse: trueFalseQuestions,
  flashcard: flashcardQuestions,
  fillblank: [],
  matching: [],
};

export function getQuestion(format: GameFormat, index: number): Question | null {
  const bank = banks[format];
  if (index < 0 || index >= bank.length) return null;
  return bank[index];
}

export function getTotal(format: GameFormat): number {
  return banks[format].length;
}

export const FORMAT_LABELS: Record<GameFormat, string> = {
  quiz: "Квиз",
  truefalse: "Правда или ложь",
  flashcard: "Флеш-карточки",
  fillblank: "Заполни пропуск",
  matching: "Сопоставление",
};

export const FORMAT_DESCRIPTIONS: Record<GameFormat, string> = {
  quiz: "Выбери правильный ответ из четырёх вариантов",
  truefalse: "Определи — утверждение верно или нет",
  flashcard: "Посмотри на термин, вспомни определение и открой карточку",
  fillblank: "Вставь пропущенное слово в предложение",
  matching: "Соедини термин с правильным определением",
};
