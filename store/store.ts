import create from "zustand";
import { devtools, persist } from "zustand/middleware";
// import { immer } from "zustand/middleware/immer";
import produce from "immer";
import React from "react";
import { Table } from "@fluentui/react-northstar";

export type Dataset = {
  name: string;
  updatedAt: string;
};

export type AppState = {
  activeDataset: null | string;
  datasets: Dataset[];
  loadDatasetMetadata: (metadata: Dataset[]) => void;
  fetchDatasetMetadata: (filter?: Partial<{ postcode: string }>) => Promise<void>;
  selectActiveDataset: (name: string) => void;
};

export const useAppStore = create<AppState>()(
  // immer(
  devtools(
    persist(
      (set) => ({
        activeDataset: null,
        datasets: [],
        loadDatasetMetadata: (metadata) => {
          set(
            produce((state) => {
              state.datasets = metadata;
            }),
          );
        },
        fetchDatasetMetadata: async (filter) => {
          const url = new URL("http://localhost:4000/datasets");
          if (filter) {
            if (filter.postcode) {
              url.searchParams.set("code", filter.postcode);
            }
          }
          const res = await fetch(url.toString());
          const data = (await res.json()) as Dataset[];
          set(
            produce((state) => {
              state.datasets = data;
              state.activeDataset = data[0]?.name ?? null;
            }),
          );
        },
        selectActiveDataset: (name) => {
          set(
            produce((state) => {
              state.activeDataset = name;
            }),
          );
        },
      }),

      { name: "store", getStorage: () => localStorage },
    ),
  ),
  // ),
);
