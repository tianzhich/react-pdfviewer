import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import "./PDFViewer.css";
import { Document, Page, pdfjs } from "react-pdf";
import {
  FixedSizeList as List,
  ListChildComponentProps,
  FixedSizeList,
  ListOnItemsRenderedProps
} from "react-window";
import Fab from "@material-ui/core/Fab";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  RotateLeft as ResetIcon,
  FormatListBulleted as ListIcon
} from "@material-ui/icons";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type Props = ISFCPdfViewerProps;
type ScaleChangeType = "add" | "minus";

export interface ISFCPdfViewerProps {}
interface PDFViewerInfo {
  pageNum?: number; // 当前页码
  numPages: number; // 总页数
  pageHeight: number; // 页高
  title?: string; // PDF标题
  pageScale: number;
}
interface PDFRowItemData {
  onComputeHeight: (isThumbnail?: boolean) => void;
  pageScale: number;
}
interface PDFThumbnailItemData {
  onClickThumbnail: (index: number) => void;
}
interface PDFRowProps extends ListChildComponentProps {
  data: PDFRowItemData;
}
interface PDFThumbnailProps extends ListChildComponentProps {
  data: PDFThumbnailItemData
}

const NUMBER_PATTERN = /^[1-9][0-9]*$/;

// 初始PDF页面高度，注意：不能设置为0，为0时无法render page
const INITIAL_PAGE_HEIGHT = 1;

// page scale
const INITIAL_PAGE_SCALE = 1.0;
const SCALE_MAX_VAL = 2;
const SCALE_MIN_VAL = 0.5;
// pageScale变化范围
const PAGE_SCALE_INTERVAL = 0.1;

// width & height
const CONTAINER_HEIGHT = 720;
const HEADER_HEIGHT = 50;
const THUMBNAIL_ITEM_HEIGHT = 128;
const THUMBNAIL_HEIGHT = CONTAINER_HEIGHT - HEADER_HEIGHT;
const THUMBNAIL_WIDTH = 150;

const pdfFile = "https://pdfobject.com/pdf/sample-3pp.pdf";

const PDFPage = ({ index, style, data }: PDFRowProps) => {
  const { onComputeHeight, pageScale } = data;
  return (
    <div style={style}>
      <Page
        pageNumber={index + 1}
        onRenderSuccess={() => onComputeHeight()}
        scale={pageScale}
      />
    </div>
  );
};
const PDFThumbnail = ({ index, style, data }: PDFThumbnailProps) => {
  const { onClickThumbnail } = data;
  return (
    <div style={style}>
      <div className="thumbnail-item" onClick={() => onClickThumbnail(index)}>
        <Page pageNumber={index + 1} height={THUMBNAIL_ITEM_HEIGHT} renderTextLayer={false} />
      </div>
      <div className="thumbnail-page-num">{index+1}</div>
    </div>
  );
};

export function SFCPdfViewer(props: Props) {
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
  const [showThumbnail, toggleShowThumbnail] = useState(false);

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
  }, [])

  // pass props to PDFRow & PDFThumbnail
  const rowItemData: PDFRowItemData = useMemo(
    () => ({ onComputeHeight: computePdfPageHeight, pageScale }),
    [computePdfPageHeight, pageScale]
  );
  const thumbnailItemData: PDFThumbnailItemData = useMemo(
    () => ({ onClickThumbnail: handleClickThumbnailItem }),
    [handleClickThumbnailItem]
  );

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
    toggleShowThumbnail(true);
  }, []);
  const handleMainClick = useCallback(() => {
    toggleShowThumbnail(false);
  }, []);

  return (
    <Document
      file={pdfFile}
      className="pdf-viewer"
      onLoadSuccess={pdfDocProxy => {
        const { numPages } = pdfDocProxy;
        pdfDocProxy.getMetadata().then(res => {
          const {
            info: { Title }
          } = res;
          setPdfInfo(prev => ({ ...prev, title: Title, pageNum: 1, numPages }));
        });
      }}
      onLoadError={error =>
        console.log("Error while loading document! " + error.message)
      }
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
      <div className="pdf-viewer-main" onClick={handleMainClick}>
        <List
          height={CONTAINER_HEIGHT}
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
        <List
          height={THUMBNAIL_HEIGHT}
          itemCount={numPages}
          itemSize={THUMBNAIL_ITEM_HEIGHT + 20}
          itemData={thumbnailItemData}
          width={THUMBNAIL_WIDTH}
          className={`pdf-viewer-thumbnail ${!showThumbnail ? "hidden" : ""}`}
        >
          {PDFThumbnail}
        </List>
      </div>
    </Document>
  );
}

export default SFCPdfViewer;
