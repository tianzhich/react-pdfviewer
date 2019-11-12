/**
 * @Date: 2019-10-11 18:45:52
 * @LastEditors: Tian Zhi
 * @LastEditTime: 2019-11-12 18:28:56
 */
import React, { useState, useCallback, useMemo, useRef } from "react";
import "./PDFViewer.css";
import { Document, Page, pdfjs } from "react-pdf";
import {
  FixedSizeList as List,
  ListChildComponentProps,
  FixedSizeList,
  ListOnItemsRenderedProps
} from "react-window";
import { Fab, LinearProgress as Progress } from "@material-ui/core";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  RotateLeft as ResetIcon,
  FormatListBulleted as ListIcon
} from "@material-ui/icons";
import { PDFRowItemData, PDFViewerInfo } from "./type";
import {
  INITIAL_PAGE_HEIGHT,
  INITIAL_PAGE_SCALE,
  NUMBER_PATTERN,
  SCALE_MAX_VAL,
  SCALE_MIN_VAL,
  PAGE_SCALE_INTERVAL,
  CONTAINER_HEIGHT,
  CONTAINER_WIDTH
} from "./const";
import Thumbnail from "./Thumbnail";
import { useDrop } from "react-dnd";
import { DragType, DragPosition, EsignDragable } from "src/EsignDragable";
import { DragObject } from "src/EsignDragable/EsignDragable";
import { XYCoord } from "dnd-core";
pdfjs.GlobalWorkerOptions.workerSrc = `https://static.yximgs.com/udata/pkg/KS-EFF/pdf.worker.2.1.266.js`;

type Props = ISFCPdfViewerProps;
type ScaleChangeType = "add" | "minus";

export interface ISFCPdfViewerProps {
  file: any;
  showThumbnail?: boolean;
  width?: number;
  height?: number;
  stamps?: DragObject[];
  onUpdateStamps?: (l: DragObject[]) => void;
}
export interface PDFRowProps extends ListChildComponentProps {
  data: PDFRowItemData;
}

const PDFPage = ({ index, style, data }: PDFRowProps) => {
  const { onComputeHeight, pageScale, stamps = [], onDeleteStamp } = data;
  const deleteStamp = useCallback((id: number) => {
    if (onDeleteStamp) onDeleteStamp(id);
  }, [onDeleteStamp])
  return (
    <>
      {index === 0 &&
        stamps.map(
          s =>
            s.pos && (
              <div className="stamp-container" key={s.id} style={{ top: s.pos.y, left: s.pos.x }}>
                <span className="icon-close" onClick={() => deleteStamp(s.id)}>x</span>
                <EsignDragable type={DragType.SignStamp} id={s.id} />
              </div>
            )
        )}
      <div style={style}>
        <Page
          pageNumber={index + 1}
          onRenderSuccess={() => onComputeHeight()}
          scale={pageScale}
          loading=""
        />
      </div>
    </>
  );
};

