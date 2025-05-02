import React, { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  isRaceMode: boolean;
  toggleRaceMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isRaceMode, setIsRaceMode] = useState(false);

  const toggleRaceMode = () => {
    setIsRaceMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isRaceMode, toggleRaceMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}