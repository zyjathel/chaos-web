import { kebabCase } from "lodash-es";
import { FC, useEffect, useState } from "react";
import shallow from "zustand/shallow";
import { Dataset, useAppStore } from "../store/store";

import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "carbon-components-react";

export const DatasetData: FC<{}> = () => {
  const [datasets, activeDataset] = useAppStore((state) => [state.datasets, state.activeDataset], shallow);
  const [data, setData] = useState<any>(null);

  const load = async () => {
    if (!activeDataset) {
      setData([]);
      return;
    }
    const res = await fetch(`http://localhost:4000/${kebabCase(activeDataset)}`);
    const ds = (await res.json()) as Dataset[];
    setData(ds);
  };

  useEffect(() => {
    load();
  }, [activeDataset]);

  if (!data?.length || !activeDataset) {
    return <></>;
  }

  const headers = Object.keys(data[0]).map((key) => ({
    key,
    id: key,
    header: key,
  }));

  return (
    <div className="text-lg">
      <DataTable
        rows={data} //@ts-ignore
        headers={headers}
      >
        {
          //@ts-ignore
          ({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map(
                    //@ts-ignore
                    (header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.key}</TableHeader>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  //@ts-ignore
                  rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
                      {row.cells.map(
                        //@ts-ignore
                        (cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ),
                      )}
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          )
        }
      </DataTable>
    </div>
  );
};
