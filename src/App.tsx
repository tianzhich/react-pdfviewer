/**
 * @Date: 2019-10-11 17:41:36
 * @LastEditors: Tian Zhi
 * @LastEditTime: 2019-11-04 20:56:23
 */
import React from "react";
import "./App.css";
import { PDFViewer } from "./PDFViewer";
// import { PDF_FILE } from "./PDFViewer/const";
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
