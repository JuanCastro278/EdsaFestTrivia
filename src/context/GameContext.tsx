
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
} from "react";
import type { User, Trivia, Player, Prize, GlobalConfig } from "@/lib/types";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  getDoc,
  setDoc,
} from "firebase/firestore";

const PLAYER_STORAGE_KEY = "edsafest_player";
const CURRENT_QUESTION_INDEX_KEY = "edsafest_current_question_index";


// === Helpers localStorage ===
const getPlayerFromStorage = (): Player | null => {
  if (typeof window === "undefined") return null;
  try {
    const item = window.localStorage.getItem(PLAYER_STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn(`Error reading localStorage key “${PLAYER_STORAGE_KEY}”:`, error);
    return null;
  }
};

const setPlayerToStorage = (player: Player | null) => {
  if (typeof window === "undefined") return;
  try {
    if (player) {
      window.localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
    } else {
      window.localStorage.removeItem(PLAYER_STORAGE_KEY);
    }
  } catch (error) {
    console.warn(`Error setting localStorage key “${PLAYER_STORAGE_KEY}”:`, error);
  }
};

const getCurrentQuestionIndexFromStorage = (): number => {
  if (typeof window === "undefined") return 0;
  try {
    const item = window.localStorage.getItem(CURRENT_QUESTION_INDEX_KEY);
    const index = item ? parseInt(item, 10) : 0;
    return !isNaN(index) ? index : 0;
  } catch (error) {
    console.warn(`Error reading localStorage key “${CURRENT_QUESTION_INDEX_KEY}”:`, error);
    return 0;
  }
};

const setCurrentQuestionIndexToStorage = (index: number) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CURRENT_QUESTION_INDEX_KEY, String(index));
  } catch (error) {
    console.warn(`Error setting localStorage key “${CURRENT_QUESTION_INDEX_KEY}”:`, error);
  }
};

// === Context Type ===
interface GameContextType {
  // Firestore state
  users: User[];
  trivias: Trivia[];
  prizes: Prize[];
  globalConfig: GlobalConfig | null;

  // Derivados de config (para compatibilidad con tu UI actual)
  activeTriviaIds: string[];
  raffleEnabled: boolean;
  prizeUrlsEnabled: boolean;
  triviaPointsLimit: number | null;

  // Local state
  player: Player | null;
  setPlayer: (player: Player | null) => void;
  showPasswordChange: boolean;
  setShowPasswordChange: Dispatch<SetStateAction<boolean>>;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (indexOrUpdater: number | ((prevIndex: number) => number)) => void;

  // Admin actions
  addUser: (user: {
    legajo: string;
    username: string;
    password: string;
    userType: "empleado" | "invitado";
    seniorityScore: number;
  }) => Promise<{ success: boolean; message?: string }>;
  deleteUser: (userId: string) => Promise<void>;
  updateUserScore: (userId: string, amount: number) => Promise<void>;
  updateUserPeladoScore: (userId: string, amount: number) => Promise<void>;
  updateUserRaffleScore: (userId: string, amount: number) => Promise<void>;
  resetUserPassword: (userId: string) => Promise<void>;

  addOrUpdateTrivia: (trivia: Omit<Trivia, "id"> & { id?: string }) => Promise<void>;
  deleteTrivia: (triviaId: string) => Promise<void>;
  addOrUpdatePrize: (prize: Omit<Prize, 'id'> & { id?: string }) => Promise<void>;
  deletePrize: (prizeId: string) => Promise<void>;
  updateGlobalConfig: (newConfig: Partial<GlobalConfig>) => Promise<void>;
  resetTriviaForAllUsers: (triviaId: string) => Promise<void>;

  // User actions
  changeUserPassword: (username: string, newPassword: string) => Promise<void>;
  submitAnswer: (
    userId: string,
    triviaId: string,
    questionId: string,
    answer: string | null
  ) => Promise<void>;
  finalizeTrivia: (userId: string, triviaId: string) => Promise<void>;
  selectRaffleNumber: (userId: string, number: number) => Promise<boolean>;

  // Local UI helpers
  setInitialScore: () => void;
  clearPreviousScore: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // === Firestore-backed state ===
  const [users, setUsers] = useState<User[]>([]);
  const [trivias, setTrivias] = useState<Trivia[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig | null>(null);

  // === Local state ===
  const [player, _setPlayer] = useState<Player | null>(getPlayerFromStorage);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentQuestionIndex, _setCurrentQuestionIndex] = useState(getCurrentQuestionIndexFromStorage);

