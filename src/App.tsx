/**
 * @Date: 2019-10-11 17:41:36
 * @LastEditors: Tian Zhi
 * @LastEditTime: 2019-11-12 17:59:46
 */
import React, { useState } from "react";
import "./App.css";
import { PDFViewer } from "./PDFViewer";
// import { PDF_FILE } from "./PDFViewer/const";
// @ts-ignore
import LONG_PDF from "./assets/long-pdf.pdf";
import { PDF_FILE } from "./PDFViewer/const";
import EsignDragable, { DragObject } from "./EsignDragable/EsignDragable";
import { DragType } from "./EsignDragable";
import H5Backend from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

const DOC_URL = "https://pdfobject.com/pdf/sample-3pp.pdf";

const App: React.FC = () => {
  const [addedStamps, updateAddedStamps] = useState<DragObject[]>([]);
  return (
    <div className="App">
      <DndProvider backend={H5Backend}>
        <div className="dragable-container">
          <EsignDragable type={DragType.SignDrag} />
        </div>
        <PDFViewer
          file={LONG_PDF}
          showThumbnail={true}
          stamps={addedStamps}
          onUpdateStamps={updateAddedStamps}
        />
      </DndProvider>
    </div>
  );
};

export default App;
