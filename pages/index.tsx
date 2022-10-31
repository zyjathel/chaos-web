import { useAppStore } from "../store/store";

import { NextPage } from "next";
import { FC, useMemo, useState } from "react";
import shallow from "zustand/shallow";
import { Dataset } from "../store/store";

import classnames from "classnames";
import dynamic from "next/dynamic";
import { DatasetData } from "../components/DatasetData";

export async function getServerSideProps() {
  const res = await fetch("http://localhost:4000/datasets");
  const data = (await res.json()) as Dataset[];
  return {
    props: {
      datasets: data,
    }, // will be passed to the page component as props
  };
}

type Props<T> = {
  props: T;
};

type InferProps<T extends () => Promise<Props<any>>> = Awaited<ReturnType<T>>["props"];

type PageProps = InferProps<typeof getServerSideProps>;

const DatasetItem: FC<
  Dataset & {
    isSelected: boolean;
    onSelect: (name: string) => void;
  }
> = ({ name, updatedAt, isSelected, onSelect }) => {
  return (
    <div
      className={classnames(
        "p-4 flex flex-col font-mono cursor-pointer hover:bg-neutral-200 bg-neutral-100 relative",
        isSelected && "bg-neutral-100 shadow-sm ",
      )}
      onClick={() => {
        onSelect(name);
      }}
    >
      <div>
        {isSelected && <div className="rounded-full absolute right-2 top-2 bg-blue-600 h-2 w-2"></div>}
      </div>
      <div className=" text-lg text-gray-900 my-3"> {name}</div>
      <div className=" text-gray-500 text-xs"> Updated at {updatedAt}</div>
    </div>
  );
};

const SearchInput: FC<{ onSearch: (query: string) => void }> = ({ onSearch }) => {
  const [input, setInput] = useState<string>("");
  return (
    <div className="relative mb-4">
      <input
        className=" border-b-1 shadow-md text-gray-800 rounded-sm w-full h-10 focus:border-none font-mono py-2 px-4"
        placeholder="Search by postcode"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
      ></input>
      <button
        className=" bg-blue-600 absolute right-0 top-0 h-full px-2 text-zinc-50 rounded-sm"
        onClick={() => {
          onSearch(input);
        }}
      >
        Search
      </button>
    </div>
  );
};

const Details: FC<{}> = () => {
  const DynamicMap = useMemo(
    () =>
      dynamic(() => import("../components/Map").then((mod) => mod.Map), {
        ssr: false,
        loading: () => (
          <div className="flex h-full w-full text-lg items-center justify-center font-mono text-gray-700">
            Loading...
          </div>
        ),
      }),
    [],
  );

  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-neutral-100 text-md shadow-md border-b border-black px-4 py-2 text-gray-900">
        Map
      </div>
      <div id="map" className="h-1/2 w-full">
        <DynamicMap />
      </div>
      <div className="bg-neutral-100 text-md shadow-md border-b border-black px-4 py-2 text-gray-900">
        Data
      </div>
      <div className="h-1/2 w-full overflow-y-scroll">
        <DatasetData />
      </div>
    </div>
  );
};

const Panel: FC<{}> = () => {
  const [datasets, activeDataset, fetchDatasetMetadata, selectActiveDataset] = useAppStore(
    (state) => [state.datasets, state.activeDataset, state.fetchDatasetMetadata, state.selectActiveDataset],
    shallow,
  );

  return (
    <div className="bg-zinc-50 h-full w-1/3 overflow-y-scroll p-4 px-6">
      <SearchInput
        onSearch={(query) => {
          fetchDatasetMetadata({
            postcode: query,
          });
        }}
      />
      <div className="divide-y-2 divide-gray-500 divide-dashed gap-2">
        {datasets.length ? (
          datasets.map((ds: Dataset) => (
            <DatasetItem
              {...ds}
              key={ds.name}
              isSelected={activeDataset === ds.name}
              onSelect={selectActiveDataset}
            />
          ))
        ) : (
          <div className="text-gray-500 text-lg w-full h-1/2 flex items-center justify-center">
            No dataset available
          </div>
        )}
      </div>
    </div>
  );
};

const IndexPage: NextPage<PageProps> = ({ datasets }) => {
  const [loadDatasetMetadata] = useAppStore((state) => [state.loadDatasetMetadata], shallow);

  loadDatasetMetadata(datasets);

  return (
    <>
      <div className="w-screen h-screen flex flex-col">
        <div className="flex w-full h-full">
          <Panel />
          <Details />
        </div>
      </div>
    </>
  );
};

export default IndexPage;
