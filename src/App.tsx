import React from "react";
import "./App.css";
import { PDFViewer } from "./PDFViewer";
import { PDF_FILE } from "./PDFViewer/const";

// const DOC_URL = "https://pdfobject.com/pdf/sample-3pp.pdf";

const App: React.FC = () => {

  return (
    <div className="App">
      <PDFViewer file={PDF_FILE} showThumbnail={true} />
    </div>
  );
};

export default App;
