import { useContext, createContext, ReactNode } from "react";
import MainStore from "./MainStore";

class RootStore {
    mainStore: MainStore;

    constructor() {
        this.mainStore = new MainStore();
    }
}

const rootStore = new RootStore();

// -------------------------

export const StoreContext = createContext<RootStore | undefined>(undefined);

export const useRootStore = () => {
    const context = useContext(StoreContext);
    if (context == undefined) throw new Error("useRootStore must be used within RootStoreProvider");
    return context;
};

export const useMainStore = () => {
    const { mainStore } = useRootStore();
    return mainStore;
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    return (
        <StoreContext.Provider value={rootStore}>
            {children}
        </StoreContext.Provider>
    );
};
