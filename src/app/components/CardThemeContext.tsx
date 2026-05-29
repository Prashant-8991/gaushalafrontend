import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CardTheme = "light" | "dark";

interface CardThemeContextType {
    cardTheme: CardTheme;
    toggleCardTheme: () => void;
}

const CardThemeContext = createContext<CardThemeContextType>({
    cardTheme: "light",
    toggleCardTheme: () => { },
});

const STORAGE_KEY = "gaushala-theme";

function applyTheme(theme: CardTheme) {
    if (theme === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
}

export function CardThemeProvider({ children }: { children: ReactNode }) {
    const [cardTheme, setCardTheme] = useState<CardTheme>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        applyTheme(cardTheme);
        localStorage.setItem(STORAGE_KEY, cardTheme);
    }, [cardTheme]);

    const toggleCardTheme = () => setCardTheme(t => (t === "light" ? "dark" : "light"));

    return (
        <CardThemeContext.Provider value={{ cardTheme, toggleCardTheme }}>
            {children}
        </CardThemeContext.Provider>
    );
}

export function useCardTheme() {
    return useContext(CardThemeContext);
}
