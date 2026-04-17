import { createContext, useContext, useState, ReactNode } from "react";

type CardTheme = "light" | "dark";

interface CardThemeContextType {
    cardTheme: CardTheme;
    toggleCardTheme: () => void;
}

const CardThemeContext = createContext<CardThemeContextType>({
    cardTheme: "light",
    toggleCardTheme: () => { },
});

export function CardThemeProvider({ children }: { children: ReactNode }) {
    const [cardTheme, setCardTheme] = useState<CardTheme>("light");
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
