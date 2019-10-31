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
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type Props = ISFCPdfViewerProps;

export interface ISFCPdfViewerProps {}

interface PDFViewerInfo {
  pageNum?: number; // 当前页码
  numPages: number; // 总页数
  pageHeight: number; // 页高
  title?: string; // PDF标题
}

const NUMBER_PATTERN = /^[1-9][0-9]*$/;
// 初始PDF页面高度，注意：不能设置为0，为0时无法render page
const INITIAL_PAGE_HEIGHT = 1;

const pdfFile = "https://pdfobject.com/pdf/sample-3pp.pdf";

const PDFRow = ({ index, style, data }: ListChildComponentProps) => (
  <div style={style}>
    <Page pageNumber={index + 1} onRenderSuccess={data.onComputeHeight} />
  </div>
);

export function SFCPdfViewer(props: Props) {
  const [pdfInfo, setPdfInfo] = useState<PDFViewerInfo>({
    numPages: 0,
    pageHeight: INITIAL_PAGE_HEIGHT
  });
  const { pageNum, numPages, pageHeight, title } = pdfInfo;
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

  const computePdfPageHeight = useCallback(() => {
    const pdfPageEl = document.querySelector(".react-pdf__Page");
    const heightExist = pageHeight !== INITIAL_PAGE_HEIGHT;
    if (heightExist) {
      return;
    }
    if (pdfPageEl) {
      const pageClient = pdfPageEl.getBoundingClientRect();
      const computedHeight = pageClient.height + 10;
      setPdfInfo(prev => ({ ...prev, pageHeight: computedHeight }));
    }
  }, [pageHeight]);

  const itemData = useMemo(() => ({ onComputeHeight: computePdfPageHeight }), [
    computePdfPageHeight
  ]);

  const handleItemsRendered = useCallback(
    (props: ListOnItemsRenderedProps) => {
      const curPageNum = props.visibleStartIndex + 1;
      if (curPageNum !== pageNum) {
        setPdfInfo({ ...pdfInfo, pageNum: curPageNum });
      }
    },
    [pageNum, pdfInfo]
  );

  return (
    <Document
      file={pdfFile}
      className="k-common-pdf-viewer"
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
        alert("Error while loading document! " + error.message)
      }
    >
      <div className="k-common-pdf-viewer-header">
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
      <List
        height={720}
        itemCount={numPages}
        itemSize={pageHeight}
        itemData={itemData}
        width={"100%"}
        className="k-common-pdf-viewer-page-list"
        ref={listRef}
        // onScroll={handleScroll}
        onItemsRendered={handleItemsRendered}
      >
        {PDFRow}
      </List>
    </Document>
  );
}

export default SFCPdfViewer;
