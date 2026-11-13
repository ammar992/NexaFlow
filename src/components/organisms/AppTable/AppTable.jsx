"use client";
import NoDataFound from "@/components/atoms/NoDataFound/NoDataFound";
import SpinnerLoading from "@/components/atoms/SpinnerLoading/SpinnerLoading";
import Pagination from "@/components/molecules/Pagination/Pagination";
import { RECORDS_LIMIT } from "@/resources/utils/constant";
import { mediaURL } from "@/resources/utils/helper";
import clsx from "clsx";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import classes from "./AppTable.module.css";

export default function AppTable({
  tableMinWidth = "",
  onRowClick = () => {},
  onKeyClick = () => {},
  rowClassName = "",
  data = [],
  tableHeader = [],
  loading = false,
  noDataText = "Data not found",
  renderTableHeader = null,
  pagination = false,
  page,
  totalRecords,
  onPageChange,
  actions = [],
  actionStyles = {},
}) {
  const tableId = useId();
  const tableBodyRef = useRef(null);
  const tableHeaderRef = useRef(null);
  const tableContainerRef = useRef(null);
  const [tableWidth, setTableWidth] = useState("");

  const calculateTableWidth = useCallback(() => {
    const fullTableWidth = tableContainerRef.current?.offsetWidth;
    const tableBodyWidth = tableBodyRef.current?.offsetWidth;
    const tableHeaderWidth = tableHeaderRef.current?.offsetWidth;

    const minWidthCellCount =
      tableHeader.length * 180 + (actions?.length || 0) * 30;
    const minWidth = Math.max(tableMinWidth, minWidthCellCount);

    const width = Math.max(tableBodyWidth, tableHeaderWidth, minWidth);
    setTableWidth(
      width > fullTableWidth && fullTableWidth > minWidth
        ? fullTableWidth
        : width
    );
  }, [tableHeader, actions, tableMinWidth]);

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      calculateTableWidth();
    });

    if (!tableContainerRef.current) {
      return () => {
        cancelAnimationFrame(rafId);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        calculateTableWidth();
      });
    });

    resizeObserver.observe(tableContainerRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [tableHeader, actions, tableMinWidth, tableId]);

  // Recalculate when data or loading changes
  useEffect(() => {
    if (loading) return;

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        calculateTableWidth();
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [data, loading, tableHeader, actions, tableMinWidth]);

  return (
    <>
      <div
        id={tableId}
        ref={tableContainerRef}
        className={clsx(classes?.tableMainContainer)}
      >
        <div
          ref={tableHeaderRef}
          className={clsx(classes?.tableHeaderContainer)}
          style={{ width: `${tableWidth}px`, minWidth: "100%" }}
        >
          <table>
            <thead>
              <tr>
                {tableHeader?.map((item, index) => (
                  <th
                    key={index}
                    style={{
                      textAlign: "left",
                      ...(item?.style && item?.style),
                    }}
                    className={clsx(item?.headerClass && item?.headerClass)}
                  >
                    {renderTableHeader
                      ? renderTableHeader({ item: item, index })
                      : item?.title}
                  </th>
                ))}
                {actions?.length > 0 && (
                  <th
                    style={{
                      textAlign: "left",
                      ...actionStyles,
                    }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
          </table>
        </div>
        {loading ? (
          <SpinnerLoading />
        ) : (
          <div
            ref={tableBodyRef}
            className={clsx(classes?.tableBodyContainer)}
            style={{ width: `${tableWidth}px`, minWidth: "100%" }}
          >
            <table>
              <tbody>
                {data?.length ? (
                  data?.map((item, rowIndex) => {
                    return (
                      <tr
                        key={rowIndex}
                        className={clsx(
                          "row100",
                          classes.bodyRow,
                          rowClassName
                        )}
                        onClick={() => onRowClick(item, rowIndex)}
                      >
                        {tableHeader?.map(
                          (
                            { key, style, title, renderItem, image },
                            colIndex
                          ) => (
                            <td
                              key={colIndex}
                              className={classes.bodyCell}
                              style={{
                                ...(image && { paddingBlock: "10px" }),
                                textAlign: "left",
                                ...style,
                              }}
                            >
                              <div
                                className={image ? classes.imageContainer : ""}
                                style={{
                                  ...style,
                                  width: "100%",
                                }}
                              >
                                {image ? (
                                  <Image
                                    src={mediaURL(
                                      item[key] ||
                                        "/images/app-images/imageFallback.png"
                                    )}
                                    alt="image"
                                    fill
                                  />
                                ) : renderItem ? (
                                  renderItem({
                                    onClick: () => onKeyClick(item, key),
                                    item: item[key],
                                    data: item,
                                    colIndex,
                                    rowIndex,
                                    key,
                                    title,
                                  })
                                ) : (
                                  item[key] || "NA"
                                )}
                              </div>
                            </td>
                          )
                        )}
                        {actions?.length > 0 && (
                          <td
                            className={classes.bodyCell}
                            style={{
                              textAlign: "left",
                              flex: 1,
                              ...actionStyles,
                            }}
                          >
                            <div className={classes.actionContainer}>
                              {actions.map((action, index) => {
                                return (
                                  <div
                                    key={index}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action?.onClick({ data: item });
                                    }}
                                  >
                                    {action?.renderItem &&
                                      action?.renderItem({
                                        data: item,
                                      })}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={tableHeader.length}
                      style={{ textAlign: "center" }}
                    >
                      <NoDataFound text={noDataText} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {pagination && totalRecords > RECORDS_LIMIT && (
        <Pagination
          currentPage={page || 1}
          totalRecords={totalRecords}
          limit={RECORDS_LIMIT}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
