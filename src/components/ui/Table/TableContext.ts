import React from "react";

export interface TableContextValue {
    columnCount: number;
    setColumnCount: React.Dispatch<React.SetStateAction<number>>;
    radius?: number;
}

export const TableContext = React.createContext<TableContextValue>({
    columnCount: 0,
    setColumnCount: () => {},
    radius: 8
});
