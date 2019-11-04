/**
 * @Date: 2019-10-11 17:41:36
 * @LastEditors: Tian Zhi
 * @LastEditTime: 2019-11-04 18:32:20
 */
import React from "react";
import "./App.css";
import { PDFViewer } from "./PDFViewer";
// import { PDF_FILE } from "./PDFViewer/const";
import LONG_PDF from './assets/long-pdf.pdf';
// const DOC_URL = "https://pdfobject.com/pdf/sample-3pp.pdf";

const App: React.FC = () => {

  return (
    <div className="App">
      <PDFViewer file={LONG_PDF} showThumbnail={true} />
    </div>
  );
};

export default App;