  // === Listeners Firestore ===
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const data: User[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as User));
      setUsers(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "trivias"), (snapshot) => {
      const data: Trivia[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Trivia));
      setTrivias(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "prizes"), (snapshot) => {
      const data: Prize[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Prize));
      setPrizes(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const configRef = doc(db, "config", "global");
    const unsubscribe = onSnapshot(configRef, async (snap) => {
      if (snap.exists()) {
        setGlobalConfig(snap.data() as GlobalConfig);
      } else {
        const defaultConfig: GlobalConfig = {
          activeTriviaIds: [],
          raffleEnabled: false,
          prizeUrlsEnabled: true,
          triviaPointsLimit: null,
        };
        await setDoc(configRef, defaultConfig);
        setGlobalConfig(defaultConfig);
      }
    });
    return () => unsubscribe();
  }, []);

  // === Enhanced State Setters for localStorage persistence ===
  const setPlayer = useCallback(
    (newPlayer: Player | null) => {
      setPlayerToStorage(newPlayer);
      _setPlayer(newPlayer);

      if (newPlayer) {
        const userProfile = users.find((u) => u.username === newPlayer.username);
        if (userProfile?.password === "EDSA2025" && userProfile.role === "user") {
          setShowPasswordChange(true);
        }
      } else {
        setShowPasswordChange(false);
      }
    },
    [users]
  );
  
  const setCurrentQuestionIndex = useCallback((indexOrUpdater: number | ((prevIndex: number) => number)) => {
    _setCurrentQuestionIndex(prevIndex => {
        const newIndex = typeof indexOrUpdater === 'function' ? indexOrUpdater(prevIndex) : indexOrUpdater;
        setCurrentQuestionIndexToStorage(newIndex);
        return newIndex;
    });
  }, []);


  // === Local UI helpers ===
  const setInitialScore = useCallback(() => {
    _setPlayer((p) => (p ? { ...p, previousScore: p.score } : null));
  }, []);

  const clearPreviousScore = useCallback(() => {
    _setPlayer((p) => {
      if (!p || p.previousScore === undefined) return p;
      const { previousScore, ...rest } = p as any;
      return rest;
    });
  }, []);

  // === Admin: Users ===
  const addUser = useCallback(
    async (user: {
      legajo: string;
      username: string;
      password: string;
      userType: "empleado" | "invitado";
      seniorityScore: number;
    }) => {
      const q = query(collection(db, "users"), where("legajo", "==", user.legajo));
      const existing = await getDocs(q);
      if (!existing.empty) {
        return { success: false, message: "El DNI ya está registrado." };
      }

      const newUser: Omit<User, "id"> = {
        legajo: user.legajo,
        username: user.username,
        password: user.password,
        role: "user",
        userType: user.userType,
        score: user.seniorityScore || 0,
        seniorityScore: user.seniorityScore || 0,
        peladoScore: 0,
        raffleScore: 0,
        lastLogin: null,
        completedTrivias: [],
        answers: {},
        raffleNumber: null,
      };

      await addDoc(collection(db, "users"), newUser);
      return { success: true };
    },
    []
  );

  const deleteUser = async (userId: string) => {
    if (!userId) return;
    await deleteDoc(doc(db, "users", userId));
  };
  
  const updateUserScore = async (userId: string, amount: number) => {
    if (!userId) return;
    await updateDoc(doc(db, "users", userId), {
      score: increment(amount),
    });
  };

  const updateUserPeladoScore = async (userId: string, amount: number) => {
    if (!userId) return;
    await updateDoc(doc(db, "users", userId), {
      peladoScore: increment(amount),
      score: increment(amount),
    });
  };

  const updateUserRaffleScore = async (userId: string, amount: number) => {
    if (!userId) return;
    await updateDoc(doc(db, "users", userId), {
      raffleScore: increment(amount),
      score: increment(amount),
    });
  };

  const resetUserPassword = async (userId: string) => {
    if (!userId) return;
    await updateDoc(doc(db, "users", userId), {
      password: "EDSA2025",
    });
  };

  // === Admin: Trivias / Prizes / Config ===
  const addOrUpdateTrivia = async (triviaData: Omit<Trivia, "id"> & { id?: string }) => {
    const { id, ...dataToSave } = triviaData;
    if (id) {
      const triviaRef = doc(db, "trivias", id);
      await updateDoc(triviaRef, dataToSave);
    } else {
      await addDoc(collection(db, "trivias"), dataToSave);
    }
  };

  const deleteTrivia = async (triviaId: string) => {
    await deleteDoc(doc(db, "trivias", triviaId));
    await updateGlobalConfig({ activeTriviaIds: arrayRemove(triviaId) });
  };

  const addOrUpdatePrize = async (prizeData: Omit<Prize, 'id'> & { id?: string }) => {
    if (prizeData.id) {
        const prizeRef = doc(db, "prizes", prizeData.id);
        await updateDoc(prizeRef, prizeData);
    } else {
        await addDoc(collection(db, "prizes"), prizeData);
    }
  };

  const deletePrize = async (prizeId: string) => {
    await deleteDoc(doc(db, "prizes", prizeId));
  };

  const updateGlobalConfig = async (newConfig: Partial<GlobalConfig>) => {
    const configRef = doc(db, "config", "global");
    await updateDoc(configRef, newConfig);
  };

  const resetTriviaForAllUsers = async (triviaId: string) => {
    const batch = writeBatch(db);
    users.forEach((user) => {
      if (user.id && user.completedTrivias?.includes(triviaId)) {
        const userRef = doc(db, "users", user.id);
        batch.update(userRef, {
          completedTrivias: arrayRemove(triviaId),
        });
      }
    });
    await batch.commit();
  };

  // === Player actions ===
  const changeUserPassword = async (username: string, newPassword: string) => {
    const user = users.find(u => u.username === username);
    if (!user || !user.id) return;
    await updateDoc(doc(db, "users", user.id), {
      password: newPassword,
    });
  };

  const submitAnswer = async (
    userId: string,
    triviaId: string,
    questionId: string,
    answer: string | null
  ) => {
    const user = users.find((u) => u.id === userId);
    const trivia = trivias.find((t) => t.id === triviaId);
    const question = trivia?.questions.find((q) => q.id === questionId);
    
    if (!user || !trivia || !question) return;

    const userRef = doc(db, "users", userId);
    const isCorrect = question.correctAnswer === answer;
    let scoreGained = 0;

    if (isCorrect) {
      const currentTriviaPoints = (user.score || 0) - (user.seniorityScore || 0) - (user.peladoScore || 0) - (user.raffleScore || 0);

      if (
        globalConfig?.triviaPointsLimit === null ||
        globalConfig?.triviaPointsLimit === undefined ||
        currentTriviaPoints < globalConfig.triviaPointsLimit
      ) {
        scoreGained = question.points || 0;
      }
    }

    const answerPath = `answers.${triviaId}.${questionId}`;
    await updateDoc(userRef, {
      [answerPath]: isCorrect,
      score: increment(scoreGained),
    });
  };

  const finalizeTrivia = async (userId: string, triviaId: string) => {
    if (!userId) return;
    await updateDoc(doc(db, "users", userId), {
      completedTrivias: arrayUnion(triviaId),
    });
  };

  const selectRaffleNumber = async (
    userId: string,
    number: number
  ): Promise<boolean> => {
    if (!userId) return false;

    const userRef = doc(db, "users", userId);
    const qSnap = await getDocs(
      query(collection(db, "users"), where("raffleNumber", "==", number))
    );

    if (!qSnap.empty) {
      const someoneElse = qSnap.docs.find((d) => d.id !== userId);
      if (someoneElse) return false;
    }

    await updateDoc(userRef, { raffleNumber: number });
    return true;
  };

  // === Derivados de globalConfig ===
  const activeTriviaIds = globalConfig?.activeTriviaIds || [];
  const raffleEnabled = globalConfig?.raffleEnabled ?? false;
  const prizeUrlsEnabled = globalConfig?.prizeUrlsEnabled ?? true;
  const triviaPointsLimit = globalConfig?.triviaPointsLimit ?? null;

  const value: GameContextType = {
    users,
    trivias,
    prizes,
    globalConfig,
    activeTriviaIds,
    raffleEnabled,
    prizeUrlsEnabled,
    triviaPointsLimit,

    player,
    setPlayer,
    showPasswordChange,
    setShowPasswordChange,
    currentQuestionIndex,
    setCurrentQuestionIndex,

    addUser,
    deleteUser,
    updateUserScore,
    updateUserPeladoScore,
    updateUserRaffleScore,
    resetUserPassword,

    addOrUpdateTrivia,
    deleteTrivia,
    addOrUpdatePrize,
    deletePrize,
    updateGlobalConfig,
    resetTriviaForAllUsers,

    changeUserPassword,
    submitAnswer,
    finalizeTrivia,
    selectRaffleNumber,

    setInitialScore,
    clearPreviousScore,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
