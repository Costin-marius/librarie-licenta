import React, { createContext, useState } from 'react';

export const PromoContext = createContext();

export const PromoProvider = ({ children }) => {
    // Stare initiala este true, reapare la un fresh reload (F5) asa cum s-a cerut.
    const [isBannerVisible, setIsBannerVisible] = useState(true);

    return (
        <PromoContext.Provider value={{ isBannerVisible, setIsBannerVisible }}>
            {children}
        </PromoContext.Provider>
    );
};