export function SFCPdfViewer(props: Props) {
  const {
    showThumbnail,
    file,
    width,
    height,
    stamps = [],
    onUpdateStamps
  } = props;
  const containerHeight = height || CONTAINER_HEIGHT;
  const containerWidth = width || CONTAINER_WIDTH;
  const [pdfInfo, setPdfInfo] = useState<PDFViewerInfo>({
    numPages: 0,
    pageHeight: INITIAL_PAGE_HEIGHT,
    pageScale: INITIAL_PAGE_SCALE
  });
  const { pageNum, numPages, pageHeight, title, pageScale } = pdfInfo;
  const pageNumStr = useMemo(() => (pageNum === 0 ? "" : `${pageNum}`), [
    pageNum
  ]);
  const listRef = useRef<FixedSizeList | null>(null);
  // props的showThumbnail指是否渲染，state则表示显示状态
  const [thumbnailVisible, toggleThumbnailVisible] = useState(false);

  const handleChangePageNumber = useCallback(
    (val: string, onBlur?: boolean, onPressEnter?: boolean) => {
      const isNum = NUMBER_PATTERN.test(val);
      if (isNum || val === "") {
        // 焦点散失时如果为空值，要默认设置为第1页
        const pageNum = onBlur && val === "" ? 1 : Number(val);
        setPdfInfo(prev => ({ ...prev, pageNum }));
        if (listRef.current && onBlur) {
          const numVal = pageNum - 1;
          listRef.current.scrollToItem(numVal, "start");
        }
      }
    },
    []
  );

  // 初始化之后计算页高
  const computePdfPageHeight = useCallback(() => {
    const pdfPageEl = document.querySelector(
      ".pdf-viewer-page-list .react-pdf__Page"
    );
    if (pdfPageEl) {
      const pageClient = pdfPageEl.getBoundingClientRect();
      const computedHeight = pageClient.height + 10;
      if (computedHeight === pageHeight) {
        return;
      }
      setPdfInfo(prev => ({ ...prev, pageHeight: computedHeight }));
    }
  }, [pageHeight]);

  // 点击缩略图页面跳转
  const handleClickThumbnailItem = useCallback((index: number) => {
    if (listRef.current) {
      listRef.current.scrollToItem(index, "start");
    }
  }, []);

  // 监听scroll并更新pageNum
  const handleItemsRendered = useCallback(
    (props: ListOnItemsRenderedProps) => {
      const curPageNum = props.visibleStartIndex + 1;
      if (curPageNum !== pageNum) {
        setPdfInfo({ ...pdfInfo, pageNum: curPageNum });
      }
    },
    [pageNum, pdfInfo]
  );

  const handleScaleChange = useCallback(
    (t: ScaleChangeType) => {
      if (
        (pageScale >= SCALE_MAX_VAL && t === "add") ||
        (pageScale <= SCALE_MIN_VAL && t === "minus")
      ) {
        return;
      }
      if (t === "add") {
        setPdfInfo(prevInfo => ({
          ...prevInfo,
          pageScale: prevInfo.pageScale + PAGE_SCALE_INTERVAL
        }));
      } else {
        setPdfInfo(prevInfo => ({
          ...prevInfo,
          pageScale: prevInfo.pageScale - PAGE_SCALE_INTERVAL
        }));
      }
    },
    [pageScale]
  );

  const handleShowThumbnail = useCallback(() => {
    toggleThumbnailVisible(true);
  }, []);
  const handleMainClick = useCallback(() => {
    toggleThumbnailVisible(false);
  }, []);

  // 新增拖拽印章时，计算印章相对位置
  const getStampPosition = useCallback((initOffset: XYCoord | null) => {
    const el = document.querySelector(".pdf-viewer-page-list > div");
    if (el && initOffset) {
      const { x, y } = initOffset;
      const { top, left } = el.getBoundingClientRect();
      return { x: x - left, y: y - top };
    }
    return null;
  }, []);

  const addStamp = useCallback((id: number, pos: DragPosition) => {
    const newStamps: DragObject[] = [
      ...stamps,
      { id, pos, type: DragType.SignStamp }
    ];
    if (onUpdateStamps) onUpdateStamps(newStamps);
  }, [stamps, onUpdateStamps]);
  const moveStamp = useCallback((id: number, posMoved: DragPosition) => {
    const editStamp = stamps.find(s => s.id === id);
    if (editStamp && editStamp.pos) {
      const prevPos = editStamp.pos;
      const newPos: DragPosition = {
        x: prevPos.x + posMoved.x,
        y: prevPos.y + posMoved.y
      };
      editStamp.pos = newPos;
      const newStamps = stamps.map(s => (s.id === id ? editStamp : s));
      if (onUpdateStamps) onUpdateStamps(newStamps);
    }
  }, [stamps, onUpdateStamps]);
  const deleteStamp = useCallback((id: number) => {
    const newStamps = stamps.filter(s => s.id !== id);
    if (onUpdateStamps) onUpdateStamps(newStamps);
  }, [stamps, onUpdateStamps])
  const [, dropWrapper] = useDrop<DragObject, {}, {}>({
    accept: [DragType.SignDrag, DragType.SignStamp],
    drop: (item, monitor) => {
      const { type, id } = item;
      if (type === DragType.SignDrag) {
        // Add Stamp
        const initOffset = monitor.getSourceClientOffset();
        const initPos = getStampPosition(initOffset);
        const id = new Date().getTime();
        if (initOffset && initPos) {
          addStamp(id, initPos);
          console.log('added! pos:', id, initPos);
          return item;
        }
      } else if (type === DragType.SignStamp) {
        // Move stamp
        const offsetDiff = monitor.getDifferenceFromInitialOffset();
        if (offsetDiff) {
          moveStamp(id, offsetDiff);
          console.log('moved! posOffset:', id, offsetDiff);
          return item;
        }
      }
      return undefined;
    }
  });

  // pass props to PDFRow & PDFThumbnail
  const rowItemData: PDFRowItemData = useMemo(
    () => ({
      onComputeHeight: computePdfPageHeight,
      pageScale,
      stamps,
      onDeleteStamp: deleteStamp
    }),
    [computePdfPageHeight, pageScale, stamps, deleteStamp]
  );

  return (
    <div
      className="pdf-viewer-container"
      style={{ height: containerHeight, width: containerWidth }}
    >
      <Document
        file={file}
        className="pdf-viewer"
        onLoadSuccess={pdfDocProxy => {
          const { numPages } = pdfDocProxy;
          pdfDocProxy.getMetadata().then(res => {
            const {
              info: { Title }
            } = res;
            setPdfInfo(prev => ({
              ...prev,
              title: Title,
              pageNum: 1,
              numPages
            }));
          });
        }}
        onLoadError={error =>
          console.log("Error while loading document! " + error.message)
        }
        loading={<Progress />}
      >
        <div className="pdf-viewer-header">
          <span className="title">{title}</span>
          <span className="nav">
            <input
              value={pageNumStr}
              onChange={e => handleChangePageNumber(e.target.value)}
              onBlur={e => handleChangePageNumber(e.target.value, true)}
              onKeyPress={e => {
                if (e.key === "Enter") {
                  e.target.dispatchEvent(new Event("blur"));
                }
              }}
            />
            / {numPages}
          </span>
        </div>
        <div className="pdf-viewer-action-btns">
          <Fab className="btn-list" onClick={handleShowThumbnail}>
            <ListIcon />
          </Fab>
          <Fab onClick={() => setPdfInfo({ ...pdfInfo, pageScale: 1 })}>
            <ResetIcon />
          </Fab>
          <Fab onClick={() => handleScaleChange("add")}>
            <AddIcon />
          </Fab>
          <Fab onClick={() => handleScaleChange("minus")}>
            <RemoveIcon />
          </Fab>
        </div>
        <div className="pdf-viewer-main" onClick={handleMainClick} ref={dropWrapper}>
          <List
            height={containerHeight}
            itemCount={numPages}
            itemSize={pageHeight}
            itemData={rowItemData}
            width={"100%"}
            className="pdf-viewer-page-list"
            ref={listRef}
            // onScroll={handleScroll}
            onItemsRendered={handleItemsRendered}
          >
            {PDFPage}
          </List>
        </div>
        <div className="pdf-viewer-side">
          {showThumbnail && (
            <Thumbnail
              numPages={numPages}
              onClickThumbnail={handleClickThumbnailItem}
              show={thumbnailVisible}
              height={containerHeight}
            />
          )}
        </div>
      </Document>
    </div>
  );
}

export default SFCPdfViewer;
