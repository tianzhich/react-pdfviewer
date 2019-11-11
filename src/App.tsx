/**
 * @Date: 2019-10-11 17:41:36
 * @LastEditors: Tian Zhi
 * @LastEditTime: 2019-11-11 17:25:21
 */
import React from "react";
import "./App.css";
import { PDFViewer } from "./PDFViewer";
// import { PDF_FILE } from "./PDFViewer/const";
// @ts-ignore
import LONG_PDF from './assets/long-pdf.pdf';
import { PDF_FILE } from "./PDFViewer/const";
const DOC_URL = "https://pdfobject.com/pdf/sample-3pp.pdf";

const App: React.FC = () => {

  return (
    <div className="App">
      <PDFViewer file={LONG_PDF} showThumbnail={true} />
    </div>
  );
};

export default App;
