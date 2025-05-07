import React, { createContext, useState, useContext, ReactNode } from "react";

// Context 생성
interface SearchBarContextType {
  isSearchVisible: boolean;
  toggleSearch: () => void;
}

const SearchBarContext = createContext<SearchBarContextType | undefined>(
  undefined
);

// Context를 사용하기 위한 커스텀 훅
export const useSearchBar = (): SearchBarContextType => {
  const context = useContext(SearchBarContext);
  if (!context) {
    throw new Error("useSearchBar must be used within a SearchBarProvider");
  }
  return context;
};

// Context Provider 컴포넌트
export const SearchBarProvider = ({ children }: { children: ReactNode }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(true);

  const toggleSearch = () => {
    setIsSearchVisible((prev) => {
      return !prev;
    });
  };

  return (
    <SearchBarContext.Provider value={{ isSearchVisible, toggleSearch }}>
      {children}
    </SearchBarContext.Provider>
  );
};
