import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  ComponentClass
} from "react";
import "./PDFViewer.css";
import { Document, Page, pdfjs } from "react-pdf";
import {
  FixedSizeList as List,
  ListChildComponentProps,
  FixedSizeList,
  ListOnScrollProps,
  ListOnItemsRenderedProps
} from "react-window";
import Fab from "@material-ui/core/Fab";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  RotateLeft as ResetIcon,
  FormatListBulleted as ListIcon
} from "@material-ui/icons";
import { usePrevious } from "./myHooks";
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
interface PDFRowProps extends ListChildComponentProps {
  data: PDFRowItemData;
}

const NUMBER_PATTERN = /^[1-9][0-9]*$/;
// 初始PDF页面高度，注意：不能设置为0，为0时无法render page
const INITIAL_PAGE_HEIGHT = 1;
const INITIAL_PAGE_SCALE = 1.0;
// pageScale变化范围
const PAGE_SCALE_INTERVAL = 0.1;
const pdfFile = "https://pdfobject.com/pdf/sample-3pp.pdf";
const THUMBNAIL_HEIGHT = 120;

const PDFRow = ({ index, style, data }: PDFRowProps) => {
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
const PDFThumbnail = ({ index, style }: PDFRowProps) => {
  return (
    <div style={style}>
      <Page
        pageNumber={index + 1}
        height={THUMBNAIL_HEIGHT}
      />
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

  // pass props to PDFRow
  const itemData: PDFRowItemData = useMemo(
    () => ({ onComputeHeight: computePdfPageHeight, pageScale }),
    [computePdfPageHeight, pageScale]
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
        (pageScale >= 2 && t === "add") ||
        (pageScale <= 0.5 && t === "minus")
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
        <Fab className="btn-list">
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
      <List
        height={720}
        itemCount={numPages}
        itemSize={pageHeight}
        itemData={itemData}
        width={"100%"}
        className="pdf-viewer-page-list"
        ref={listRef}
        // onScroll={handleScroll}
        onItemsRendered={handleItemsRendered}
      >
        {PDFRow}
      </List>
      <List
        height={720}
        itemCount={numPages}
        itemSize={THUMBNAIL_HEIGHT+10}
        width={180}
        className="pdf-viewer-thumbnail"
      >
        {PDFThumbnail}
      </List>
    </Document>
  );
}

export default SFCPdfViewer;
